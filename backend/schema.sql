-- GIST Mentoring System - MySQL Schema
--
-- First-time setup:
--   mysql -u root -p < backend/schema.sql
-- Or create DB then run:
--   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS gist_mentoring_system;"
--   mysql -u root -p gist_mentoring_system < backend/schema.sql
--
-- No default user credentials are created by this schema.
-- For existing DB: ALTER TABLE admins ADD COLUMN role VARCHAR(32) NOT NULL DEFAULT 'branch_admin';
--                 ALTER TABLE admins ADD COLUMN branch VARCHAR(64) DEFAULT NULL;

CREATE DATABASE IF NOT EXISTS gist_mentoring_system;
USE gist_mentoring_system;

-- Admins (super_admin sees all; branch_admin restricted to their branch)
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(64) PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'branch_admin',
  branch VARCHAR(64) DEFAULT NULL
);

-- Regulations
CREATE TABLE IF NOT EXISTS regulations (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Branches under regulations
CREATE TABLE IF NOT EXISTS branches (
  id VARCHAR(64) PRIMARY KEY,
  regulation_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(32) NOT NULL,
  description TEXT DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (regulation_id) REFERENCES regulations(id) ON DELETE CASCADE
);

-- Subjects under branches
CREATE TABLE IF NOT EXISTS subjects (
  id VARCHAR(64) PRIMARY KEY,
  branch_id VARCHAR(64) NOT NULL,
  code VARCHAR(32) NOT NULL,
  name VARCHAR(255) NOT NULL,
  semester INT NOT NULL,
  credits INT NOT NULL,
  type VARCHAR(32) DEFAULT 'theory', -- theory, practical, elective
  description TEXT DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- Mentors
CREATE TABLE IF NOT EXISTS mentors (
  id VARCHAR(64) PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(64) NOT NULL,
  students INT DEFAULT 0
);

-- Students
CREATE TABLE IF NOT EXISTS students (
  roll_no VARCHAR(32) PRIMARY KEY,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  cgpa DECIMAL(4,2) DEFAULT NULL,
  mentor_id VARCHAR(64) DEFAULT NULL,
  mentor VARCHAR(255) DEFAULT NULL,
  department VARCHAR(64) NOT NULL,
  year VARCHAR(32) DEFAULT NULL,
  regulation_id VARCHAR(64) DEFAULT NULL,
  interests JSON DEFAULT NULL,
  career_goal VARCHAR(255) DEFAULT NULL,
  aspirations TEXT DEFAULT NULL,
  swot JSON DEFAULT NULL,
  academic_records JSON DEFAULT NULL,
  FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE SET NULL,
  FOREIGN KEY (regulation_id) REFERENCES regulations(id) ON DELETE SET NULL
);

-- Mentor feedback (per student)
CREATE TABLE IF NOT EXISTS mentor_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_roll_no VARCHAR(32) NOT NULL,
  category VARCHAR(64) NOT NULL,
  title VARCHAR(255) DEFAULT 'Mentor Feedback',
  message TEXT NOT NULL,
  priority VARCHAR(32) DEFAULT 'low',
  action_items TEXT DEFAULT NULL,
  resources TEXT DEFAULT NULL,
  date_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_roll_no) REFERENCES students(roll_no) ON DELETE CASCADE
);

-- Career suggestions (JSON per student)
CREATE TABLE IF NOT EXISTS career_suggestions (
  student_roll_no VARCHAR(32) PRIMARY KEY,
  suggestions JSON NOT NULL,
  FOREIGN KEY (student_roll_no) REFERENCES students(roll_no) ON DELETE CASCADE
);

-- Course catalog for ML-based recommendations (electives, skills, certifications)
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  category VARCHAR(64) NOT NULL,
  difficulty TINYINT DEFAULT 2 COMMENT '1=Beginner to 5=Advanced',
  skills JSON DEFAULT NULL COMMENT 'e.g. ["Python", "ML", "Web"]',
  career_paths JSON DEFAULT NULL COMMENT 'e.g. ["Software Developer", "Data Scientist"]',
  subject_areas JSON DEFAULT NULL COMMENT 'e.g. ["Programming", "Mathematics", "DBMS"]'
);

-- Seed course catalog for recommendations
INSERT IGNORE INTO courses (id, name, description, category, difficulty, skills, career_paths, subject_areas) VALUES
('python-adv', 'Advanced Python & Scripting', 'Deep dive into Python, OOP, and automation scripts.', 'Programming', 2, '["Python", "OOP", "Scripting"]', '["Software Developer", "Backend Developer"]', '["Programming"]'),
('web-fullstack', 'Full-Stack Web Development', 'HTML, CSS, JavaScript, Node.js, and a frontend framework.', 'Web Development', 3, '["JavaScript", "Node.js", "React", "HTML", "CSS"]', '["Software Developer", "Web Developer", "Frontend Developer"]', '["Programming"]'),
('ml-fundamentals', 'Machine Learning Fundamentals', 'Intro to ML, regression, classification, and scikit-learn.', 'Machine Learning', 3, '["Python", "Machine Learning", "Statistics"]', '["Data Scientist", "ML Engineer", "Software Developer"]', '["Programming", "Mathematics"]'),
('cloud-aws', 'Cloud Computing with AWS', 'EC2, S3, Lambda, and basic cloud architecture.', 'Cloud Computing', 3, '["AWS", "Cloud", "DevOps"]', '["Cloud Engineer", "DevOps", "Software Developer"]', '["Programming"]'),
('db-advanced', 'Advanced Database Systems', 'SQL optimization, NoSQL, and database design.', 'Databases', 3, '["SQL", "NoSQL", "Database Design"]', '["Backend Developer", "Data Engineer", "Software Developer"]', '["DBMS", "Programming"]'),
('dsa-competitive', 'Data Structures & Algorithms for Placements', 'DSA for coding interviews and competitive programming.', 'Programming', 4, '["DSA", "Problem Solving", "Algorithms"]', '["Software Developer", "SDE"]', '["Programming", "Mathematics"]'),
('devops-ci', 'DevOps & CI/CD', 'Docker, Jenkins, GitLab CI, and deployment pipelines.', 'DevOps', 4, '["Docker", "CI/CD", "Linux"]', '["DevOps Engineer", "SRE", "Software Developer"]', '["Programming"]'),
('data-science', 'Data Science with Python', 'Pandas, visualization, and exploratory data analysis.', 'Data Science', 3, '["Python", "Pandas", "Visualization", "Statistics"]', '["Data Scientist", "Analyst"]', '["Programming", "Mathematics"]'),
('mobile-android', 'Android App Development', 'Kotlin/Java and Android SDK for mobile apps.', 'Mobile Development', 3, '["Kotlin", "Android", "Mobile"]', '["Mobile Developer", "Software Developer"]', '["Programming"]'),
('cyber-security', 'Cybersecurity Basics', 'Network security, ethical hacking, and secure coding.', 'Security', 3, '["Security", "Networking", "Cryptography"]', '["Security Engineer", "Software Developer"]', '["Programming"]'),
('ai-deep', 'Deep Learning & Neural Networks', 'TensorFlow/Keras and neural network architectures.', 'Machine Learning', 5, '["Python", "Deep Learning", "TensorFlow"]', '["ML Engineer", "Data Scientist", "Researcher"]', '["Programming", "Mathematics"]'),
('soft-skills', 'Communication & Soft Skills', 'Presentation, teamwork, and professional communication.', 'Soft Skills', 1, '["Communication", "Leadership"]', '["Software Developer", "Manager", "Any"]', '[]');

-- Seed regulations
INSERT IGNORE INTO regulations (id, name, description, is_active) VALUES
('r20', 'R20 Regulation', 'Autonomous Regulation 2020', TRUE),
('r22', 'R22 Regulation', 'Autonomous Regulation 2022', TRUE);

-- Seed branches
INSERT IGNORE INTO branches (id, regulation_id, name, code, description, is_active) VALUES
('cse-r20', 'r20', 'Computer Science and Engineering', 'CSE', 'CSE Branch under R20', TRUE),
('ece-r20', 'r20', 'Electronics and Communication Engineering', 'ECE', 'ECE Branch under R20', TRUE),
('eee-r20', 'r20', 'Electrical and Electronics Engineering', 'EEE', 'EEE Branch under R20', TRUE),
('mech-r20', 'r20', 'Mechanical Engineering', 'MECH', 'MECH Branch under R20', TRUE),
('civil-r20', 'r20', 'Civil Engineering', 'CIVIL', 'CIVIL Branch under R20', TRUE),
('cse-r22', 'r22', 'Computer Science and Engineering', 'CSE', 'CSE Branch under R22', TRUE),
('ece-r22', 'r22', 'Electronics and Communication Engineering', 'ECE', 'ECE Branch under R22', TRUE),
('eee-r22', 'r22', 'Electrical and Electronics Engineering', 'EEE', 'EEE Branch under R22', TRUE),
('mech-r22', 'r22', 'Mechanical Engineering', 'MECH', 'MECH Branch under R22', TRUE),
('civil-r22', 'r22', 'Civil Engineering', 'CIVIL', 'CIVIL Branch under R22', TRUE);

-- Seed some sample subjects
INSERT IGNORE INTO subjects (id, branch_id, code, name, semester, credits, type, description, is_active) VALUES
('cse-r20-1-1', 'cse-r20', 'CS101', 'Programming in C', 1, 4, 'theory', 'Introduction to C Programming', TRUE),
('cse-r20-1-2', 'cse-r20', 'CS102', 'Data Structures', 2, 4, 'theory', 'Data Structures and Algorithms', TRUE),
('cse-r20-2-1', 'cse-r20', 'CS201', 'Object Oriented Programming', 3, 4, 'theory', 'OOP with Java', TRUE),
('cse-r20-2-2', 'cse-r20', 'CS202', 'Database Management Systems', 4, 4, 'theory', 'DBMS Concepts', TRUE),
('ece-r20-1-1', 'ece-r20', 'EC101', 'Electronic Devices and Circuits', 1, 4, 'theory', 'Basic Electronic Components', TRUE),
('ece-r20-1-2', 'ece-r20', 'EC102', 'Digital Electronics', 2, 4, 'theory', 'Digital Logic Design', TRUE);
-- Create admins/mentors/students explicitly via secure provisioning.
