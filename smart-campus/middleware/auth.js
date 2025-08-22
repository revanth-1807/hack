const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    req.flash('error_msg', 'Please log in to access this page');
    res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    req.flash('error_msg', 'Admin access required');
    res.redirect('/');
};

const isStudent = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'student') {
        return next();
    }
    req.flash('error_msg', 'Student access required');
    res.redirect('/');
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isStudent
};
