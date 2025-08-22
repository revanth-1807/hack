const User = require('../models/User');
const { requireCollegeEmail } = require('../utils/requireCollegeEmail');

// Render login page
const renderLogin = (req, res) => {
    res.render('auth/login', { title: 'Login' });
};

// Render register page
const renderRegister = (req, res) => {
    res.render('auth/register', { title: 'Register' });
};

// Register new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone, collegeId } = req.body;

        // Validation
        if (password !== confirmPassword) {
            req.flash('error_msg', 'Passwords do not match');
            return res.redirect('/auth/register');
        }

        if (password.length < 6) {
            req.flash('error_msg', 'Password must be at least 6 characters');
            return res.redirect('/auth/register');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error_msg', 'User already exists with this email');
            return res.redirect('/auth/register');
        }

        // Create new user
        const newUser = new User({
            name,
            email,
            password,
            phone,
            collegeId,
            role: email.includes('admin') ? 'admin' : 'student' // Simple admin detection
        });

        await newUser.save();

        req.flash('success_msg', 'Registration successful! Please log in.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error_msg', 'Registration failed. Please try again.');
        res.redirect('/auth/register');
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error_msg', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            req.flash('error_msg', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        // Check if user is active
        if (!user.isActive) {
            req.flash('error_msg', 'Account is deactivated. Please contact admin.');
            return res.redirect('/auth/login');
        }

        // Set session
        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            collegeId: user.collegeId
        };

        req.flash('success_msg', `Welcome back, ${user.name}!`);
        
        // Redirect based on user role
        if (user.role === 'admin') {
            res.redirect('/dashboard'); // Admin users go to dashboard
        } else {
            res.redirect('/dashboard'); // Regular users also go to dashboard
        }
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error_msg', 'Login failed. Please try again.');
        res.redirect('/auth/login');
    }
};

// Logout user
const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id).select('-password');
        res.render('auth/profile', { title: 'My Profile', user });
    } catch (error) {
        console.error('Profile error:', error);
        req.flash('error_msg', 'Error loading profile');
        res.redirect('/');
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { name, phone, collegeId } = req.body;
        
        await User.findByIdAndUpdate(req.session.user._id, {
            name,
            phone,
            collegeId
        });

        req.flash('success_msg', 'Profile updated successfully');
        res.redirect('/auth/profile');
    } catch (error) {
        console.error('Update profile error:', error);
        req.flash('error_msg', 'Error updating profile');
        res.redirect('/auth/profile');
    }
};

module.exports = {
    renderLogin,
    renderRegister,
    registerUser,
    loginUser,
    logoutUser,
    getProfile,
    updateProfile,
    requireCollegeEmail
};
