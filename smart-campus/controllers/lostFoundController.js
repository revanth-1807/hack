const LostItem = require('../models/LostItem');
const User = require('../models/User');

// Get all lost items
const getAllLostItems = async (req, res) => {
    try {
        const { category, status } = req.query;
        
        let query = {};
        
        if (category && category !== 'all') {
            query.category = category;
        }
        
        if (status && status !== 'all') {
            query.status = status;
        }

        const items = await LostItem.find(query)
            .populate('foundBy', 'name email')
            .populate('claimedBy', 'name email')
            .sort({ dateFound: -1 });

        res.render('lostfound/index', {
            title: 'Lost & Found',
            items,
            categories: ['electronics', 'books', 'clothing', 'accessories', 'documents', 'other'],
            statuses: ['found', 'claimed', 'archived'],
            selectedCategory: category,
            selectedStatus: status,
            currentPage: 'lostfound'
        });
    } catch (error) {
        console.error('Get lost items error:', error);
        req.flash('error_msg', 'Error loading lost items');
        res.redirect('/');
    }
};

// Get lost item details
const getLostItemDetails = async (req, res) => {
    try {
        const item = await LostItem.findById(req.params.id)
            .populate('foundBy', 'name email phone')
            .populate('claimedBy', 'name email phone');

        if (!item) {
            req.flash('error_msg', 'Item not found');
            return res.redirect('/lostfound');
        }

        res.render('lostfound/details', {
            title: item.itemName,
            item,
            currentPage: 'lostfound'
        });
    } catch (error) {
        console.error('Lost item details error:', error);
        req.flash('error_msg', 'Error loading item details');
        res.redirect('/lostfound');
    }
};

// Render report lost item form
const renderReportItem = (req, res) => {
    res.render('lostfound/report', {
        title: 'Report Found Item',
        currentPage: 'lostfound'
    });
};

// Report found item
const reportFoundItem = async (req, res) => {
    try {
        const { itemName, description, category, locationFound, timeFound } = req.body;

        const user = await User.findById(req.session.user._id);

        const newItem = new LostItem({
            itemName,
            description,
            category,
            locationFound,
            timeFound,
            foundBy: user._id,
            foundByName: user.name,
            foundByPhone: user.phone || '',
            foundByEmail: user.email
        });

        await newItem.save();

        req.flash('success_msg', 'Item reported successfully. A verification code has been generated.');
        res.redirect('/lostfound');
    } catch (error) {
        console.error('Report item error:', error);
        req.flash('error_msg', 'Error reporting item');
        res.redirect('/lostfound/report');
    }
};

// Render claim item form
const renderClaimItem = async (req, res) => {
    try {
        const item = await LostItem.findById(req.params.id);

        if (!item) {
            req.flash('error_msg', 'Item not found');
            return res.redirect('/lostfound');
        }

        if (item.status !== 'found') {
            req.flash('error_msg', 'This item is no longer available for claim');
            return res.redirect('/lostfound');
        }

        res.render('lostfound/claim', {
            title: 'Claim Item',
            item,
            currentPage: 'lostfound'
        });
    } catch (error) {
        console.error('Render claim form error:', error);
        req.flash('error_msg', 'Error loading claim form');
        res.redirect('/lostfound');
    }
};

// Claim item
const claimItem = async (req, res) => {
    try {
        const { verificationCode, contactPhone, contactEmail } = req.body;
        const itemId = req.params.id;

        const item = await LostItem.findById(itemId);
        
        if (!item) {
            req.flash('error_msg', 'Item not found');
            return res.redirect('/lostfound');
        }

        if (item.status !== 'found') {
            req.flash('error_msg', 'This item is no longer available for claim');
            return res.redirect('/lostfound');
        }

        if (item.verificationCode !== verificationCode.toUpperCase()) {
            req.flash('error_msg', 'Invalid verification code');
            return res.redirect(`/lostfound/claim/${itemId}`);
        }

        const user = await User.findById(req.session.user._id);

        item.status = 'claimed';
        item.claimedBy = user._id;
        item.claimedByName = user.name;
        item.claimedByPhone = contactPhone;
        item.claimedByEmail = contactEmail;
        item.claimDate = new Date();
        item.isVerified = true;

        await item.save();

        req.flash('success_msg', 'Item claimed successfully! The owner will contact you soon.');
        res.redirect('/lostfound');
    } catch (error) {
        console.error('Claim item error:', error);
        req.flash('error_msg', 'Error claiming item');
        res.redirect(`/lostfound/claim/${req.params.id}`);
    }
};

// Admin: Update item status
const updateItemStatus = async (req, res) => {
    try {
        const { status } = req.body;

        await LostItem.findByIdAndUpdate(req.params.id, {
            status
        });

        req.flash('success_msg', 'Item status updated successfully');
        res.redirect('/lostfound');
    } catch (error) {
        console.error('Update item status error:', error);
        req.flash('error_msg', 'Error updating item status');
        res.redirect('/lostfound');
    }
};

// Admin: Delete item
const deleteItem = async (req, res) => {
    try {
        await LostItem.findByIdAndDelete(req.params.id);

        req.flash('success_msg', 'Item deleted successfully');
        res.redirect('/lostfound');
    } catch (error) {
        console.error('Delete item error:', error);
        req.flash('error_msg', 'Error deleting item');
        res.redirect('/lostfound');
    }
};

// Get my reported items
const getMyReportedItems = async (req, res) => {
    try {
        const items = await LostItem.find({ foundBy: req.session.user._id })
            .populate('claimedBy', 'name email')
            .sort({ dateFound: -1 });

        res.render('lostfound/my-items', {
            title: 'My Reported Items',
            items,
            currentPage: 'lostfound'
        });
    } catch (error) {
        console.error('Get my items error:', error);
        req.flash('error_msg', 'Error loading your reported items');
        res.redirect('/lostfound');
    }
};

module.exports = {
    getAllLostItems,
    getLostItemDetails,
    renderReportItem,
    reportFoundItem,
    renderClaimItem,
    claimItem,
    updateItemStatus,
    deleteItem,
    getMyReportedItems
};
