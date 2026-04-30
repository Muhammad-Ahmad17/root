// ─────────────────────────────────────────────────────────────
// Database Setup Script: Create tables
// ─────────────────────────────────────────────────────────────

require('dotenv').config();
const pool = require('./config/db');

// ─────────────────────────────────────────────────────────────
// SQL to create the users table
// ─────────────────────────────────────────────────────────────
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
`;

// ─────────────────────────────────────────────────────────────
// Execute the setup
// ─────────────────────────────────────────────────────────────
async function setupDatabase() {
  try {
    console.log('Setting up database...');

    // Execute the CREATE TABLE query
    await pool.query(createUsersTable);

    console.log('✓ Users table created successfully');

    // Close the pool connection
    await pool.end();

    console.log('✓ Database setup complete');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error setting up database:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();