const express = require('express');
const router = express.Router();
const {
    getAdminDashboard,
    getMenuManagement,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getOrderManagement,
    updateOrderStatus,
    getTableManagement,
    updateTableStatus,
    getInventoryManagement,
    createInventoryItem,
    updateInventoryItem,
    restockInventory,
    getReports
} = require('../controllers/cafeAdminController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Admin dashboard
router.get('/', isAuthenticated, isAdmin, getAdminDashboard);

// Menu management
router.get('/menu', isAuthenticated, isAdmin, getMenuManagement);
router.post('/menu/create', isAuthenticated, isAdmin, createMenuItem);
router.post('/menu/update/:id', isAuthenticated, isAdmin, updateMenuItem);
router.post('/menu/delete/:id', isAuthenticated, isAdmin, deleteMenuItem);

// Order management
router.get('/orders', isAuthenticated, isAdmin, getOrderManagement);
router.post('/orders/update/:id', isAuthenticated, isAdmin, updateOrderStatus);

// Table management
router.get('/tables', isAuthenticated, isAdmin, getTableManagement);
router.post('/tables/update/:id', isAuthenticated, isAdmin, updateTableStatus);

// Inventory management
router.get('/inventory', isAuthenticated, isAdmin, getInventoryManagement);
router.post('/inventory/create', isAuthenticated, isAdmin, createInventoryItem);
router.post('/inventory/update/:id', isAuthenticated, isAdmin, updateInventoryItem);
router.post('/inventory/restock/:id', isAuthenticated, isAdmin, restockInventory);

// Reports
router.get('/reports', isAuthenticated, isAdmin, getReports);

module.exports = router;
