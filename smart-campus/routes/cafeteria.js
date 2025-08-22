const express = require('express');
const router = express.Router();
const {
    getCafeteriaDashboard,
    getMenuItems,
    getMenuItemDetails,
    createOrder,
    getUserOrders,
    getOrderDetails,
    cancelOrder,
    getQueueStatus,
    updateQueueStatus
} = require('../controllers/cafeteriaController');
const { isAuthenticated } = require('../middleware/auth');

// Cafeteria dashboard
router.get('/', isAuthenticated, getCafeteriaDashboard);

// Menu routes
router.get('/menu', isAuthenticated, getMenuItems);
router.get('/menu/:id', isAuthenticated, getMenuItemDetails);

// Order routes
router.post('/order', isAuthenticated, createOrder);
router.get('/orders', isAuthenticated, getUserOrders);
router.get('/orders/:id', isAuthenticated, getOrderDetails);
router.post('/orders/cancel/:id', isAuthenticated, cancelOrder);

// Queue status routes
router.get('/queue/status', getQueueStatus);
router.post('/queue/update', isAuthenticated, updateQueueStatus);

module.exports = router;
