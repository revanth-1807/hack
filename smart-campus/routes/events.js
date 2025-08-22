const express = require('express');
const router = express.Router();
const {
    getAllEvents,
    getEventDetails,
    renderCreateEvent,
    createEvent,
    renderEditEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    cancelRegistration,
    getMyEvents
} = require('../controllers/eventController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Get all events
router.get('/', getAllEvents);

// Create event (admin only) - must come before /:id to avoid conflict
router.get('/create', isAuthenticated, isAdmin, renderCreateEvent);
router.post('/create', isAuthenticated, isAdmin, createEvent);

// Get event details
router.get('/:id', getEventDetails);

// Edit event (admin only)
router.get('/edit/:id', isAuthenticated, isAdmin, renderEditEvent);
router.post('/edit/:id', isAuthenticated, isAdmin, updateEvent);

// Delete event (admin only)
router.post('/delete/:id', isAuthenticated, isAdmin, deleteEvent);

// Register for event
router.post('/register/:id', isAuthenticated, registerForEvent);

// Cancel registration
router.post('/cancel/:id', isAuthenticated, cancelRegistration);

// Get user's registered events
router.get('/my/events', isAuthenticated, getMyEvents);

module.exports = router;
