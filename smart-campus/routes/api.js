const express = require('express');
const router = express.Router();
const { getUpcomingEvents } = require('../controllers/calendarController');
const { getQueueStatus } = require('../controllers/cafeteriaController');
const { getDirections } = require('../controllers/navigationController');

// Calendar API
router.get('/calendar/upcoming', getUpcomingEvents);

// Cafeteria API
router.get('/cafeteria/queue', getQueueStatus);

// Navigation API
router.get('/navigation/directions', getDirections);

// Health check
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
