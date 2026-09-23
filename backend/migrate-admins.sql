-- Run this if you already have the database and need to add Super Admin / branch admin support.
-- mysql -u root -p gist_mentoring_system < backend/migrate-admins.sql
-- If you get "Duplicate column name", that column already exists; run the remaining statements.

USE gist_mentoring_system;

-- Add role and branch columns (run one at a time; if Duplicate column, skip that line)
ALTER TABLE admins ADD COLUMN role VARCHAR(32) NOT NULL DEFAULT 'branch_admin';
ALTER TABLE admins ADD COLUMN branch VARCHAR(64) DEFAULT NULL;

-- Update existing admin to super_admin
UPDATE admins SET role = 'super_admin', branch = NULL WHERE id = 'admin1';

-- Insert branch admins if not present
INSERT IGNORE INTO admins (id, password, name, role, branch) VALUES
  ('admin_cse', 'admin123', 'CSE Branch Admin', 'branch_admin', 'CSE'),
  ('admin_ece', 'admin123', 'ECE Branch Admin', 'branch_admin', 'ECE'),
  ('admin_eee', 'admin123', 'EEE Branch Admin', 'branch_admin', 'EEE'),
  ('admin_mech', 'admin123', 'MECH Branch Admin', 'branch_admin', 'MECH'),
  ('admin_civil', 'admin123', 'CIVIL Branch Admin', 'branch_admin', 'CIVIL');
