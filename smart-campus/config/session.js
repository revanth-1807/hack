const session = require('express-session');

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'smart-campus-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true
    }
};

module.exports = sessionConfig;
