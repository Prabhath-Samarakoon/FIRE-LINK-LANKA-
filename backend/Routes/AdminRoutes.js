const express = require('express');
const router = express.Router();
const { login, verifyToken, getAllAdmins } = require('../Controllers/AdminController');

// Login route
router.post('/login', login);

// Get all admins (protected route)
router.get('/admins', verifyToken, getAllAdmins);

module.exports = router;
