/**
 * ML-based Course Recommendation Engine
 * Content-based filtering using student statistics: CGPA, interests, career goal, and academic performance by subject area.
 */

// Map subject name/code keywords to subject areas (for academic record analysis)
const SUBJECT_AREA_KEYWORDS = {
  Programming: ['programming', 'data structures', 'oop', 'object oriented', 'problem solving', 'cs101', 'cs201', 'cs301', 'cs303', 'cs102', 'cs203', 'cs306'],
  Mathematics: ['mathematics', 'math', 'discrete', 'ma101', 'ma201', 'ma301'],
  DBMS: ['database', 'dbms', 'sql', 'cs302', 'cs305'],
  Electronics: ['electronics', 'digital logic', 'ec101', 'ec102', 'cs202'],
  Other: []
};

function parseJsonField(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

/**
 * Extract student's average performance per subject area from academic records.
 * Returns e.g. { Programming: 9.2, Mathematics: 8.8, DBMS: 9.5 } (grade points average).
 */
function getSubjectAreaScores(academicRecords) {
  const areaSums = {};
  const areaCounts = {};
  const records = Array.isArray(academicRecords) ? academicRecords : [];
  for (const rec of records) {
    const subjects = rec.subjects || [];
    for (const sub of subjects) {
      const name = String(sub.name || '').toLowerCase();
      const code = String(sub.code || '').toLowerCase();
      const points = Number(sub.points);
      if (!Number.isFinite(points)) continue;
      let assigned = false;
      for (const [area, keywords] of Object.entries(SUBJECT_AREA_KEYWORDS)) {
        if (area === 'Other') continue;
        if (keywords.some(kw => name.includes(kw) || code.includes(kw))) {
          areaSums[area] = (areaSums[area] || 0) + points;
          areaCounts[area] = (areaCounts[area] || 0) + 1;
          assigned = true;
          break;
        }
      }
      if (!assigned && name) {
        areaSums['Other'] = (areaSums['Other'] || 0) + points;
        areaCounts['Other'] = (areaCounts['Other'] || 0) + 1;
      }
    }
  }
  const scores = {};
  for (const area of Object.keys(areaSums)) {
    const n = areaCounts[area] || 1;
    scores[area] = areaSums[area] / n;
  }
  return scores;
}

/**
 * Normalize interest/career strings for matching (lowercase, trim).
 */
function normalizeTags(arr) {
  return (arr || []).map(s => String(s).toLowerCase().trim()).filter(Boolean);
}

/**
 * Jaccard-like overlap: how many of courseTags appear in studentTags (or similar).
 * Returns value in [0, 1].
 */
function tagOverlap(studentTags, courseTags) {
  const s = new Set(normalizeTags(studentTags));
  const c = new Set(normalizeTags(courseTags));
  if (c.size === 0) return 0.5; // no tags -> neutral
  let match = 0;
  for (const t of c) {
    if (s.has(t)) { match += 1; continue; }
    // Partial match: e.g. "web development" vs "Web Development" or "machine learning" vs "ML"
    for (const st of s) {
      if (st.includes(t) || t.includes(st) || st.replace(/\s/g, '') === t.replace(/\s/g, '')) {
        match += 1;
        break;
      }
    }
  }
  return match / c.size;
}

/**
 * Career goal match: 1 if student career goal is in course career_paths (or fuzzy), else 0.
 */
function careerMatch(careerGoal, courseCareerPaths) {
  if (!careerGoal || !courseCareerPaths || courseCareerPaths.length === 0) return 0.5;
  const goal = String(careerGoal).toLowerCase().trim();
  const paths = normalizeTags(courseCareerPaths);
  if (paths.some(p => p.includes(goal) || goal.includes(p))) return 1;
  if (paths.includes('any')) return 0.7;
  return 0;
}

/**
 * Subject area fit: average of student's grade in each required subject area for the course.
 * If course has no subject_areas, return 0.5 (neutral). Scale by 10 so 10 points -> 1.0.
 */
function subjectAreaFit(studentAreaScores, courseSubjectAreas) {
  const areas = parseJsonField(courseSubjectAreas);
  if (areas.length === 0) return 0.5;
  let sum = 0;
  for (const area of areas) {
    const score = studentAreaScores[area];
    // Grade points are 0-10; normalize to 0-1
    sum += score != null ? Math.min(1, score / 10) : 0.5;
  }
  return sum / areas.length;
}

/**
 * Difficulty appropriateness: recommend courses that are challenging but not overwhelming.
 * High CGPA -> can handle higher difficulty. Low CGPA -> prefer lower difficulty.
 * Returns value in [0, 1]. Optimal: course difficulty slightly above current "level" from CGPA.
 */
function difficultyFit(cgpa, courseDifficulty) {
  const d = Number(courseDifficulty);
  if (!Number.isFinite(d)) return 0.5;
  const level = cgpa != null && Number.isFinite(cgpa) ? Math.min(5, Math.max(1, (cgpa / 2))) : 2; // CGPA 2->1, 10->5
  const diff = Math.abs(d - level);
  if (diff <= 1) return 1;
  if (diff <= 2) return 0.7;
  return Math.max(0.2, 0.5 - diff * 0.15);
}

/**
 * Content-based scoring weights (tuned for mentoring context).
 * These act as the "model" parameters for the recommendation algorithm.
 */
const WEIGHTS = {
  interestMatch: 0.35,
  careerMatch: 0.25,
  subjectAreaFit: 0.25,
  difficultyFit: 0.15
};

/**
 * Recommend courses for a student based on their profile and academic statistics.
 * @param {Object} student - { cgpa, interests, careerGoal, academicRecords }
 * @param {Array} courses - List of course rows from DB (id, name, description, category, difficulty, skills, career_paths, subject_areas)
 * @param {number} limit - Max number of recommendations
 * @returns {Array} { id, name, description, category, difficulty, score, reasons } sorted by score desc
 */
function recommendCourses(student, courses, limit = 10) {
  const interests = parseJsonField(student.interests);
  const careerGoal = student.careerGoal || student.career_goal || '';
  const cgpa = student.cgpa != null ? Number(student.cgpa) : null;
  const academicRecords = student.academicRecords || student.academic_records || [];
  const areaScores = getSubjectAreaScores(academicRecords);

  const scored = (courses || []).map(row => {
    const id = row.id;
    const name = row.name;
    const description = row.description || '';
    const category = row.category || '';
    const difficulty = row.difficulty != null ? Number(row.difficulty) : 2;
    const skills = parseJsonField(row.skills);
    const careerPaths = parseJsonField(row.career_paths);
    const subjectAreas = parseJsonField(row.subject_areas);

    const interestScore = tagOverlap(interests, skills) || tagOverlap(interests, [category]);
    const careerScore = careerMatch(careerGoal, careerPaths);
    const subjectScore = subjectAreaFit(areaScores, subjectAreas);
    const diffScore = difficultyFit(cgpa, difficulty);

    const score =
      WEIGHTS.interestMatch * interestScore +
      WEIGHTS.careerMatch * careerScore +
      WEIGHTS.subjectAreaFit * subjectScore +
      WEIGHTS.difficultyFit * diffScore;

    const reasons = [];
    if (interestScore > 0.5) reasons.push('Matches your interests');
    if (careerScore >= 0.7) reasons.push('Aligns with your career goal');
    if (subjectScore > 0.6) reasons.push('Builds on your strong subjects');
    if (diffScore > 0.7) reasons.push('Right level for your current progress');

    return {
      id,
      name,
      description,
      category,
      difficulty,
      score: Math.round(score * 100) / 100,
      reasons: reasons.length ? reasons : ['Recommended for your profile']
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

module.exports = { recommendCourses, getSubjectAreaScores };
