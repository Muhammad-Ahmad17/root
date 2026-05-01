require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const pool    = require('./config/db');

// Import route modules
const userRoutes = require('./routes/user.routes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// A simple GET endpoint to verify the server is running
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/users', userRoutes);

// ─────────────────────────────────────────────────────────────
// 404 Error Handler
// Respond with 404 for any undefined routes
// ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ─────────────────────────────────────────────────────────────
// Error Handler Middleware
// Catches any unhandled errors in the app
// ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ─────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────

// Get the server port from environment variables or use default 5000
const PORT = process.env.SERVER_PORT || 5000;

// Start listening for incoming requests
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Users API: http://localhost:${PORT}/api/users`);
});

// ─────────────────────────────────────────────────────────────
// Graceful Shutdown
// Close the pool and server cleanly on termination signals
// ─────────────────────────────────────────────────────────────

const shutdown = () => {
  console.log('\nShutting down server...');
  server.close(() => console.log('Server closed'));
  pool.end(() => { console.log('Database pool closed'); process.exit(0); });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);