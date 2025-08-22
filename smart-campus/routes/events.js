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

// ✅ Order matters: put fixed routes above dynamic `/:id`

// Get all events
router.get('/', getAllEvents);

// Create event (admin only)
router.get('/create', isAuthenticated, isAdmin, renderCreateEvent);
router.post('/create', isAuthenticated, isAdmin, createEvent);

// Edit event (admin only)
router.get('/edit/:id', isAuthenticated, isAdmin, renderEditEvent);
router.post('/edit/:id', isAuthenticated, isAdmin, updateEvent);

// Delete event (admin only) ✅ moved above /:id
router.post('/delete/:id', isAuthenticated, isAdmin, deleteEvent);

// Register for event
router.post('/register/:id', isAuthenticated, registerForEvent);

// Cancel registration
router.post('/cancel/:id', isAuthenticated, cancelRegistration);

// Get user's registered events
router.get('/my/events', isAuthenticated, getMyEvents);

// Get event details (keep this last so it doesn’t eat other routes)
router.get('/:id', getEventDetails);

module.exports = router;
