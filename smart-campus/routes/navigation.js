const express = require('express');
const router = express.Router();
const {
    getCampusMap,
    getBuildingDetails,
    getRouteToCollege,
    getDirections,
    createBuilding,
    updateBuilding,
    getBuildingManagement
} = require('../controllers/navigationController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Campus map
router.get('/map', getCampusMap);

// Building details
router.get('/building/:id', getBuildingDetails);

// Route to college
router.get('/route', getRouteToCollege);

// Directions API
router.get('/directions', getDirections);

// Admin routes
router.get('/admin/buildings', isAuthenticated, isAdmin, getBuildingManagement);
router.post('/admin/buildings/create', isAuthenticated, isAdmin, createBuilding);
router.post('/admin/buildings/update/:id', isAuthenticated, isAdmin, updateBuilding);

module.exports = router;
