const User = require('../models/User');

const checkRole = (roles) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.session.user._id);
            if (!user) {
                req.flash('error_msg', 'User not found');
                return res.redirect('/auth/login');
            }

            if (roles.includes(user.role)) {
                return next();
            } else {
                req.flash('error_msg', 'Insufficient permissions');
                return res.redirect('/');
            }
        } catch (error) {
            console.error('Role check error:', error);
            req.flash('error_msg', 'Error checking permissions');
            res.redirect('/');
        }
    };
};

module.exports = checkRole;
