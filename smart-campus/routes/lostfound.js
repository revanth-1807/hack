const express = require('express');
const router = express.Router();
const {
    getAllLostItems,
    getLostItemDetails,
    renderReportItem,
    reportFoundItem,
    renderClaimItem,
    claimItem,
    updateItemStatus,
    deleteItem,
    getMyReportedItems
} = require('../controllers/lostFoundController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Get all lost items
router.get('/', getAllLostItems);

// Report found item (must come before :id routes)
router.get('/report', isAuthenticated, renderReportItem);
router.post('/report', isAuthenticated, reportFoundItem);

// Get user's reported items
router.get('/my/items', isAuthenticated, getMyReportedItems);

// Claim item
router.get('/claim/:id', isAuthenticated, renderClaimItem);
router.post('/claim/:id', isAuthenticated, claimItem);

// Update item status (admin only)
router.post('/update-status/:id', isAuthenticated, isAdmin, updateItemStatus);

// Delete item (admin only)
router.post('/delete/:id', isAuthenticated, isAdmin, deleteItem);

// Get lost item details (must be last to avoid conflict with other routes)
router.get('/:id', getLostItemDetails);

module.exports = router;
