const CalendarEvent = require('../models/CalendarEvent');

// Get calendar events for specific academic year and semester
const getCalendarEvents = async (req, res) => {
    try {
        const { academicYear, semester } = req.query;
        
        let query = { isPublic: true };
        
        if (academicYear) {
            query.academicYear = academicYear;
        }
        
        if (semester && semester !== 'all') {
            query.semester = semester;
        }

        const events = await CalendarEvent.find(query)
            .populate('createdBy', 'name email')
            .sort({ startDate: 1 })
            .lean();   // ✅ convert to plain JS objects

        // Get unique academic years and semesters for filter
        const academicYears = await CalendarEvent.distinct('academicYear');
        const semesters = await CalendarEvent.distinct('semester');

        res.render('calendar/index', {
            title: 'Academic Calendar',
            events,
            academicYears,
            semesters,
            selectedYear: academicYear,
            selectedSemester: semester,
            currentPage: 'calendar'
        });
    } catch (error) {
        console.error('Get calendar events error:', error);
        req.flash('error_msg', 'Error loading calendar');
        res.redirect('/');
    }
};

// Render create calendar event form (admin only)
const renderCreateCalendarEvent = (req, res) => {
    res.render('calendar/create', {
        title: 'Create Calendar Event',
        currentPage: 'calendar'
    });
};

// Create new calendar event (admin only)
const createCalendarEvent = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            startDate, 
            endDate, 
            type, 
            academicYear, 
            semester, 
            isRecurring, 
            recurrencePattern 
        } = req.body;

        const newEvent = new CalendarEvent({
            title,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            type,
            academicYear,
            semester,
            isRecurring: isRecurring === 'true',
            recurrencePattern: isRecurring === 'true' ? recurrencePattern : 'yearly',
            createdBy: req.session.user._id
        });

        await newEvent.save();

        req.flash('success_msg', 'Calendar event created successfully');
        res.redirect('/calendar');
    } catch (error) {
        console.error('Create calendar event error:', error);
        req.flash('error_msg', 'Error creating calendar event');
        res.redirect('/calendar/create');
    }
};

// Render edit calendar event form (admin only)
const renderEditCalendarEvent = async (req, res) => {
    try {
        const event = await CalendarEvent.findById(req.params.id).lean(); // ✅ added .lean()
        
        if (!event) {
            req.flash('error_msg', 'Calendar event not found');
            return res.redirect('/calendar');
        }

        res.render('calendar/edit', {
            title: 'Edit Calendar Event',
            event,
            currentPage: 'calendar'
        });
    } catch (error) {
        console.error('Edit calendar event error:', error);
        req.flash('error_msg', 'Error loading calendar event for editing');
        res.redirect('/calendar');
    }
};

// Update calendar event (admin only)
const updateCalendarEvent = async (req, res) => {
    try {
        const { 
            title, 
            description, 
            startDate, 
            endDate, 
            type, 
            academicYear, 
            semester, 
            isRecurring, 
            recurrencePattern,
            isPublic 
        } = req.body;

        await CalendarEvent.findByIdAndUpdate(req.params.id, {
            title,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            type,
            academicYear,
            semester,
            isRecurring: isRecurring === 'true',
            recurrencePattern: isRecurring === 'true' ? recurrencePattern : 'yearly',
            isPublic: isPublic === 'true'
        });

        req.flash('success_msg', 'Calendar event updated successfully');
        res.redirect('/calendar');
    } catch (error) {
        console.error('Update calendar event error:', error);
        req.flash('error_msg', 'Error updating calendar event');
        res.redirect(`/calendar/edit/${req.params.id}`);
    }
};

// Delete calendar event (admin only)
const deleteCalendarEvent = async (req, res) => {
    try {
        await CalendarEvent.findByIdAndDelete(req.params.id);

        req.flash('success_msg', 'Calendar event deleted successfully');
        res.redirect('/calendar');
    } catch (error) {
        console.error('Delete calendar event error:', error);
        req.flash('error_msg', 'Error deleting calendar event');
        res.redirect('/calendar');
    }
};

// Get calendar events for API (JSON format)
const getCalendarEventsApi = async (req, res) => {
    try {
        const { academicYear, semester } = req.query;
        
        let query = { isPublic: true };
        
        if (academicYear) {
            query.academicYear = academicYear;
        }
        
        if (semester && semester !== 'all') {
            query.semester = semester;
        }

        const events = await CalendarEvent.find(query)
            .select('title description startDate endDate type academicYear semester')
            .sort({ startDate: 1 })
            .lean();   // ✅ added .lean()

        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Get calendar events API error:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading calendar events'
        });
    }
};

// Get upcoming events (for dashboard)
const getUpcomingEvents = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const events = await CalendarEvent.find({
            startDate: { $gte: today },
            isPublic: true
        })
        .select('title startDate endDate type')
        .sort({ startDate: 1 })
        .limit(5)
        .lean();  // ✅ added .lean()

        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Get upcoming events error:', error);
        res.status(500).json({
            success: false,
            message: 'Error loading upcoming events'
        });
    }
};

// Yearly calendar view for admin
const getYearlyCalendar = async (req, res) => {
    try {
        const { year } = req.query;
        const currentYear = year || new Date().getFullYear();
        
        // Get all events for the selected year
        const events = await CalendarEvent.find({
            $or: [
                { 
                    startDate: { 
                        $gte: new Date(currentYear, 0, 1),
                        $lte: new Date(currentYear, 11, 31)
                    }
                },
                { 
                    endDate: { 
                        $gte: new Date(currentYear, 0, 1),
                        $lte: new Date(currentYear, 11, 31)
                    }
                }
            ]
        })
        .populate('createdBy', 'name email')
        .sort({ startDate: 1 })
        .lean();   // ✅ added .lean()

        // Get available years for dropdown
        const years = await CalendarEvent.aggregate([
            {
                $group: {
                    _id: { $year: "$startDate" }
                }
            },
            {
                $sort: { _id: -1 }
            }
        ]);

        const availableYears = years.map(y => y._id);

        res.render('calendar/yearly', {
            title: 'Yearly Calendar Management',
            events,
            currentYear: parseInt(currentYear),
            availableYears,
            currentPage: 'calendar'
        });
    } catch (error) {
        console.error('Yearly calendar error:', error);
        req.flash('error_msg', 'Error loading yearly calendar');
        res.redirect('/calendar');
    }
};

module.exports = {
    getCalendarEvents,
    renderCreateCalendarEvent,
    createCalendarEvent,
    renderEditCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    getCalendarEventsApi,
    getUpcomingEvents,
    getYearlyCalendar
};
