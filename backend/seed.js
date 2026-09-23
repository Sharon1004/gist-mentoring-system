// Seeds the database with the demo accounts documented in LOGIN_CREDENTIALS.md
// Run: node backend/seed.js
// Safe to re-run: uses INSERT ... ON DUPLICATE KEY UPDATE everywhere.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { pool, initDatabase } = require('./db');

const ADMINS = [
  { id: 'admin1', password: 'admin123', name: 'Super Admin - GIST Nellore', role: 'super_admin', branch: null },
  { id: 'admin_cse', password: 'admin123', name: 'CSE Branch Admin', role: 'branch_admin', branch: 'CSE' },
  { id: 'admin_ece', password: 'admin123', name: 'ECE Branch Admin', role: 'branch_admin', branch: 'ECE' },
  { id: 'admin_eee', password: 'admin123', name: 'EEE Branch Admin', role: 'branch_admin', branch: 'EEE' },
  { id: 'admin_mech', password: 'admin123', name: 'MECH Branch Admin', role: 'branch_admin', branch: 'MECH' },
  { id: 'admin_civil', password: 'admin123', name: 'CIVIL Branch Admin', role: 'branch_admin', branch: 'CIVIL' },
];

const MENTORS = [
  { id: 'mentor1', password: 'mentor123', name: 'Dr. Ramesh Kumar', department: 'CSE' },
  { id: 'mentor2', password: 'mentor123', name: 'Dr. Suresh Reddy', department: 'ECE' },
  { id: 'mentor3', password: 'mentor123', name: 'Dr. Lakshmi ECE', department: 'ECE' },
  { id: 'mentor4', password: 'mentor123', name: 'Dr. EEE Head', department: 'EEE' },
  { id: 'mentor5', password: 'mentor123', name: 'Dr. MECH Head', department: 'MECH' },
  { id: 'mentor6', password: 'mentor123', name: 'Dr. CIVIL Head', department: 'CIVIL' },
];

// NEW: Added the Branches to seed into the database
const BRANCHES = [
  { code: 'AIML', name: 'Artificial Intelligence & Machine Learning', regulation_name: 'R23 Regulation' },
  { code: 'AIDS', name: 'Artificial Intelligence & Data Science', regulation_name: 'R23 Regulation' },
  { code: 'CSE', name: 'Computer Science and Engineering', regulation_name: 'R23 Regulation' },
  { code: 'ECE', name: 'Electronics and Communication Engineering', regulation_name: 'R23 Regulation' },
  { code: 'EEE', name: 'Electrical and Electronics Engineering', regulation_name: 'R23 Regulation' },
  { code: 'MECH', name: 'Mechanical Engineering', regulation_name: 'R23 Regulation' },
  { code: 'CIVIL', name: 'Civil Engineering', regulation_name: 'R23 Regulation' }
];

// department -> default mentor id for that department's students
const DEFAULT_MENTOR = { CSE: 'mentor1', ECE: 'mentor2', EEE: 'mentor4', MECH: 'mentor5', CIVIL: 'mentor6' };
const YEAR_LABEL = { 22: 'II B.Tech', 23: 'I B.Tech', 21: 'III B.Tech', 20: 'IV B.Tech', 12: 'III B.Tech' };

const STUDENTS = [
  // CSE
  ['222U1A0501', 'K. Sai Teja', 'CSE', 22, 8.7],
  ['222U1A0502', 'P. Anjali', 'CSE', 22, 8.2],
  ['222U1A0503', 'R. Kiran', 'CSE', 22, 7.9],
  ['232U1A0501', 'A. Divya', 'CSE', 23, 8.0],
  ['232U1A0502', 'B. Rahul', 'CSE', 23, 7.6],
  ['212U1A0501', 'C. Priya', 'CSE', 21, 8.4],
  ['212U1A0502', 'D. Vikram', 'CSE', 21, 7.8],
  ['202U1A0501', 'E. Sneha', 'CSE', 20, 8.9],
  ['202U1A0502', 'F. Arjun', 'CSE', 20, 8.1],
  // ECE
  ['222U1A0301', 'G. Vamsi', 'ECE', 22, 8.0],
  ['222U1A0302', 'H. Keerthi', 'ECE', 22, 7.7],
  ['232U1A0301', 'I. Sravan', 'ECE', 23, 7.5],
  ['212U1A0301', 'J. Nithya', 'ECE', 21, 8.3],
  ['202U1A0301', 'K. Ravi', 'ECE', 20, 8.6],
  // EEE
  ['222U1A0401', 'L. Manoj', 'EEE', 22, 7.9],
  ['222U1A0402', 'M. Swathi', 'EEE', 22, 8.1],
  ['232U1A0401', 'N. Teja', 'EEE', 23, 7.4],
  ['212U1A0401', 'O. Kavya', 'EEE', 21, 8.5],
  ['202U1A0401', 'P. Sridhar', 'EEE', 20, 8.0],
  // MECH
  ['222U1A0101', 'Q. Ramesh', 'MECH', 22, 7.6],
  ['222U1A0102', 'R. Pooja', 'MECH', 22, 8.2],
  ['232U1A0101', 'S. Kumar', 'MECH', 23, 7.3],
  ['212U1A0101', 'T. Anusha', 'MECH', 21, 8.4],
  ['202U1A0101', 'U. Venkat', 'MECH', 20, 7.9],
  // CIVIL
  ['222U1A0201', 'V. Srinivas', 'CIVIL', 22, 7.8],
  ['222U1A0202', 'W. Lakshmi', 'CIVIL', 22, 8.0],
  ['232U1A0201', 'X. Rajesh', 'CIVIL', 23, 7.5],
  ['212U1A0201', 'Y. Deepa', 'CIVIL', 21, 8.3],
  ['202U1A0201', 'Z. Karthik', 'CIVIL', 20, 8.1],
];

async function seed() {
  const ok = await initDatabase();
  if (!ok) {
    console.error('Database not reachable — check backend/.env credentials and that MySQL/MariaDB is running.');
    process.exit(1);
  }

  // NEW: Seed the branches so the API returns data
  console.log('Seeding branches...');
  for (const b of BRANCHES) {
    try {
      // Assuming your branches table expects code, name, and regulation_name
      // If your schema uses a different name for regulation_name (like regulation_id), 
      // you may need to adjust the column name below to match your schema.sql
      await pool.query(
        `INSERT INTO branches (code, name, regulation_name) VALUES (?,?,?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), regulation_name=VALUES(regulation_name)`,
        [b.code, b.name, b.regulation_name]
      );
    } catch (err) {
      console.warn(`Note: Could not insert branch ${b.code}. Please ensure your 'branches' table has 'code', 'name', and 'regulation_name' columns.`);
    }
  }

  console.log('Seeding admins...');
  for (const a of ADMINS) {
    await pool.query(
      `INSERT INTO admins (id, password, name, role, branch) VALUES (?,?,?,?,?)
       ON DUPLICATE KEY UPDATE password=VALUES(password), name=VALUES(name), role=VALUES(role), branch=VALUES(branch)`,
      [a.id, a.password, a.name, a.role, a.branch]
    );
  }

  console.log('Seeding mentors...');
  for (const m of MENTORS) {
    await pool.query(
      `INSERT INTO mentors (id, password, name, department, students) VALUES (?,?,?,?,0)
       ON DUPLICATE KEY UPDATE password=VALUES(password), name=VALUES(name), department=VALUES(department)`,
      [m.id, m.password, m.name, m.department]
    );
  }

  console.log('Seeding students...');
  for (const [rollNo, name, dept, yy, cgpa] of STUDENTS) {
    const mentorId = DEFAULT_MENTOR[dept];
    const mentorRow = MENTORS.find((m) => m.id === mentorId);
    await pool.query(
      `INSERT INTO students (roll_no, password, name, cgpa, mentor_id, mentor, department, year)
       VALUES (?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE password=VALUES(password), name=VALUES(name), cgpa=VALUES(cgpa),
         mentor_id=VALUES(mentor_id), mentor=VALUES(mentor), department=VALUES(department), year=VALUES(year)`,
      [rollNo, 'student123', name, cgpa, mentorId, mentorRow ? mentorRow.name : null, dept, YEAR_LABEL[yy] || null]
    );
  }

  console.log('Recomputing mentor student counts...');
  await pool.query(
    `UPDATE mentors m SET students = (SELECT COUNT(*) FROM students s WHERE s.mentor_id = m.id)`
  );

  console.log('\n✅ Seed complete:');
  console.log(`   ${BRANCHES.length} branches, ${ADMINS.length} admins, ${MENTORS.length} mentors, ${STUDENTS.length} students.`);
  console.log('   Admin:   admin1 / admin123 (super admin) — see LOGIN_CREDENTIALS.md for branch admins');
  console.log('   Mentor:  mentor1 / mentor123 (see LOGIN_CREDENTIALS.md for the rest)');
  console.log('   Student: any roll no above / student123');
  process.exit(0);
}

seed().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});