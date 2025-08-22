const express = require('express');
const router = express.Router();
const {
    getCalendarEvents,
    renderCreateCalendarEvent,
    createCalendarEvent,
    renderEditCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    getCalendarEventsApi,
    getUpcomingEvents,
    getYearlyCalendar
} = require('../controllers/calendarController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Get calendar events
router.get('/', getCalendarEvents);

// Yearly calendar management (authenticated users only)
router.get('/yearly', isAuthenticated, getYearlyCalendar);

// Create calendar event (admin only)
router.get('/create', isAuthenticated, isAdmin, renderCreateCalendarEvent);
router.post('/create', isAuthenticated, isAdmin, createCalendarEvent);

// Edit calendar event (admin only)
router.get('/edit/:id', isAuthenticated, isAdmin, renderEditCalendarEvent);
router.post('/edit/:id', isAuthenticated, isAdmin, updateCalendarEvent);

// Delete calendar event (admin only)
router.post('/delete/:id', isAuthenticated, isAdmin, deleteCalendarEvent);

// API routes
router.get('/api/events', getCalendarEventsApi);
router.get('/api/upcoming', getUpcomingEvents);

module.exports = router;
