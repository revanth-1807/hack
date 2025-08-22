const validateCollegeEmail = (email) => {
    // Common college email patterns
    const collegeEmailPatterns = [
        /@.*\.edu$/i,
        /@.*college\./i,
        /@.*university\./i,
        /@.*institute\./i,
        /@.*ac\./i
    ];

    return collegeEmailPatterns.some(pattern => pattern.test(email));
};

const requireCollegeEmail = (req, res, next) => {
    const { email } = req.body;
    
    if (!validateCollegeEmail(email)) {
        req.flash('error_msg', 'Please use a valid college email address');
        return res.redirect('/auth/register');
    }
    
    next();
};

module.exports = {
    validateCollegeEmail,
    requireCollegeEmail
};
