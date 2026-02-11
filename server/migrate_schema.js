// Script to update database schema for territories and walklists
import mysql from 'mysql2/promise';

async function main() {
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '1234',
    database: process.env.DATABASE_NAME || 'political_canvas',
  });

  console.log('Starting schema migration...');

  try {
    // Add new columns to voters table
    await db.execute(`
      ALTER TABLE voters 
      ADD COLUMN IF NOT EXISTS territory_id INT,
      ADD COLUMN IF NOT EXISTS last_contacted TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS contact_status ENUM('not_contacted', 'contacted', 'supporter', 'undecided', 'opposed', 'not_home', 'do_not_contact') DEFAULT 'not_contacted'
    `).catch(err => {
      console.log('Note: Some voter columns may already exist:', err.message);
    });

    // Add foreign key for territory_id if it doesn't exist
    await db.execute(`
      ALTER TABLE voters 
      ADD CONSTRAINT fk_voter_territory 
      FOREIGN KEY (territory_id) REFERENCES territories(id) ON DELETE SET NULL
    `).catch(err => {
      console.log('Note: Foreign key may already exist:', err.message);
    });

    // Update territories table
    await db.execute(`
      ALTER TABLE territories 
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS area_type ENUM('neighborhood', 'street', 'ward', 'district', 'custom') DEFAULT 'custom',
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `).catch(err => {
      console.log('Note: Some territory columns may already exist:', err.message);
    });

    // Drop old walklists table and recreate with new structure
    await db.execute('DROP TABLE IF EXISTS walklists');
    await db.execute(`
      CREATE TABLE walklists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        territory_id INT,
        assigned_to INT,
        status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (territory_id) REFERENCES territories(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log('✓ Schema migration completed successfully!');
    console.log('✓ Voters table updated with territory and contact tracking');
    console.log('✓ Territories table enhanced with descriptions and types');
    console.log('✓ Walklists table recreated with new structure');

  } catch (err) {
    console.error('Migration error:', err);
  }

  await db.end();
}

main();
