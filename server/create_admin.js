// Script to create an initial admin user
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function main() {
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '1234',
    database: process.env.DATABASE_NAME || 'political_canvas',
  });

  const username = 'admin';
  const password = 'admin123'; // Change this!
  const role = 'admin';
  
  const hash = await bcrypt.hash(password, 10);
  
  try {
    await db.execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hash, role]
    );
    console.log(`Admin user created: ${username}`);
    console.log(`Password: ${password}`);
    console.log('Please change the password after first login!');
  } catch (err) {
    console.error('Error creating admin:', err.message);
  }

  await db.end();
}

main();
