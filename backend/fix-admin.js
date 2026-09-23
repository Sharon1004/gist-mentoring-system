// Quick script to fix admin1 login
// Run: node backend/fix-admin.js

const { pool } = require('./db');

async function fixAdmin() {
  try {
    console.log('Checking admins table...');
    
    // Check if admins table exists
    const [tables] = await pool.query("SHOW TABLES LIKE 'admins'").catch(() => [[]]);
    if (!tables || tables.length === 0) {
      console.log('Admins table does not exist. Creating...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS admins (
          id VARCHAR(64) PRIMARY KEY,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(32) NOT NULL DEFAULT 'branch_admin',
          branch VARCHAR(64) DEFAULT NULL
        )
      `);
      console.log('Admins table created.');
    }

    // Check if role column exists
    try {
      await pool.query('SELECT role FROM admins LIMIT 1');
    } catch (e) {
      if (e.code === 'ER_BAD_FIELD_ERROR') {
        console.log('Adding role and branch columns...');
        await pool.query('ALTER TABLE admins ADD COLUMN role VARCHAR(32) NOT NULL DEFAULT "branch_admin"');
        await pool.query('ALTER TABLE admins ADD COLUMN branch VARCHAR(64) DEFAULT NULL');
        console.log('Columns added.');
      }
    }

    // Check if admin1 exists
    const [admins] = await pool.query('SELECT id, name, role FROM admins WHERE id = ?', ['admin1']);
    if (!admins || admins.length === 0) {
      console.log('Creating admin1...');
      await pool.query(`
        INSERT INTO admins (id, password, name, role, branch) VALUES
        ('admin1', 'admin123', 'Super Admin - GIST Nellore', 'super_admin', NULL)
      `);
      console.log('✅ admin1 created successfully!');
    } else {
      console.log('admin1 already exists. Updating to super_admin...');
      await pool.query(`
        UPDATE admins SET 
          password = 'admin123',
          name = 'Super Admin - GIST Nellore',
          role = 'super_admin',
          branch = NULL
        WHERE id = 'admin1'
      `);
      console.log('✅ admin1 updated successfully!');
    }

    console.log('\n✅ Super Admin credentials:');
    console.log('   Admin ID: admin1');
    console.log('   Password: admin123');
    console.log('\nYou can now login at admin-login.html');
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    console.error('Make sure MySQL is running and backend/db.js has correct credentials.');
    process.exit(1);
  }
}

fixAdmin();
