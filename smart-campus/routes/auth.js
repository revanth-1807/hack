const express = require('express');
const router = express.Router();
const {
    renderLogin,
    renderRegister,
    registerUser,
    loginUser,
    logoutUser,
    getProfile,
    updateProfile,
    requireCollegeEmail
} = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');

// Login routes
router.get('/login', renderLogin);
router.post('/login', loginUser);

// Register routes
router.get('/register', renderRegister);
router.post('/register', requireCollegeEmail, registerUser);

// Logout route
router.get('/logout', logoutUser);

// Profile routes
router.get('/profile', isAuthenticated, getProfile);
router.post('/profile', isAuthenticated, updateProfile);

module.exports = router;
