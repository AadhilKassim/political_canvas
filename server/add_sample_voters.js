// Script to add sample voters to the database
import mysql from 'mysql2/promise';

async function main() {
  const db = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '1234',
    database: process.env.DATABASE_NAME || 'political_canvas',
  });

  const voters = [
    { name: 'Alice Thomas', address: '123 Main St', age: 34, gender: 'Female', party: 'UDF', leaning: 'Center', consent: true },
    { name: 'Rajesh Kumar', address: '456 Lake Rd', age: 42, gender: 'Male', party: 'LDF', leaning: 'Left', consent: true },
    { name: 'Priya Nair', address: '789 Hill Ave', age: 28, gender: 'Female', party: 'BJP', leaning: 'Right', consent: false },
    { name: 'John Mathew', address: '321 River St', age: 51, gender: 'Male', party: 'UDF', leaning: 'Center', consent: true },
    { name: 'Anil Menon', address: '654 Park Lane', age: 37, gender: 'Male', party: 'Others', leaning: 'None', consent: false },
    { name: 'Meera Varma', address: '987 Forest Dr', age: 45, gender: 'Female', party: 'LDF', leaning: 'Left', consent: true },
    { name: 'Suresh Babu', address: '159 Ocean Blvd', age: 60, gender: 'Male', party: 'BJP', leaning: 'Right', consent: true },
    { name: 'Lakshmi Pillai', address: '753 Valley Rd', age: 29, gender: 'Female', party: 'UDF', leaning: 'Center', consent: false },
    { name: 'Vijay Das', address: '852 Mountain St', age: 39, gender: 'Male', party: 'Others', leaning: 'None', consent: true },
    { name: 'Divya Suresh', address: '951 Garden Ave', age: 33, gender: 'Female', party: 'LDF', leaning: 'Left', consent: true },
  ];

  for (const v of voters) {
    await db.execute(
      'INSERT INTO voters (name, address, age, gender, party, leaning, consent) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [v.name, v.address, v.age, v.gender, v.party, v.leaning, v.consent]
    );
    console.log(`Inserted voter: ${v.name}`);
  }

  await db.end();
  console.log('Sample voters inserted.');
}

main().catch(err => {
  console.error('Error inserting sample voters:', err);
});
