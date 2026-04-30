// ─────────────────────────────────────────────────────────────
// User Routes: Define REST API endpoints for user CRUD operations
// ─────────────────────────────────────────────────────────────

const express = require('express');

// Import the user controller that handles the business logic
const userController = require('../controllers/user.controller');

// Create a new Express router instance for user routes
const router = express.Router();

// ─────────────────────────────────────────────────────────────
// POST /api/users
// Create a new user
// Request body: { name, email, password }
// Response: { success, message, data: newUser }
// ─────────────────────────────────────────────────────────────
router.post('/', userController.createUser);

// ─────────────────────────────────────────────────────────────
// GET /api/users
// Fetch all users
// No request body needed
// Response: { success, message, count, data: [users] }
// ─────────────────────────────────────────────────────────────
router.get('/', userController.getAllUsers);

// ─────────────────────────────────────────────────────────────
// GET /api/users/:id
// Fetch a single user by ID
// URL parameter: id (user ID)
// Response: { success, message, data: user }
// ─────────────────────────────────────────────────────────────
router.get('/:id', userController.getUserById);

// ─────────────────────────────────────────────────────────────
// PUT /api/users/:id
// Update an existing user
// URL parameter: id (user ID)
// Request body: { name, email } (at least one field required)
// Response: { success, message, data: updatedUser }
// ─────────────────────────────────────────────────────────────
router.put('/:id', userController.updateUser);

// ─────────────────────────────────────────────────────────────
// DELETE /api/users/:id
// Delete a user
// URL parameter: id (user ID)
// Response: { success, message, data: deletedUser }
// ─────────────────────────────────────────────────────────────
router.delete('/:id', userController.deleteUser);

// ─────────────────────────────────────────────────────────────
// Export the router to use in the main app
// ─────────────────────────────────────────────────────────────
module.exports = router;
