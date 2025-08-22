const Event = require('../models/Event');
const Registration = require('../models/Registration');

// Get all events
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('createdBy', 'name email')
            .sort({ date: 1 });
        
        res.render('events/index', { 
            title: 'Events', 
            events,
            currentPage: 'events'
        });
    } catch (error) {
        console.error('Get events error:', error);
        req.flash('error_msg', 'Error loading events');
        res.redirect('/');
    }
};

// Get event details
const getEventDetails = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'name email');
        
        if (!event) {
            req.flash('error_msg', 'Event not found');
            return res.redirect('/events');
        }

        // Check if user is registered
        let isRegistered = false;
        if (req.session.user) {
            const registration = await Registration.findOne({
                event: event._id,
                user: req.session.user._id
            });
            isRegistered = !!registration;
        }

        res.render('events/details', { 
            title: event.title, 
            event,
            isRegistered,
            currentPage: 'events'
        });
    } catch (error) {
        console.error('Event details error:', error);
        req.flash('error_msg', 'Error loading event details');
        res.redirect('/events');
    }
};

// Render create event form (admin only)
const renderCreateEvent = (req, res) => {
    res.render('events/create', { 
        title: 'Create Event',
        currentPage: 'events'
    });
};

// Create new event (admin only)
const createEvent = async (req, res) => {
    try {
        const { title, description, date, time, venue, organizer, category, maxParticipants } = req.body;

        const newEvent = new Event({
            title,
            description,
            date: new Date(date),
            time,
            venue,
            organizer,
            category,
            maxParticipants: maxParticipants || 0,
            createdBy: req.session.user._id
        });

        await newEvent.save();

        req.flash('success_msg', 'Event created successfully');
        res.redirect('/events');
    } catch (error) {
        console.error('Create event error:', error);
        req.flash('error_msg', 'Error creating event');
        res.redirect('/events/create');
    }
};

// Render edit event form (admin only)
const renderEditEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            req.flash('error_msg', 'Event not found');
            return res.redirect('/events');
        }

        res.render('events/edit', { 
            title: 'Edit Event', 
            event,
            currentPage: 'events'
        });
    } catch (error) {
        console.error('Edit event error:', error);
        req.flash('error_msg', 'Error loading event for editing');
        res.redirect('/events');
    }
};

// Update event (admin only)
const updateEvent = async (req, res) => {
    try {
        const { title, description, date, time, venue, organizer, category, maxParticipants, status } = req.body;

        await Event.findByIdAndUpdate(req.params.id, {
            title,
            description,
            date: new Date(date),
            time,
            venue,
            organizer,
            category,
            maxParticipants: maxParticipants || 0,
            status
        });

        req.flash('success_msg', 'Event updated successfully');
        res.redirect('/events');
    } catch (error) {
        console.error('Update event error:', error);
        req.flash('error_msg', 'Error updating event');
        res.redirect(`/events/edit/${req.params.id}`);
    }
};

// Delete event (admin only)
const deleteEvent = async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        // Also delete related registrations
        await Registration.deleteMany({ event: req.params.id });

        req.flash('success_msg', 'Event deleted successfully');
        res.redirect('/events');
    } catch (error) {
        console.error('Delete event error:', error);
        req.flash('error_msg', 'Error deleting event');
        res.redirect('/events');
    }
};

// Register for event
const registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            req.flash('error_msg', 'Event not found');
            return res.redirect('/events');
        }

        if (!event.isRegistrationOpen) {
            req.flash('error_msg', 'Registration is closed for this event');
            return res.redirect(`/events/${event._id}`);
        }

        if (event.maxParticipants > 0 && event.currentParticipants >= event.maxParticipants) {
            req.flash('error_msg', 'Event is full');
            return res.redirect(`/events/${event._id}`);
        }

        // Check if already registered
        const existingRegistration = await Registration.findOne({
            event: event._id,
            user: req.session.user._id
        });

        if (existingRegistration) {
            req.flash('error_msg', 'You are already registered for this event');
            return res.redirect(`/events/${event._id}`);
        }

        // Create registration
        const registration = new Registration({
            event: event._id,
            user: req.session.user._id
        });

        await registration.save();

        // Update event participant count
        event.currentParticipants += 1;
        await event.save();

        req.flash('success_msg', 'Successfully registered for the event');
        res.redirect(`/events/${event._id}`);
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error_msg', 'Error registering for event');
        res.redirect(`/events/${req.params.id}`);
    }
};

// Cancel registration
const cancelRegistration = async (req, res) => {
    try {
        const registration = await Registration.findOne({
            event: req.params.id,
            user: req.session.user._id
        });

        if (!registration) {
            req.flash('error_msg', 'Registration not found');
            return res.redirect('/events');
        }

        await Registration.findByIdAndDelete(registration._id);

        // Update event participant count
        const event = await Event.findById(req.params.id);
        if (event) {
            event.currentParticipants = Math.max(0, event.currentParticipants - 1);
            await event.save();
        }

        req.flash('success_msg', 'Registration cancelled successfully');
        res.redirect(`/events/${req.params.id}`);
    } catch (error) {
        console.error('Cancel registration error:', error);
        req.flash('error_msg', 'Error cancelling registration');
        res.redirect(`/events/${req.params.id}`);
    }
};

// Get user's registered events
const getMyEvents = async (req, res) => {
    try {
        const registrations = await Registration.find({ user: req.session.user._id })
            .populate({
                path: 'event',
                populate: { path: 'createdBy', select: 'name email' }
            })
            .sort({ registrationDate: -1 });

        res.render('events/my-events', { 
            title: 'My Events', 
            registrations,
            currentPage: 'events'
        });
    } catch (error) {
        console.error('Get my events error:', error);
        req.flash('error_msg', 'Error loading your events');
        res.redirect('/events');
    }
};

module.exports = {
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
};
