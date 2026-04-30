// ─────────────────────────────────────────────────────────────
// User Model: Database queries for user CRUD operations
// ─────────────────────────────────────────────────────────────

const pool = require('../config/db');

// ─────────────────────────────────────────────────────────────
// CREATE: Insert a new user into the database
// ─────────────────────────────────────────────────────────────
const createUser = async (userData) => {
  // Destructure the incoming user data (name, email, password)
  const { name, email, password } = userData;

  // SQL INSERT query with parameterized placeholders ($1, $2, $3)
  // to prevent SQL injection attacks
  const query = `
    INSERT INTO users (name, email, password, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING id, name, email, created_at;
  `;

  try {
    // Execute the query with the provided values
    const result = await pool.query(query, [name, email, password]);

    // Return the newly created user (postgres returns it with RETURNING)
    return result.rows[0];
  } catch (error) {
    // Log and re-throw the error so the controller can handle it
    console.error('Error creating user:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// READ: Get all users from the database
// ─────────────────────────────────────────────────────────────
const getAllUsers = async () => {
  // SQL SELECT query to fetch all users (except password for security)
  const query = `
    SELECT id, name, email, created_at
    FROM users
    ORDER BY created_at DESC;
  `;

  try {
    // Execute the query
    const result = await pool.query(query);

    // Return an array of all users
    return result.rows;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// READ: Get a single user by ID
// ─────────────────────────────────────────────────────────────
const getUserById = async (id) => {
  // SQL SELECT query with WHERE clause to find user by id
  const query = `
    SELECT id, name, email, created_at
    FROM users
    WHERE id = $1;
  `;

  try {
    // Execute the query with the user id
    const result = await pool.query(query, [id]);

    // Return the first row (or undefined if no match)
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// READ: Get a user by email (useful for login checks)
// ─────────────────────────────────────────────────────────────
const getUserByEmail = async (email) => {
  // SQL SELECT query to find user by email
  const query = `
    SELECT id, name, email, password, created_at
    FROM users
    WHERE email = $1;
  `;

  try {
    // Execute the query with the email
    const result = await pool.query(query, [email]);

    // Return the user row (includes password for auth comparison)
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE: Modify an existing user's data
// ─────────────────────────────────────────────────────────────
const updateUser = async (id, updateData) => {
  // Destructure the fields that can be updated
  const { name, email } = updateData;

  // SQL UPDATE query with parameterized values
  // Set updated_at to NOW() to track when the change happened
  const query = `
    UPDATE users
    SET name = $1, email = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING id, name, email, created_at, updated_at;
  `;

  try {
    // Execute the query with new values and the user id
    const result = await pool.query(query, [name, email, id]);

    // Return the updated user record
    return result.rows[0];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE: Remove a user from the database
// ─────────────────────────────────────────────────────────────
const deleteUser = async (id) => {
  // SQL DELETE query to remove user by id
  const query = `
    DELETE FROM users
    WHERE id = $1
    RETURNING id;
  `;

  try {
    // Execute the query with the user id
    const result = await pool.query(query, [id]);

    // Return the deleted user's id (proof of deletion)
    return result.rows[0];
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────
// Export all model functions for use in controllers
// ─────────────────────────────────────────────────────────────
module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
};
