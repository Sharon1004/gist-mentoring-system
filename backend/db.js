const path = require('path');
// Load backend/.env regardless of which script requires this module first,
// so db.js never silently falls back to default credentials.
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

const DB_NAME = process.env.MYSQL_DATABASE || 'gist_mentoring_system';
const poolConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'Kowshik',
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
};

let pool = mysql.createPool(poolConfig);

async function ensureDatabase() {
  const tempConfig = { ...poolConfig };
  delete tempConfig.database;
  let tempPool = null;
  try {
    tempPool = mysql.createPool(tempConfig);
    const conn = await tempPool.getConnection();
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
    conn.release();
    await tempPool.end();
    return true;
  } catch (err) {
    if (tempPool) try { await tempPool.end(); } catch (_) {}
    console.error('Could not create database:', err.message);
    return false;
  }
}


async function ensureTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mentors (
        id VARCHAR(64) PRIMARY KEY,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(64) NOT NULL,
        students INT DEFAULT 0
      )
    `);
    const studentsTableSql = `
      CREATE TABLE IF NOT EXISTS students (
        roll_no VARCHAR(32) PRIMARY KEY,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        cgpa DECIMAL(4,2) DEFAULT NULL,
        mentor_id VARCHAR(64) DEFAULT NULL,
        mentor VARCHAR(255) DEFAULT NULL,
        department VARCHAR(64) NOT NULL,
        year VARCHAR(32) DEFAULT NULL,
        interests TEXT DEFAULT NULL,
        career_goal VARCHAR(255) DEFAULT NULL,
        aspirations TEXT DEFAULT NULL,
        swot TEXT DEFAULT NULL,
        academic_records TEXT DEFAULT NULL,
        FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL
      )
    `;
    const studentsTableSqlNoFK = `
      CREATE TABLE IF NOT EXISTS students (
        roll_no VARCHAR(32) PRIMARY KEY,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        cgpa DECIMAL(4,2) DEFAULT NULL,
        mentor_id VARCHAR(64) DEFAULT NULL,
        mentor VARCHAR(255) DEFAULT NULL,
        department VARCHAR(64) NOT NULL,
        year VARCHAR(32) DEFAULT NULL,
        interests TEXT DEFAULT NULL,
        career_goal VARCHAR(255) DEFAULT NULL,
        aspirations TEXT DEFAULT NULL,
        swot TEXT DEFAULT NULL,
        academic_records TEXT DEFAULT NULL
      )
    `;
    try {
      await pool.query(studentsTableSql);
    } catch (fkErr) {
      await pool.query(studentsTableSqlNoFK);
    }
    const studentAlterStatements = [
      'ALTER TABLE students ADD COLUMN cgpa DECIMAL(4,2) DEFAULT NULL',
      'ALTER TABLE students ADD COLUMN mentor_id VARCHAR(64) DEFAULT NULL',
      'ALTER TABLE students ADD COLUMN mentor VARCHAR(255) DEFAULT NULL',
      'ALTER TABLE students ADD COLUMN year VARCHAR(32) DEFAULT NULL',
      'ALTER TABLE students ADD COLUMN interests TEXT DEFAULT NULL',
      'ALTER TABLE students ADD COLUMN career_goal VARCHAR(255) DEFAULT NULL',
      'ALTER TABLE students ADD COLUMN academic_records TEXT DEFAULT NULL',
      'ALTER TABLE students ADD COLUMN aspirations TEXT DEFAULT NULL',
      'ALTER TABLE students ADD COLUMN swot TEXT DEFAULT NULL'
    ];
    for (const sql of studentAlterStatements) {
      try {
        await pool.query(sql);
      } catch (e) {
        if (!String(e.code || '').includes('DUP_FIELDNAME')) throw e;
      }
    }
    const mentorAlterStatements = [
      'ALTER TABLE mentors ADD COLUMN students INT DEFAULT 0'
    ];
    for (const sql of mentorAlterStatements) {
      try {
        await pool.query(sql);
      } catch (e) {
        if (!String(e.code || '').includes('DUP_FIELDNAME')) throw e;
      }
    }
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(64) PRIMARY KEY,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(32) NOT NULL DEFAULT 'branch_admin',
        branch VARCHAR(64) DEFAULT NULL
      )
    `).catch(() => {});
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mentor_feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_roll_no VARCHAR(32) NOT NULL,
        category VARCHAR(64) NOT NULL,
        title VARCHAR(255) DEFAULT 'Mentor Feedback',
        message TEXT NOT NULL,
        priority VARCHAR(32) DEFAULT 'low',
        action_items TEXT DEFAULT NULL,
        resources TEXT DEFAULT NULL,
        date_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).catch(() => {});
    const mentorFeedbackAlterStatements = [
      'ALTER TABLE mentor_feedback ADD COLUMN title VARCHAR(255) DEFAULT \'Mentor Feedback\'',
      'ALTER TABLE mentor_feedback ADD COLUMN priority VARCHAR(32) DEFAULT \'low\'',
      'ALTER TABLE mentor_feedback ADD COLUMN action_items TEXT DEFAULT NULL',
      'ALTER TABLE mentor_feedback ADD COLUMN resources TEXT DEFAULT NULL',
      'ALTER TABLE mentor_feedback ADD COLUMN date_at DATETIME DEFAULT CURRENT_TIMESTAMP'
    ];
    for (const sql of mentorFeedbackAlterStatements) {
      try {
        await pool.query(sql);
      } catch (e) {
        if (!String(e.code || '').includes('DUP_FIELDNAME')) throw e;
      }
    }
    await pool.query(`
      CREATE TABLE IF NOT EXISTS career_suggestions (
        student_roll_no VARCHAR(32) PRIMARY KEY,
        suggestions JSON NOT NULL
      )
    `).catch(() => {});
    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        category VARCHAR(64) NOT NULL,
        difficulty TINYINT DEFAULT 2,
        skills JSON DEFAULT NULL,
        career_paths JSON DEFAULT NULL,
        subject_areas JSON DEFAULT NULL
      )
    `).catch(() => {});

    // Regulations system tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS regulations (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE
      )
    `).catch(() => {});

    await pool.query(`
      CREATE TABLE IF NOT EXISTS branches (
        id VARCHAR(64) PRIMARY KEY,
        regulation_id VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(32) NOT NULL,
        description TEXT DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (regulation_id) REFERENCES regulations(id) ON DELETE CASCADE
      )
    `).catch(() => {});

    await pool.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id VARCHAR(64) PRIMARY KEY,
        branch_id VARCHAR(64) NOT NULL,
        code VARCHAR(32) NOT NULL,
        name VARCHAR(255) NOT NULL,
        semester INT NOT NULL,
        credits DECIMAL(4,2) NOT NULL,
        type VARCHAR(32) DEFAULT 'theory',
        description TEXT DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
      )
    `).catch(() => {});

    // Add regulation_id to students table
    try {
      await pool.query('ALTER TABLE students ADD COLUMN regulation_id VARCHAR(64) DEFAULT NULL');
    } catch (e) {
      if (!String(e.code || '').includes('DUP_FIELDNAME')) throw e;
    }

    return true;
  } catch (err) {
    console.error('Could not create tables:', err.message);
    return false;
  }
}

async function testConnection() {
  try {
    const conn = await pool.getConnection();
    conn.release();
    console.log('MySQL connected successfully.');
    return true;
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
    return false;
  }
}

async function initDatabase() {
  let ok = await testConnection();
  if (!ok) {
    console.log('Trying to create database...');
    await ensureDatabase();
    ok = await testConnection();
  }
  if (ok) {
    await ensureTables();
  }
  return ok;
}

module.exports = { pool, testConnection, initDatabase, ensureTables };
