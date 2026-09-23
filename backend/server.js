const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const crypto = require('crypto');
const express = require('express');
const { pool, testConnection, initDatabase, ensureTables } = require('./db');
const { recommendCourses, getSubjectAreaScores } = require('./recommendationEngine');

const app = express();
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT || 3000);
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'dev-secret-change-me';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || 'http://localhost:3000';
const OPENROUTER_SITE_NAME = process.env.OPENROUTER_SITE_NAME || 'GIST Mentoring System';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const liveFeedbackStore = new Map();
let cachedGeminiModel = null;
let cachedGeminiModelAt = 0;

app.use(express.json({ limit: '1mb' }));

function getLiveFeedback(rollNo) {
  return liveFeedbackStore.get(String(rollNo || '').trim()) || [];
}

function addLiveFeedback(rollNo, feedback) {
  const key = String(rollNo || '').trim();
  const list = getLiveFeedback(key);
  list.unshift(feedback);
  liveFeedbackStore.set(key, list.slice(0, 100));
}

function parseJsonField(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch (_) { return fallback; }
  }
  return value;
}

// Map DB row (snake_case) to API (camelCase)
function rowToStudent(r) {
  if (!r) return null;
  const rec = parseJsonField(r.academic_records, []);
  const ints = parseJsonField(r.interests, null);
  const swot = parseJsonField(r.swot, null);
  return {
    rollNo: r.roll_no,
    password: r.password,
    name: r.name,
    cgpa: r.cgpa != null ? Number(r.cgpa) : null,
    mentorId: r.mentor_id,
    mentor: r.mentor,
    department: r.department,
    year: r.year,
    regulationId: r.regulation_id,
    interests: ints,
    careerGoal: r.career_goal,
    aspirations: r.aspirations || '',
    swot,
    academicRecords: rec
  };
}

function rowToMentor(r) {
  if (!r) return null;
  return {
    id: r.id,
    password: r.password,
    name: r.name,
    department: r.department,
    students: r.students != null ? Number(r.students) : 0
  };
}

function rowToAdmin(r) {
  if (!r) return null;
  return { id: r.id, password: r.password, name: r.name, role: r.role || 'branch_admin', branch: r.branch || null };
}

function sanitizeUser(user, userType) {
  if (!user) return null;
  const { password, ...safe } = user;
  return { ...safe, userType };
}

function databaseErrorMessage(e, fallback = 'Database error') {
  const code = e && e.code ? String(e.code) : '';
  const raw = e && e.message ? String(e.message) : '';
  if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT') {
    return 'Cannot connect to MySQL. Check that MySQL is running and backend/db.js credentials.';
  }
  if (code === 'ER_ACCESS_DENIED_ERROR') {
    return 'MySQL access denied. Check MYSQL_USER and MYSQL_PASSWORD in backend/.env (or backend/db.js fallback).';
  }
  if (code === 'ER_BAD_DB_ERROR') {
    return 'Database does not exist. Create gist_mentoring_system or restart backend to auto-create.';
  }
  if (code === 'ER_NO_SUCH_TABLE') {
    return 'Required tables are missing. Restart backend or run backend/schema.sql.';
  }
  if (code === 'ER_BAD_FIELD_ERROR') {
    return 'Database schema mismatch. Restart backend so auto-migration can add missing columns.';
  }
  if (raw) return `${fallback}: ${raw.substring(0, 180)}`;
  return fallback;
}

function signToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const enc = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const headerB64 = enc(header);
  const payloadB64 = enc(payload);
  const data = `${headerB64}.${payloadB64}`;
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sig] = parts;
  const data = `${headerB64}.${payloadB64}`;
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(data).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function authMiddleware(requiredType = null) {
  return (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });
    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ error: 'Invalid token' });
    if (requiredType && payload.userType !== requiredType) return res.status(403).json({ error: 'Forbidden' });
    req.auth = payload;
    next();
  };
}

function gradeToPoints(grade) {
  const g = String(grade || '').trim().toUpperCase();
  const map = { 'O': 10, 'A+': 10, 'A': 9, 'B+': 8, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0, 'AB': 0 };
  return map[g] ?? null;
}

function computeSgpa(subjects) {
  const valid = subjects.filter((s) => Number(s.credits) > 0 && Number(s.points) >= 0);
  const totalCredits = valid.reduce((sum, s) => sum + Number(s.credits), 0);
  if (totalCredits <= 0) return 0;
  const totalPoints = valid.reduce((sum, s) => sum + Number(s.credits) * Number(s.points), 0);
  return Number((totalPoints / totalCredits).toFixed(2));
}

// Roll number format: year(2 digits) + 2U1A + branch code(2 digits) + number(2+ digits), e.g. 222U1A0522
function isValidRollNo(rollNo) {
  return /^\d{2}2U1A\d{2}\d{2,}$/.test(String(rollNo || '').trim());
}

function extractJsonObject(text) {
  const raw = String(text || '').trim();
  if (!raw) return null;
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  try { return JSON.parse(cleaned); } catch (_) {}
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = cleaned.slice(start, end + 1);
  try { return JSON.parse(slice); } catch (_) { return null; }
}

function buildPerformanceContext(academicRecords) {
  const records = Array.isArray(academicRecords) ? academicRecords : [];
  if (!records.length) {
    return {
      semesterCount: 0,
      sgpaTrend: 'No semester records yet',
      subjectAreaScores: {}
    };
  }
  const ordered = [...records].sort((a, b) => Number(a.semester) - Number(b.semester));
  const sgpas = ordered.map(r => Number(r.sgpa) || 0);
  const trend = sgpas.length >= 2
    ? (sgpas[sgpas.length - 1] > sgpas[0] ? 'Improving' : sgpas[sgpas.length - 1] < sgpas[0] ? 'Declining' : 'Stable')
    : 'Single semester';
  return {
    semesterCount: ordered.length,
    sgpaTrend: trend,
    subjectAreaScores: getSubjectAreaScores(ordered)
  };
}

function normalizeGeminiModelId(modelName) {
  const raw = String(modelName || '').trim();
  if (!raw) return '';
  return raw.startsWith('models/') ? raw.slice('models/'.length) : raw;
}

async function resolveGeminiModelForGenerateContent() {
  const now = Date.now();
  if (cachedGeminiModel && (now - cachedGeminiModelAt) < 5 * 60 * 1000) {
    return cachedGeminiModel;
  }

  const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(GEMINI_API_KEY)}`);
  const listData = await listResp.json().catch(() => ({}));
  if (!listResp.ok) {
    const msg = listData?.error?.message || 'Failed to list Gemini models';
    throw new Error(msg);
  }

  const all = Array.isArray(listData?.models) ? listData.models : [];
  const generateModels = all.filter((m) => Array.isArray(m?.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'));
  if (!generateModels.length) {
    throw new Error('No Gemini models with generateContent are available for this API key/project');
  }

  const configured = normalizeGeminiModelId(GEMINI_MODEL);
  if (configured) {
    const configuredExists = generateModels.some((m) => normalizeGeminiModelId(m?.name) === configured);
    if (configuredExists) {
      cachedGeminiModel = configured;
      cachedGeminiModelAt = now;
      return configured;
    }
  }

  const preferredOrder = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
  for (const pref of preferredOrder) {
    const found = generateModels.find((m) => normalizeGeminiModelId(m?.name) === pref);
    if (found) {
      cachedGeminiModel = pref;
      cachedGeminiModelAt = now;
      return pref;
    }
  }

  const first = normalizeGeminiModelId(generateModels[0]?.name);
  cachedGeminiModel = first;
  cachedGeminiModelAt = now;
  return first;
}

async function generateOpenAICareerRecommendations(profile) {
  if (!OPENAI_API_KEY) return null;

  const perf = buildPerformanceContext(profile.academicRecords);
  const payload = {
    department: profile.department || '',
    year: profile.year || '',
    cgpa: profile.cgpa,
    careerGoal: profile.careerGoal || '',
    aspirations: profile.aspirations || '',
    swot: profile.swot || null,
    skills: Array.isArray(profile.interests) ? profile.interests : [],
    semesterCount: perf.semesterCount,
    sgpaTrend: perf.sgpaTrend,
    subjectAreaScores: perf.subjectAreaScores
  };

  const systemPrompt = [
    'You are a career mentor for engineering students.',
    'Use student skills, CGPA, aspirations/goals, SWOT analysis and academic performance context to produce personalized career guidance.',
    'Return ONLY valid JSON with keys:',
    'summary (string),',
    'careerSuggestions (array of 3 objects: role, whyFit, focusSkills[], next90Days[]),',
    'roadmap (array of 3 objects: phase, goals[]),',
    'warnings (array of strings).'
  ].join(' ');

  const userPrompt = `Student profile JSON:\n${JSON.stringify(payload)}`;

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = data?.error?.message || 'OpenAI request failed';
    throw new Error(msg);
  }

  const content = data?.choices?.[0]?.message?.content || '';
  const parsed = extractJsonObject(content);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI response parsing failed');
  }

  return {
    summary: String(parsed.summary || ''),
    careerSuggestions: Array.isArray(parsed.careerSuggestions) ? parsed.careerSuggestions.slice(0, 3) : [],
    roadmap: Array.isArray(parsed.roadmap) ? parsed.roadmap.slice(0, 4) : [],
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.slice(0, 6) : []
  };
}

async function generateOpenRouterCareerRecommendations(profile) {
  if (!OPENROUTER_API_KEY) return null;

  const perf = buildPerformanceContext(profile.academicRecords);
  const payload = {
    department: profile.department || '',
    year: profile.year || '',
    cgpa: profile.cgpa,
    careerGoal: profile.careerGoal || '',
    aspirations: profile.aspirations || '',
    swot: profile.swot || null,
    skills: Array.isArray(profile.interests) ? profile.interests : [],
    semesterCount: perf.semesterCount,
    sgpaTrend: perf.sgpaTrend,
    subjectAreaScores: perf.subjectAreaScores
  };

  const systemPrompt = [
    'You are a career mentor for engineering students.',
    'Use student skills, CGPA, aspirations/goals, SWOT analysis and academic performance context to produce personalized career guidance.',
    'Return ONLY valid JSON with keys:',
    'summary (string),',
    'careerSuggestions (array of 3 objects: role, whyFit, focusSkills[], next90Days[]),',
    'roadmap (array of 3 objects: phase, goals[]),',
    'warnings (array of strings).'
  ].join(' ');

  const userPrompt = `Student profile JSON:\n${JSON.stringify(payload)}`;
  const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': OPENROUTER_SITE_URL,
      'X-Title': OPENROUTER_SITE_NAME
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = data?.error?.message || 'OpenRouter request failed';
    throw new Error(msg);
  }

  const content = data?.choices?.[0]?.message?.content || '';
  const parsed = extractJsonObject(content);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI response parsing failed');
  }

  return {
    summary: String(parsed.summary || ''),
    careerSuggestions: Array.isArray(parsed.careerSuggestions) ? parsed.careerSuggestions.slice(0, 3) : [],
    roadmap: Array.isArray(parsed.roadmap) ? parsed.roadmap.slice(0, 4) : [],
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.slice(0, 6) : []
  };
}

async function generateGeminiCareerRecommendations(profile) {
  if (!GEMINI_API_KEY) return null;
  const modelId = await resolveGeminiModelForGenerateContent();

  const perf = buildPerformanceContext(profile.academicRecords);
  const payload = {
    department: profile.department || '',
    year: profile.year || '',
    cgpa: profile.cgpa,
    careerGoal: profile.careerGoal || '',
    aspirations: profile.aspirations || '',
    swot: profile.swot || null,
    skills: Array.isArray(profile.interests) ? profile.interests : [],
    semesterCount: perf.semesterCount,
    sgpaTrend: perf.sgpaTrend,
    subjectAreaScores: perf.subjectAreaScores
  };

  const prompt = [
    'You are a career mentor for engineering students.',
    'Use student skills, CGPA, aspirations/goals, SWOT analysis and academic performance context to produce personalized career guidance.',
    'Return ONLY valid JSON with keys:',
    'summary (string),',
    'careerSuggestions (array of 3 objects: role, whyFit, focusSkills[], next90Days[]),',
    'roadmap (array of 3 objects: phase, goals[]),',
    'warnings (array of strings).',
    `Student profile JSON:\n${JSON.stringify(payload)}`
  ].join(' ');

  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4 }
    })
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = data?.error?.message || 'Gemini request failed';
    throw new Error(msg);
  }

  const content = (data?.candidates || [])
    .flatMap(c => ((c && c.content && Array.isArray(c.content.parts)) ? c.content.parts : []))
    .map(p => p && p.text ? p.text : '')
    .join('\n')
    .trim();

  const parsed = extractJsonObject(content);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI response parsing failed');
  }

  return {
    summary: String(parsed.summary || ''),
    careerSuggestions: Array.isArray(parsed.careerSuggestions) ? parsed.careerSuggestions.slice(0, 3) : [],
    roadmap: Array.isArray(parsed.roadmap) ? parsed.roadmap.slice(0, 4) : [],
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings.slice(0, 6) : []
  };
}

async function generateAICareerRecommendations(profile) {
  const errors = [];

  if (OPENROUTER_API_KEY) {
    try {
      const recommendation = await generateOpenRouterCareerRecommendations(profile);
      if (recommendation) return { recommendation, source: 'openrouter' };
      errors.push('OpenRouter returned empty response');
    } catch (e) {
      errors.push(`OpenRouter: ${e.message || e}`);
    }
  }

  if (GEMINI_API_KEY) {
    try {
      const recommendation = await generateGeminiCareerRecommendations(profile);
      if (recommendation) return { recommendation, source: 'gemini' };
      errors.push('Gemini returned empty response');
    } catch (e) {
      errors.push(`Gemini: ${e.message || e}`);
    }
  }

  if (OPENAI_API_KEY) {
    try {
      const recommendation = await generateOpenAICareerRecommendations(profile);
      if (recommendation) return { recommendation, source: 'openai' };
      errors.push('OpenAI returned empty response');
    } catch (e) {
      errors.push(`OpenAI: ${e.message || e}`);
    }
  }

  throw new Error(errors.join(' | ') || 'No AI provider available');
}

async function generateOpenAIMentorFeedback({ student, category, title, prompt, priority, actionItems, resources }) {
  const fallback = String(prompt || '').trim();
  if (!fallback) return '';
  if (!OPENAI_API_KEY) return fallback;

  const studentContext = {
    rollNo: student.rollNo,
    name: student.name,
    department: student.department,
    year: student.year,
    cgpa: student.cgpa,
    careerGoal: student.careerGoal || '',
    interests: Array.isArray(student.interests) ? student.interests : []
  };

  const systemPrompt = [
    'You are an academic mentor assistant.',
    'Transform mentor notes into clear, actionable student feedback.',
    'Return plain text only.',
    'Keep it concise, practical, and supportive.'
  ].join(' ');

  const userPrompt = [
    `Student JSON: ${JSON.stringify(studentContext)}`,
    `Category: ${category || 'general'}`,
    `Title: ${title || 'Mentor Feedback'}`,
    `Priority: ${priority || 'medium'}`,
    `Action items: ${actionItems || 'N/A'}`,
    `Resources: ${resources || 'N/A'}`,
    `Mentor prompt: ${fallback}`
  ].join('\n');

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = data?.error?.message || 'OpenAI request failed';
    throw new Error(msg);
  }
  const content = String(data?.choices?.[0]?.message?.content || '').trim();
  return content || fallback;
}

// -------- API --------
app.post('/api/students/register', async (req, res) => {
  const { rollNo, password, name, department, year, regulationId } = req.body || {};
  if (!rollNo || !password || !name || !department || !year) {
    return res.status(400).json({ error: 'rollNo, password, name, department, year required' });
  }
  const roll = String(rollNo).trim();
  if (!isValidRollNo(roll)) {
    return res.status(400).json({ error: 'Invalid roll number format. Use: year + 2U1A + branch code + number (e.g. 222U1A0522)' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  try {
    const [ex] = await pool.query('SELECT 1 FROM students WHERE roll_no = ?', [roll]);
    if (ex.length) return res.status(409).json({ error: 'Roll number already registered' });
    const yearLabel = { '1': 'I B.Tech', '2': 'II B.Tech', '3': 'III B.Tech', '4': 'IV B.Tech' }[String(year)] || `Year ${year}`;
    const dept = String(department).trim();
    const regId = regulationId ? String(regulationId).trim() : null;
    await pool.query(
      'INSERT INTO students (roll_no, password, name, department, year, regulation_id) VALUES (?, ?, ?, ?, ?, ?)',
      [roll, password, name, dept, yearLabel, regId]
    );
    const [rows] = await pool.query('SELECT * FROM students WHERE roll_no = ?', [roll]);
    const user = rowToStudent(rows[0]);
    return res.status(201).json({ message: 'Registration successful', user: sanitizeUser(user, 'student') });
  } catch (e) {
    console.error('Registration DB error:', e.code, e.message || e);
    const msg = e.message || String(e);
    if (e.code === 'ER_NO_SUCH_TABLE' || msg.includes("doesn't exist")) {
      const created = await ensureTables().catch(() => false);
      if (created) {
        return res.status(503).json({ error: 'Tables were just created. Please try registering again.' });
      }
      return res.status(500).json({ error: 'Database table missing. Restart the server to auto-create tables, or run: mysql -u root -p gist_mentoring_system < backend/schema.sql' });
    }
    if (e.code === 'ECONNREFUSED' || e.code === 'ETIMEDOUT') {
      return res.status(500).json({ error: 'Cannot connect to MySQL. Check that MySQL is running and backend/db.js password.' });
    }
    if (e.code === 'ER_ACCESS_DENIED_ERROR') {
      return res.status(500).json({ error: 'MySQL access denied. Check user and password in backend/db.js' });
    }
    if (e.code === 'ER_BAD_DB_ERROR') {
      return res.status(500).json({ error: 'Database does not exist. Restart the server to auto-create it.' });
    }
    return res.status(500).json({ error: 'Registration failed: ' + (msg.substring(0, 150) || 'Database error') });
  }
});

app.get('/api/branches', async (req, res) => {
  const { regulationId } = req.query;
  try {
    let query = 'SELECT b.id, b.name, b.code, r.name as regulation_name FROM branches b JOIN regulations r ON b.regulation_id = r.id WHERE b.is_active = TRUE';
    const params = [];
    if (regulationId) {
      query += ' AND b.regulation_id = ?';
      params.push(regulationId);
    }
    query += ' ORDER BY r.name, b.name';
    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/subjects', async (req, res) => {
  const { branchId, semester } = req.query;
  try {
    let query = 'SELECT id, code, name, semester, credits, type, description FROM subjects WHERE is_active = TRUE';
    const params = [];
    
    if (branchId) {
      query += ' AND branch_id = ?';
      params.push(branchId);
    }
    
    if (semester) {
      query += ' AND semester = ?';
      params.push(semester);
    }
    
    query += ' ORDER BY semester, code';
    const [rows] = await pool.query(query, params);
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password, userType } = req.body || {};
  if (!username || !password || !userType) {
    return res.status(400).json({ error: 'username, password, userType required' });
  }
  try {
    let user = null;
    if (userType === 'student') {
      const [rows] = await pool.query('SELECT * FROM students WHERE roll_no = ? AND password = ?', [username, password]);
      user = rows[0] ? rowToStudent(rows[0]) : null;
    } else if (userType === 'mentor') {
      const [rows] = await pool.query('SELECT * FROM mentors WHERE id = ? AND password = ?', [username, password]);
      user = rows[0] ? rowToMentor(rows[0]) : null;
    } else if (userType === 'admin') {
      const [rows] = await pool.query('SELECT * FROM admins WHERE id = ? AND password = ?', [username, password]);
      if (!rows || rows.length === 0) {
        return res.status(401).json({ error: 'Invalid admin ID or password. Check credentials.' });
      }
      try {
        user = rowToAdmin(rows[0]);
      } catch (adminErr) {
        console.error('Error converting admin row:', adminErr);
        return res.status(500).json({ error: 'Admin data error. Try: mysql -u root -p gist_mentoring_system < backend/migrate-admins.sql' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid userType' });
    }
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const sub = userType === 'student' ? user.rollNo : user.id;
    const payload = { sub, userType, exp: Date.now() + 1000 * 60 * 60 * 8 };
    if (userType === 'admin' && user.role) payload.role = user.role;
    if (userType === 'admin' && user.branch) payload.branch = user.branch;
    const token = signToken(payload);
    return res.json({ token, user: sanitizeUser(user, userType) });
  } catch (e) {
    console.error('Login error:', e.code, e.message || e);
    const msg = e.message || String(e);
    if (e.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ error: 'Database tables missing. Restart server to auto-create, or run: mysql -u root -p gist_mentoring_system < backend/schema.sql' });
    }
    if (e.code === 'ER_BAD_FIELD_ERROR' && msg.includes('role')) {
      return res.status(500).json({ error: 'Admins table needs update. Run: mysql -u root -p gist_mentoring_system < backend/migrate-admins.sql' });
    }
    return res.status(500).json({ error: 'Login failed: ' + (msg.substring(0, 100) || 'Database error') });
  }
});

app.get('/api/auth/me', authMiddleware(), async (req, res) => {
  const { userType, sub } = req.auth;
  try {
    let user = null;
    if (userType === 'student') {
      const [rows] = await pool.query('SELECT * FROM students WHERE roll_no = ?', [sub]);
      user = rows[0] ? rowToStudent(rows[0]) : null;
    } else if (userType === 'mentor') {
      const [rows] = await pool.query('SELECT * FROM mentors WHERE id = ?', [sub]);
      user = rows[0] ? rowToMentor(rows[0]) : null;
    } else if (userType === 'admin') {
      const [rows] = await pool.query('SELECT * FROM admins WHERE id = ?', [sub]);
      user = rows[0] ? rowToAdmin(rows[0]) : null;
    }
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: sanitizeUser(user, userType) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: databaseErrorMessage(e) });
  }
});

app.get('/api/students/me/progress', authMiddleware('student'), async (req, res) => {
  try {
    let rows;
    try {
      [rows] = await pool.query('SELECT cgpa, academic_records FROM students WHERE roll_no = ?', [req.auth.sub]);
    } catch (e) {
      if (e && e.code === 'ER_BAD_FIELD_ERROR') {
        [rows] = await pool.query('SELECT cgpa FROM students WHERE roll_no = ?', [req.auth.sub]);
      } else {
        throw e;
      }
    }
    const r = rows[0];
    if (!r) return res.status(404).json({ error: 'Student not found' });
    const rec = parseJsonField(r.academic_records, []);
    return res.json({ cgpa: r.cgpa != null ? Number(r.cgpa) : null, academicRecords: rec });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: databaseErrorMessage(e) });
  }
});

app.put('/api/students/me/profile', authMiddleware('student'), async (req, res) => {
  const { careerGoal, interests, aspirations, swot } = req.body || {};
  try {
    const updates = [];
    const values = [];
    if (typeof careerGoal === 'string') { updates.push('career_goal = ?'); values.push(careerGoal); }
    if (Array.isArray(interests)) { updates.push('interests = ?'); values.push(JSON.stringify(interests)); }
    if (typeof aspirations === 'string') { updates.push('aspirations = ?'); values.push(aspirations); }
    if (swot && typeof swot === 'object') { updates.push('swot = ?'); values.push(JSON.stringify(swot)); }
    if (updates.length === 0) {
      const [rows] = await pool.query('SELECT * FROM students WHERE roll_no = ?', [req.auth.sub]);
      const r = rows[0];
      if (!r) return res.status(404).json({ error: 'Student not found' });
      return res.json({ user: sanitizeUser(rowToStudent(r), 'student') });
    }
    values.push(req.auth.sub);
    await pool.query(`UPDATE students SET ${updates.join(', ')} WHERE roll_no = ?`, values);
    const [rows] = await pool.query('SELECT * FROM students WHERE roll_no = ?', [req.auth.sub]);
    const r = rows[0];
    if (!r) return res.status(404).json({ error: 'Student not found' });
    return res.json({ user: sanitizeUser(rowToStudent(r), 'student') });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: databaseErrorMessage(e) });
  }
});

app.get('/api/students/me/feedback', authMiddleware('student'), async (req, res) => {
  try {
    let rows;
    try {
      [rows] = await pool.query(
        'SELECT id, date_at AS date, category, title, message, priority, action_items AS actionItems, resources FROM mentor_feedback WHERE student_roll_no = ? ORDER BY date_at DESC',
        [req.auth.sub]
      );
    } catch (e) {
      if (e && e.code === 'ER_BAD_FIELD_ERROR' && String(e.message || '').includes('student_roll_no')) {
        [rows] = await pool.query(
          'SELECT id, date_at AS date, category, title, message, priority, action_items AS actionItems, resources FROM mentor_feedback WHERE roll_no = ? ORDER BY date_at DESC',
          [req.auth.sub]
        );
      } else {
        throw e;
      }
    }
    const list = (rows || []).map((r) => ({
      id: r.id,
      date: r.date ? new Date(r.date).toISOString() : null,
      category: r.category,
      title: r.title,
      message: r.message,
      priority: r.priority,
      actionItems: r.actionItems,
      resources: r.resources
    }));
    return res.json({ feedback: list });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: databaseErrorMessage(e) });
  }
});

app.get('/api/students/me/live-feedback', authMiddleware('student'), async (req, res) => {
  try {
    return res.json({ feedback: getLiveFeedback(req.auth.sub) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to load live feedback' });
  }
});

// ML-based course recommendations for the logged-in student
app.get('/api/students/me/course-recommendations', authMiddleware('student'), async (req, res) => {
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 10));
  try {
    let studentRows;
    try {
      [studentRows] = await pool.query(
        'SELECT cgpa, interests, career_goal, academic_records FROM students WHERE roll_no = ?',
        [req.auth.sub]
      );
    } catch (e) {
      if (e && e.code === 'ER_BAD_FIELD_ERROR') {
        [studentRows] = await pool.query('SELECT cgpa FROM students WHERE roll_no = ?', [req.auth.sub]);
      } else {
        throw e;
      }
    }
    const s = studentRows[0];
    if (!s) return res.status(404).json({ error: 'Student not found' });
    const student = {
      cgpa: s.cgpa != null ? Number(s.cgpa) : null,
      interests: parseJsonField(s.interests, []),
      careerGoal: s.career_goal || '',
      academicRecords: parseJsonField(s.academic_records, [])
    };
    const [courseRows] = await pool.query('SELECT id, name, description, category, difficulty, skills, career_paths, subject_areas FROM courses');
    const recommendations = recommendCourses(student, courseRows || [], limit);
    return res.json({ recommendations });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: databaseErrorMessage(e) });
  }
});

// AI career recommendations (Gemini preferred, OpenAI fallback)
app.get('/api/students/me/ai-career-recommendations', authMiddleware('student'), async (req, res) => {
  try {
    if (!OPENROUTER_API_KEY && !GEMINI_API_KEY && !OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'No AI API key configured. Set OPENROUTER_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY.',
        recommendation: null
      });
    }

    let rows;
    try {
      [rows] = await pool.query(
        'SELECT cgpa, interests, career_goal, aspirations, swot, department, year, academic_records FROM students WHERE roll_no = ?',
        [req.auth.sub]
      );
    } catch (selectErr) {
      // Backward compatibility for older databases where new profile columns do not exist yet.
      if (selectErr && selectErr.code === 'ER_BAD_FIELD_ERROR') {
        try {
          [rows] = await pool.query(
            'SELECT cgpa, interests, career_goal, department, year, academic_records FROM students WHERE roll_no = ?',
            [req.auth.sub]
          );
        } catch (legacyErr) {
          if (legacyErr && legacyErr.code === 'ER_BAD_FIELD_ERROR') {
            [rows] = await pool.query('SELECT cgpa, department, year FROM students WHERE roll_no = ?', [req.auth.sub]);
          } else {
            throw legacyErr;
          }
        }
      } else {
        throw selectErr;
      }
    }
    const s = rows[0];
    if (!s) return res.status(404).json({ error: 'Student not found' });
    
    const cgpa = s.cgpa != null ? Number(s.cgpa) : null;
    const interests = parseJsonField(s.interests, []);
    const careerGoal = s.career_goal || '';
    const aspirations = s.aspirations || '';
    const swot = parseJsonField(s.swot, null);
    const department = s.department || '';
    const year = s.year || '';
    const academicRecords = parseJsonField(s.academic_records, []);

    const profile = {
      cgpa,
      department,
      year,
      careerGoal,
      aspirations,
      swot,
      interests,
      academicRecords
    };

    try {
      const { recommendation, source } = await generateAICareerRecommendations(profile);
      if (recommendation) {
        return res.json({ recommendation, source });
      }
      return res.status(500).json({
        error: 'AI provider returned an empty recommendation.',
        recommendation: null
      });
    } catch (aiErr) {
      console.error('AI recommendation error:', aiErr.message || aiErr);
      return res.status(502).json({
        error: aiErr.message || 'AI recommendation failed',
        recommendation: null
      });
    }
  } catch (e) {
    console.error('Error generating AI recommendations:', e);
    return res.status(500).json({
      error: databaseErrorMessage(e, 'AI recommendation failed'),
      recommendation: null
    });
  }
});

app.post('/api/students/:rollNo/feedback', authMiddleware('mentor'), async (req, res) => {
  const { rollNo } = req.params;
  const { category, title, message, priority, actionItems, resources } = req.body || {};
  if (!category || !message) return res.status(400).json({ error: 'category and message are required' });
  try {
    const [s] = await pool.query('SELECT 1 FROM students WHERE roll_no = ?', [rollNo]);
    if (!s.length) return res.status(404).json({ error: 'Student not found' });
    let result;
    try {
      [result] = await pool.query(
        'INSERT INTO mentor_feedback (student_roll_no, category, title, message, priority, action_items, resources) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [rollNo, category, title || 'Mentor Feedback', message, priority || 'low', actionItems || null, resources || null]
      );
    } catch (e) {
      if (e && e.code === 'ER_BAD_FIELD_ERROR' && String(e.message || '').includes('student_roll_no')) {
        [result] = await pool.query(
          'INSERT INTO mentor_feedback (roll_no, category, title, message, priority, action_items, resources) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [rollNo, category, title || 'Mentor Feedback', message, priority || 'low', actionItems || null, resources || null]
        );
      } else {
        throw e;
      }
    }
    const [rows] = await pool.query('SELECT id, date_at, category, title, message, priority, action_items AS actionItems, resources FROM mentor_feedback WHERE id = ?', [result.insertId]);
    const r = rows[0];
    const item = {
      id: r.id,
      date: r.date_at ? new Date(r.date_at).toISOString() : new Date().toISOString(),
      category: r.category,
      title: r.title,
      message: r.message,
      priority: r.priority,
      actionItems: r.actionItems,
      resources: r.resources
    };
    return res.status(201).json({ feedback: item });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/mentor/feedback', authMiddleware('mentor'), async (req, res) => {
  try {
    let rows;
    try {
      [rows] = await pool.query(
        `SELECT mf.id, mf.student_roll_no AS rollNo, mf.date_at AS date, mf.category, mf.title, mf.message, mf.priority,
                mf.action_items AS actionItems, mf.resources
         FROM mentor_feedback mf
         INNER JOIN students s ON s.roll_no = mf.student_roll_no
         WHERE s.mentor_id = ?
         ORDER BY mf.date_at DESC`,
        [req.auth.sub]
      );
    } catch (e) {
      if (e && e.code === 'ER_BAD_FIELD_ERROR' && String(e.message || '').includes('student_roll_no')) {
        [rows] = await pool.query(
          `SELECT mf.id, mf.roll_no AS rollNo, mf.date_at AS date, mf.category, mf.title, mf.message, mf.priority,
                  mf.action_items AS actionItems, mf.resources
           FROM mentor_feedback mf
           INNER JOIN students s ON s.roll_no = mf.roll_no
           WHERE s.mentor_id = ?
           ORDER BY mf.date_at DESC`,
          [req.auth.sub]
        );
      } else {
        throw e;
      }
    }
    const list = (rows || []).map((r) => ({
      id: r.id,
      rollNo: r.rollNo,
      date: r.date ? new Date(r.date).toISOString() : null,
      category: r.category,
      title: r.title,
      message: r.message,
      priority: r.priority,
      actionItems: r.actionItems,
      resources: r.resources
    }));
    return res.json({ feedback: list });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: databaseErrorMessage(e) });
  }
});

app.post('/api/students/:rollNo/live-feedback', authMiddleware('mentor'), async (req, res) => {
  const { rollNo } = req.params;
  const { category, title, prompt, priority, actionItems, resources } = req.body || {};
  if (!prompt || !String(prompt).trim()) return res.status(400).json({ error: 'prompt is required' });
  try {
    const [s] = await pool.query('SELECT * FROM students WHERE roll_no = ?', [rollNo]);
    if (!s.length) return res.status(404).json({ error: 'Student not found' });
    const student = rowToStudent(s[0]);
    if (student.mentorId !== req.auth.sub) return res.status(403).json({ error: 'You are not assigned to this student' });

    let message = String(prompt).trim();
    try {
      message = await generateOpenAIMentorFeedback({
        student,
        category,
        title,
        prompt,
        priority,
        actionItems,
        resources
      });
    } catch (aiErr) {
      console.error('OpenAI live feedback error:', aiErr.message || aiErr);
    }

    const item = {
      id: Date.now(),
      rollNo: student.rollNo,
      category: category || 'general',
      title: title || 'Mentor Feedback',
      message,
      priority: priority || 'low',
      actionItems: actionItems || null,
      resources: resources || null,
      date: new Date().toISOString(),
      source: OPENAI_API_KEY ? 'openai_or_fallback' : 'prompt_only'
    };
    // AI-generated feedback is returned for immediate display only; do not store.
    return res.status(201).json({ feedback: item });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: databaseErrorMessage(e) });
  }
});

app.get('/api/mentor/live-feedback', authMiddleware('mentor'), async (req, res) => {
  try {
    const [students] = await pool.query('SELECT roll_no FROM students WHERE mentor_id = ?', [req.auth.sub]);
    const allowedRolls = new Set((students || []).map((s) => s.roll_no));
    const feedback = [];
    allowedRolls.forEach((roll) => {
      getLiveFeedback(roll).forEach((item) => feedback.push(item));
    });
    feedback.sort((a, b) => new Date(b.date) - new Date(a.date));
    return res.json({ feedback });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: databaseErrorMessage(e) });
  }
});

// -------- Admin --------
app.get('/api/admin/students', authMiddleware('admin'), async (req, res) => {
  const branch = req.auth.branch;
  try {
    const query = branch ? 'SELECT * FROM students WHERE department = ? ORDER BY roll_no' : 'SELECT * FROM students ORDER BY roll_no';
    const params = branch ? [branch] : [];
    const [rows] = await pool.query(query, params);
    const students = (rows || []).map((r) => sanitizeUser(rowToStudent(r), 'student'));
    return res.json({ students });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/admin/mentors', authMiddleware('admin'), async (req, res) => {
  const branch = req.auth.branch;
  try {
    const query = branch ? 'SELECT * FROM mentors WHERE department = ? ORDER BY id' : 'SELECT * FROM mentors ORDER BY id';
    const params = branch ? [branch] : [];
    const [rows] = await pool.query(query, params);
    const mentors = (rows || []).map((r) => sanitizeUser(rowToMentor(r), 'mentor'));
    return res.json({ mentors });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/public/stats', async (_req, res) => {
  try {
    const [[studentStats]] = await pool.query(
      `SELECT COUNT(*) AS totalStudents, AVG(cgpa) AS avgCgpa
       FROM students`
    );
    const [[mentorStats]] = await pool.query(
      `SELECT COUNT(*) AS totalMentors
       FROM mentors`
    );

    return res.json({
      totalStudents: Number(studentStats?.totalStudents || 0),
      totalMentors: Number(mentorStats?.totalMentors || 0),
      avgCgpa: studentStats?.avgCgpa != null ? Number(studentStats.avgCgpa).toFixed(2) : '-'
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/admin/mentors', authMiddleware('admin'), async (req, res) => {
  const { id, password, name, department } = req.body || {};
  if (!id || !password || !name || !department) {
    return res.status(400).json({ error: 'id, password, name, department required' });
  }
  if (req.auth.branch && req.auth.branch !== department) {
    return res.status(403).json({ error: 'Branch admins can only create mentors for their own branch' });
  }
  try {
    const [ex] = await pool.query('SELECT 1 FROM mentors WHERE id = ?', [id]);
    if (ex.length) return res.status(409).json({ error: 'Mentor id already exists' });
    await pool.query('INSERT INTO mentors (id, password, name, department, students) VALUES (?, ?, ?, ?, 0)', [id, password, name, department]);
    const mentor = { id, password, name, department, students: 0 };
    return res.status(201).json({ mentor: sanitizeUser(mentor, 'mentor') });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/admin/mentors/:id', authMiddleware('admin'), async (req, res) => {
  const { id } = req.params;
  try {
    const [m] = await pool.query('SELECT * FROM mentors WHERE id = ?', [id]);
    if (!m.length) return res.status(404).json({ error: 'Mentor not found' });
    await pool.query('UPDATE students SET mentor_id = NULL, mentor = NULL WHERE mentor_id = ?', [id]);
    await pool.query('DELETE FROM mentors WHERE id = ?', [id]);
    return res.json({ deleted: sanitizeUser(rowToMentor(m[0]), 'mentor') });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/admin/students/:rollNo/assign-mentor', authMiddleware('admin'), async (req, res) => {
  const { rollNo } = req.params;
  const { mentorId } = req.body || {};
  if (!mentorId) return res.status(400).json({ error: 'mentorId required' });
  try {
    const [s] = await pool.query('SELECT * FROM students WHERE roll_no = ?', [rollNo]);
    if (!s.length) return res.status(404).json({ error: 'Student not found' });
    const [m] = await pool.query('SELECT * FROM mentors WHERE id = ?', [mentorId]);
    if (!m.length) return res.status(404).json({ error: 'Mentor not found' });
    const mentorName = m[0].name;
    await pool.query('UPDATE students SET mentor_id = ?, mentor = ? WHERE roll_no = ?', [mentorId, mentorName, rollNo]);
    await pool.query('UPDATE mentors m SET m.students = (SELECT COUNT(*) FROM students s WHERE s.mentor_id = m.id)');
    const [updated] = await pool.query('SELECT * FROM students WHERE roll_no = ?', [rollNo]);
    return res.json({ student: sanitizeUser(rowToStudent(updated[0]), 'student') });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: databaseErrorMessage(e) });
  }
});


// Regulations, Branches, Subjects APIs
app.post('/api/admin/regulations', authMiddleware('admin'), async (req, res) => {
  const { id, name, description } = req.body || {};
  if (!id || !name) return res.status(400).json({ error: 'id and name required' });
  
  try {
    const [ex] = await pool.query('SELECT 1 FROM regulations WHERE id = ?', [id]);
    if (ex.length) return res.status(409).json({ error: 'Regulation ID already exists' });

    await pool.query(
      'INSERT INTO regulations (id, name, description, is_active) VALUES (?, ?, ?, TRUE)',
      [id, name, description || null]
    );

    return res.status(201).json({ 
      regulation: { id, name, description, is_active: true } 
    });
  } catch (e) {
    console.error('Error creating regulation:', e);
    return res.status(500).json({ error: 'Database error' });
  }
});
app.get('/api/admin/regulations', authMiddleware('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM regulations WHERE is_active = TRUE ORDER BY name');
    return res.json({ regulations: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/admin/branches', authMiddleware('admin'), async (req, res) => {
  const { regulationId } = req.query;
  try {
    const query = regulationId 
      ? 'SELECT * FROM branches WHERE regulation_id = ? AND is_active = TRUE ORDER BY name'
      : 'SELECT * FROM branches WHERE is_active = TRUE ORDER BY name';
    const params = regulationId ? [regulationId] : [];
    const [rows] = await pool.query(query, params);
    return res.json({ branches: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/admin/subjects', authMiddleware('admin'), async (req, res) => {
  const { branchId, semester } = req.query;
  try {
    let query = 'SELECT * FROM subjects WHERE is_active = TRUE';
    const params = [];
    if (branchId) {
      query += ' AND branch_id = ?';
      params.push(branchId);
    }
    if (semester) {
      query += ' AND semester = ?';
      params.push(semester);
    }
    query += ' ORDER BY semester, code';
    const [rows] = await pool.query(query, params);
    return res.json({ subjects: rows });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/admin/regulations/:id', authMiddleware('admin'), async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body || {};

  if (!name) {
    return res.status(400).json({
      error: 'Regulation name is required'
    });
  }

  try {
    const [existing] = await pool.query(
      'SELECT * FROM regulations WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (!existing.length) {
      return res.status(404).json({
        error: 'Regulation not found'
      });
    }

    await pool.query(
      `UPDATE regulations
       SET name = ?, description = ?
       WHERE id = ?`,
      [name, description || null, id]
    );

    const [updated] = await pool.query(
      'SELECT * FROM regulations WHERE id = ?',
      [id]
    );

    return res.json({
      message: 'Regulation updated successfully',
      regulation: updated[0]
    });

  } catch (e) {
    console.error('Error updating regulation:', e);

    return res.status(500).json({
      error: 'Database error'
    });
  }
});

app.delete('/api/admin/regulations/:id', authMiddleware('admin'), async (req, res) => {
  const { id } = req.params;

  try {
    const [reg] = await pool.query(
      'SELECT 1 FROM regulations WHERE id = ?',
      [id]
    );

    if (!reg.length) {
      return res.status(404).json({
        error: 'Regulation not found'
      });
    }

    // Check if regulation is being used by any active branches
    const [branches] = await pool.query(
      'SELECT COUNT(*) AS count FROM branches WHERE regulation_id = ? AND is_active = TRUE',
      [id]
    );

    if (branches[0].count > 0) {
      return res.status(409).json({
        error: 'Cannot delete regulation that has active branches'
      });
    }

    // Permanently delete regulation
    await pool.query(
      'DELETE FROM regulations WHERE id = ?',
      [id]
    );

    return res.json({
      message: 'Regulation deleted successfully'
    });

  } catch (e) {
    console.error('Error deleting regulation:', e);

    return res.status(500).json({
      error: 'Database error'
    });
  }
});

app.post('/api/admin/branches', authMiddleware('admin'), async (req, res) => {
  const { id, regulationId, name, code, description } = req.body || {};
  if (!id || !regulationId || !name || !code) return res.status(400).json({ error: 'id, regulationId, name, code required' });
  try {
    const [reg] = await pool.query('SELECT 1 FROM regulations WHERE id = ? AND is_active = TRUE', [regulationId]);
    if (!reg.length) return res.status(404).json({ error: 'Regulation not found' });
    const [ex] = await pool.query('SELECT 1 FROM branches WHERE id = ?', [id]);
    if (ex.length) return res.status(409).json({ error: 'Branch id already exists' });
    await pool.query('INSERT INTO branches (id, regulation_id, name, code, description, is_active) VALUES (?, ?, ?, ?, ?, TRUE)', [id, regulationId, name, code, description || null]);
    return res.status(201).json({ branch: { id, regulationId, name, code, description, is_active: true } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/admin/subjects', authMiddleware('admin'), async (req, res) => {
  const { id, branchId, code, name, semester, credits, type, description } = req.body || {};
  if (!id || !branchId || !code || !name || !semester || !credits) return res.status(400).json({ error: 'id, branchId, code, name, semester, credits required' });
  try {
    const [branch] = await pool.query('SELECT 1 FROM branches WHERE id = ? AND is_active = TRUE', [branchId]);
    if (!branch.length) return res.status(404).json({ error: 'Branch not found' });
    const [ex] = await pool.query('SELECT 1 FROM subjects WHERE id = ?', [id]);
    if (ex.length) return res.status(409).json({ error: 'Subject id already exists' });
    await pool.query('INSERT INTO subjects (id, branch_id, code, name, semester, credits, type, description, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)', 
      [id, branchId, code, name, semester, credits, type || 'theory', description || null]);
    return res.status(201).json({ subject: { id, branchId, code, name, semester, credits, type: type || 'theory', description, is_active: true } });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Database error' });
  }
});

// -------- Mentor --------
app.get('/api/mentor/students', authMiddleware('mentor'), async (req, res) => {
  const mentorId = req.auth.sub;
  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE mentor_id = ? ORDER BY roll_no', [mentorId]);
    const students = (rows || []).map((r) => sanitizeUser(rowToStudent(r), 'student'));
    return res.json({ students });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Update SGPA for a specific semester - MENTOR ONLY
app.put('/api/mentor/students/:rollNo/academic-records', authMiddleware('mentor'), async (req, res) => {
  try {
    const { rollNo } = req.params;
    const semester = Number(req.body.semester);
    const subjects = Array.isArray(req.body.subjects) ? req.body.subjects : [];

    if (!Number.isInteger(semester) || semester < 1) {
      return res.status(400).json({ error: 'Invalid semester number' });
    }

    if (subjects.length === 0) {
      return res.status(400).json({ error: 'At least one subject is required' });
    }

    // Make sure this student belongs to the logged-in mentor
    const [studentRows] = await pool.query(
      'SELECT roll_no, mentor_id, cgpa, academic_records FROM students WHERE roll_no = ?',
      [rollNo]
    );

    if (!studentRows.length) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = studentRows[0];

    if (String(student.mentor_id) !== String(req.auth.sub)) {
      return res.status(403).json({ error: 'You are not authorized to update this student' });
    }

    // Calculate SGPA
    const validSubjects = subjects.filter(
      sub => Number(sub.credits) > 0 && Number(sub.points) >= 0
    );

    const totalCredits = validSubjects.reduce(
      (sum, sub) => sum + Number(sub.credits),
      0
    );

    if (totalCredits <= 0) {
      return res.status(400).json({ error: 'Total credits must be greater than zero' });
    }

    const totalPoints = validSubjects.reduce(
      (sum, sub) => sum + Number(sub.credits) * Number(sub.points),
      0
    );

    const sgpa = Number((totalPoints / totalCredits).toFixed(2));

    // Read existing academic records
    let academicRecords = parseJsonField(student.academic_records, []);

    if (!Array.isArray(academicRecords)) {
      academicRecords = [];
    }

    const updatedRecord = {
      semester,
      sgpa,
      subjects
    };

    // Update existing semester or add new semester
    const recordIndex = academicRecords.findIndex(
      record => Number(record.semester) === semester
    );

    if (recordIndex >= 0) {
      academicRecords[recordIndex] = updatedRecord;
    } else {
      academicRecords.push(updatedRecord);
    }

    // Keep semesters ordered
    academicRecords.sort(
      (a, b) => Number(a.semester) - Number(b.semester)
    );

    // Calculate CGPA from all semester SGPAs
    const cgpa =
      academicRecords.length > 0
        ? Number(
            (
              academicRecords.reduce(
                (sum, record) => sum + Number(record.sgpa || 0),
                0
              ) / academicRecords.length
            ).toFixed(2)
          )
        : null;

    // Save to MySQL
    await pool.query(
      'UPDATE students SET academic_records = ?, cgpa = ? WHERE roll_no = ?',
      [
        JSON.stringify(academicRecords),
        cgpa,
        rollNo
      ]
    );

    return res.json({
      message: 'Academic record updated successfully',
      academicRecord: updatedRecord,
      newCgpa: cgpa
    });

  } catch (error) {
    console.error('Error saving academic record:', error);
    return res.status(500).json({
      error: databaseErrorMessage(error, 'Failed to save academic record')
    });
  }
});

// -------- Health / setup --------
app.get('/api/health', async (req, res) => {
  try {
    const [connOk] = await pool.query('SELECT 1');
    const [tables] = await pool.query("SHOW TABLES LIKE 'students'");
    const studentsExist = tables && tables.length > 0;
    return res.json({
      ok: true,
      database: 'connected',
      studentsTable: studentsExist ? 'exists' : 'missing',
      hint: studentsExist ? null : 'Restart the server to auto-create tables.'
    });
  } catch (e) {
    return res.status(503).json({
      ok: false,
      error: e.message || 'Database unavailable',
      hint: 'Check MySQL is running and backend/db.js (host, user, password, database).'
    });
  }
});

app.post('/api/setup-tables', async (req, res) => {
  try {
    const ok = await ensureTables();
    if (ok) {
      const { ensureTables } = require('./db');
      await ensureTables();
      return res.json({ message: 'Tables created or already exist. Create admin, mentor, and student users before first login.' });
    }
    return res.status(500).json({ error: 'Failed to create tables.' });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Setup failed' });
  }
});

app.get('/api/check-admin/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT id, name, role, branch FROM admins WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return res.json({ exists: false, message: `Admin '${id}' does not exist. Run backend/schema.sql or migrate-admins.sql` });
    }
    return res.json({ exists: true, admin: rows[0] });
  } catch (e) {
    if (e.code === 'ER_BAD_FIELD_ERROR' && e.message.includes('role')) {
      return res.status(500).json({ error: 'Admins table missing role/branch columns. Run: mysql -u root -p gist_mentoring_system < backend/migrate-admins.sql' });
    }
    return res.status(500).json({ error: e.message || 'Check failed' });
  }
});

// -------- Static frontend --------
// SECURITY: never statically serve the whole project root — that would expose
// backend/.env (API keys, DB password, TOKEN_SECRET), server.js source, and
// schema/seed SQL files to anyone who requests them by path. Only the actual
// public frontend assets are served.
const PUBLIC_FILES = [
  'index.html', 'style.css', 'app.js',
  'student-login.html', 'student-dashboard.html', 'student-progress.html', 'student-registration.html',
  'mentor-login.html', 'mentor-dashboard.html',
  'admin-login.html', 'admin-dashboard.html'
];
const PUBLIC_DIRS = ['assets', 'Syllabus'];

app.use((req, res, next) => {
  const reqPath = req.path === '/' ? '/index.html' : req.path;
  const top = reqPath.split('/').filter(Boolean)[0] || '';
  const isPublicFile = PUBLIC_FILES.includes(reqPath.replace(/^\//, ''));
  const isPublicDir = PUBLIC_DIRS.includes(top);
  if (!isPublicFile && !isPublicDir) return res.status(404).end();
  next();
});
app.use(express.static(ROOT_DIR, { dotfiles: 'deny', index: false }));
app.get('/', (req, res) => res.sendFile(path.join(ROOT_DIR, 'index.html')));

// Start server after DB check
async function start() {
  const ok = await initDatabase();
  if (!ok) {
    console.error('Startup aborted: MySQL unavailable. Check MySQL is running and backend/db.js (host, user, password).');
    process.exitCode = 1;
    return;
  }
  app.listen(PORT, () => console.log(`GIST Mentoring System running on http://localhost:${PORT}`));
}

start();
