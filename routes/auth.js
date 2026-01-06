const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  logout,
  refresh,
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);

// Protected routes
router.post('/logout', authenticateToken, logout);

module.exports = router;
