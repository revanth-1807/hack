const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const exphbs = require('express-handlebars');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);

const app = express();

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('MongoDB connected successfully');
})
.catch(err => {
    console.error('MongoDB connection error:', err.message);
});
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'smart-campus-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));
app.use('/uploads', express.static('uploads'));
app.use(flash());

// Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.user = req.session.user || null;
    next();
});

// View engine setup
app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        eq: function (a, b) { return a === b; },
        formatDate: function (date, format) {
            const d = new Date(date);
            
            if (format === 'YYYY-MM-DD') {
                // Format for HTML date input (YYYY-MM-DD)
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            } else if (format === 'HH:mm') {
                // Format for HTML time input (HH:mm)
                const hours = String(d.getHours()).padStart(2, '0');
                const minutes = String(d.getMinutes()).padStart(2, '0');
                return `${hours}:${minutes}`;
            } else {
                // Default format for display
                return d.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'UTC' // Use UTC to avoid timezone issues
                });
            }
        },
        gt: function (a, b) { return a > b; },
        gte: function (a, b) { return a >= b; },
        range: function (start, end) {
            const result = [];
            for (let i = start; i <= end; i++) {
                result.push(i);
            }
            return result;
        },
        getMonthName: function(month) {
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            return months[month - 1] || 'Unknown';
        },
        getEventsForMonth: function(events, month, year) {
            const targetMonth = parseInt(month);
            const targetYear = parseInt(year);
            
            return events.filter(event => {
                const eventDate = new Date(event.startDate);
                return eventDate.getMonth() + 1 === targetMonth && eventDate.getFullYear() === targetYear;
            });
        },
        getEventColor: function(type) {
            const colors = {
                'academic': '#007bff',
                'holiday': '#28a745',
                'exam': '#dc3545',
                'event': '#ffc107',
                'other': '#6c757d'
            };
            return colors[type] || '#6c757d';
        },
        ne: function(a, b) {
            return a !== b;
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/events', require('./routes/events'));
app.use('/calendar', require('./routes/calendar'));
app.use('/lostfound', require('./routes/lostfound'));
app.use('/cafeteria', require('./routes/cafeteria'));
app.use('/admin/cafe', require('./routes/cafeAdmin'));
app.use('/navigation', require('./routes/navigation'));
app.use('/api', require('./routes/api'));
app.use('/test', require('./routes/test'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { error: err.message });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { error: 'Page not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});

module.exports = app;
