// ─────────────────────────────────────────────────────────────
// User Controller: Handle HTTP requests and business logic
// ─────────────────────────────────────────────────────────────

// Import the user model that contains all database queries
const userModel = require('../models/user.model');

// ─────────────────────────────────────────────────────────────
// CREATE: Handle POST request to create a new user
// ─────────────────────────────────────────────────────────────
const createUser = async (req, res) => {
  try {
    // Extract user data from the request body
    // Expected: { name: "John", email: "john@example.com", password: "secret" }
    const { name, email, password } = req.body;

    // Validate that all required fields are provided
    if (!name || !email || !password) {
      // Return 400 (Bad Request) if any field is missing
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Call the model function to insert the user into the database
    const newUser = await userModel.createUser({ name, email, password });

    // Return 201 (Created) with the new user data
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser,
    });
  } catch (error) {
    // Log the error for debugging
    console.error('Error in createUser controller:', error);

    // Check if this is a database constraint violation (e.g., duplicate email)
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Return 500 (Internal Server Error) for unexpected errors
    return res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// READ: Handle GET request to fetch all users
// ─────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    // Call the model function to fetch all users from the database
    const users = await userModel.getAllUsers();

    // Return 200 (OK) with the list of users
    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      count: users.length,
      data: users,
    });
  } catch (error) {
    // Log the error for debugging
    console.error('Error in getAllUsers controller:', error);

    // Return 500 (Internal Server Error)
    return res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// READ: Handle GET request to fetch a single user by ID
// ─────────────────────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    // Extract the user ID from the URL parameter (e.g., /users/:id)
    const { id } = req.params;

    // Validate that id is a valid number
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required',
      });
    }

    // Call the model function to fetch the user by id
    const user = await userModel.getUserById(id);

    // Check if user was found
    if (!user) {
      // Return 404 (Not Found) if user doesn't exist
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Return 200 (OK) with the user data
    return res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      data: user,
    });
  } catch (error) {
    // Log the error for debugging
    console.error('Error in getUserById controller:', error);

    // Return 500 (Internal Server Error)
    return res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE: Handle PUT request to update an existing user
// ─────────────────────────────────────────────────────────────
const updateUser = async (req, res) => {
  try {
    // Extract the user ID from the URL parameter
    const { id } = req.params;

    // Extract the fields to update from the request body
    // Expected: { name: "Jane", email: "jane@example.com" }
    const { name, email } = req.body;

    // Validate that id is a valid number
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required',
      });
    }

    // Validate that at least one field is provided for update
    if (!name && !email) {
      return res.status(400).json({
        success: false,
        message: 'At least one field (name or email) is required',
      });
    }

    // First, check if the user exists
    const existingUser = await userModel.getUserById(id);

    if (!existingUser) {
      // Return 404 (Not Found) if user doesn't exist
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Call the model function to update the user
    // Use existing values for fields that are not being updated
    const updatedUser = await userModel.updateUser(id, {
      name: name || existingUser.name,
      email: email || existingUser.email,
    });

    // Return 200 (OK) with the updated user data
    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    // Log the error for debugging
    console.error('Error in updateUser controller:', error);

    // Check if this is a duplicate email error
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Return 500 (Internal Server Error)
    return res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE: Handle DELETE request to remove a user
// ─────────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    // Extract the user ID from the URL parameter
    const { id } = req.params;

    // Validate that id is a valid number
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required',
      });
    }

    // First, check if the user exists
    const existingUser = await userModel.getUserById(id);

    if (!existingUser) {
      // Return 404 (Not Found) if user doesn't exist
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Call the model function to delete the user
    const deletedUser = await userModel.deleteUser(id);

    // Return 200 (OK) confirming the deletion
    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: deletedUser,
    });
  } catch (error) {
    // Log the error for debugging
    console.error('Error in deleteUser controller:', error);

    // Return 500 (Internal Server Error)
    return res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────
// Export all controller functions for use in routes
// ─────────────────────────────────────────────────────────────
module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
