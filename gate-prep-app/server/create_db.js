const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function createDatabase() {
  console.log("Attempting to connect to MySQL to create database...");
  console.log(`User: ${process.env.DB_USER}`);
  console.log(`Host: ${process.env.DB_HOST}`);
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    const dbName = process.env.DB_NAME || 'gate';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' created successfully.`);
    
    console.log("✅ Database setup complete. Tables will be created when you start the server.");
    await connection.end();
  } catch (error) {
    console.error('❌ Error creating database:', error.message);
    console.error('Please check your password and ensure MySQL server is running.');
    process.exit(1);
  }
}

createDatabase();