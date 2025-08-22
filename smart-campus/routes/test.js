const express = require('express');
const router = express.Router();

// Test route to verify server is working
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Smart Campus API is working!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
