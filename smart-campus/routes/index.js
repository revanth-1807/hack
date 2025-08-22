const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

// Home page
router.get('/', (req, res) => {
    res.render('home', {
        title: 'Smart Campus',
        currentPage: 'home'
    });
});

// Dashboard
router.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', {
        title: 'Dashboard',
        user: req.session.user,
        currentPage: 'dashboard'
    });
});

// About page
router.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Smart Campus',
        currentPage: 'about'
    });
});

// Contact page
router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact Us',
        currentPage: 'contact'
    });
});

// Handle contact form submission
router.post('/contact', (req, res) => {
    // For now, just redirect with a success message
    // In a real application, you would save this to a database and send emails
    req.flash('success', 'Thank you for your message! We will get back to you soon.');
    res.redirect('/contact');
});

module.exports = router;
