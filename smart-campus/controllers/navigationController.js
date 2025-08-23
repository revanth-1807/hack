const Building = require('../models/Building');
const leafletConfig = require('../config/google-maps');

// Get campus map
const getCampusMap = async (req, res) => {
    try {
        const buildings = await Building.find({ isActive: true })
            .sort({ name: 1 });

        // Calculate center point of all buildings for map focus
        let centerLat = leafletConfig.defaultCenter.lat;
        let centerLng = leafletConfig.defaultCenter.lng;
        
        if (buildings.length > 0) {
            const totalLat = buildings.reduce((sum, building) => sum + building.coordinates.latitude, 0);
            const totalLng = buildings.reduce((sum, building) => sum + building.coordinates.longitude, 0);
            centerLat = totalLat / buildings.length;
            centerLng = totalLng / buildings.length;
        }

        // Prepare building data for Leaflet
        const buildingData = buildings.map(building => ({
            id: building._id,
            name: building.name,
            code: building.code,
            category: building.category,
            coordinates: {
                lat: building.coordinates.latitude,
                lng: building.coordinates.longitude
            },
            address: building.address,
            description: building.description
        }));

        res.render('navigation/map', {
            title: 'Campus Map',
            buildings,
            buildingData: JSON.stringify(buildingData),
            mapCenter: { lat: centerLat, lng: centerLng },
            mapZoom: leafletConfig.defaultZoom,
            currentPage: 'navigation'
        });
    } catch (error) {
        console.error('Get campus map error:', error);
        req.flash('error_msg', 'Error loading campus map');
        res.redirect('/');
    }
};

// Get building details
const getBuildingDetails = async (req, res) => {
    try {
        const building = await Building.findById(req.params.id);

        if (!building) {
            req.flash('error_msg', 'Building not found');
            return res.redirect('/navigation/map');
        }

        // Get nearby buildings (within 0.01 degrees radius)
        const nearbyBuildings = await Building.find({
            _id: { $ne: building._id },
            isActive: true,
            'coordinates.latitude': {
                $gte: building.coordinates.latitude - 0.01,
                $lte: building.coordinates.latitude + 0.01
            },
            'coordinates.longitude': {
                $gte: building.coordinates.longitude - 0.01,
                $lte: building.coordinates.longitude + 0.01
            }
        }).limit(5);

        res.render('navigation/building-details', {
            title: building.name,
            building,
            nearbyBuildings,
            currentPage: 'navigation'
        });
    } catch (error) {
        console.error('Get building details error:', error);
        req.flash('error_msg', 'Error loading building details');
        res.redirect('/navigation/map');
    }
};

// Get route to college
const getRouteToCollege = (req, res) => {
    res.render('navigation/route-to-college', {
        title: 'Route to College',
        currentPage: 'navigation'
    });
};

// Get directions API (simplified version)
const getDirections = async (req, res) => {
    try {
        const { currentLat, currentLng, buildingId } = req.query;

        if (!currentLat || !currentLng || !buildingId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters'
            });
        }

        const building = await Building.findById(buildingId);
        if (!building) {
            return res.status(404).json({
                success: false,
                message: 'Building not found'
            });
        }

        // Simplified directions (in real app, use Google Maps API or similar)
        const directions = {
            from: {
                latitude: parseFloat(currentLat),
                longitude: parseFloat(currentLng)
            },
            to: {
                latitude: building.coordinates.latitude,
                longitude: building.coordinates.longitude
            },
            distance: calculateDistance(
                parseFloat(currentLat),
                parseFloat(currentLng),
                building.coordinates.latitude,
                building.coordinates.longitude
            ),
            estimatedTime: calculateEstimatedTime(
                parseFloat(currentLat),
                parseFloat(currentLng),
                building.coordinates.latitude,
                building.coordinates.longitude
            ),
            steps: generateSimpleDirections(building.name)
        };

        res.json({
            success: true,
            data: directions
        });
    } catch (error) {
        console.error('Get directions error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting directions'
        });
    }
};

// Helper function to calculate distance (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    return distance;
};

const deg2rad = (deg) => {
    return deg * (Math.PI/180);
};

// Helper function to calculate estimated time
const calculateEstimatedTime = (lat1, lon1, lat2, lon2) => {
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    const walkingSpeed = 5; // km/h
    const drivingSpeed = 40; // km/h
    
    const walkingTime = (distance / walkingSpeed) * 60; // minutes
    const drivingTime = (distance / drivingSpeed) * 60; // minutes
    
    return {
        walking: Math.round(walkingTime),
        driving: Math.round(drivingTime),
        publicTransport: Math.round(drivingTime * 1.2) // 20% longer than driving
    };
};

// Helper function to generate simple directions
const generateSimpleDirections = (buildingName) => {
    return [
        'Head northeast on Main Street toward College Avenue',
        'Turn right onto College Avenue',
        `Continue straight until you reach ${buildingName} on your left`,
        'You have arrived at your destination'
    ];
};

// Admin: Create building
const createBuilding = async (req, res) => {
    try {
        const {
            name,
            code,
            description,
            category,
            floors,
            latitude,
            longitude,
            address,
            contactInfo,
            facilities
        } = req.body;

        const newBuilding = new Building({
            name,
            code: code.toUpperCase(),
            description,
            category,
            floors: parseInt(floors),
            coordinates: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            },
            address: address ? JSON.parse(address) : {},
            contactInfo: contactInfo ? JSON.parse(contactInfo) : {},
            facilities: facilities ? facilities.split(',').map(f => f.trim()) : [],
            createdBy: req.session.user._id
        });

        await newBuilding.save();

        req.flash('success_msg', 'Building created successfully');
        res.redirect('/navigation/map');
    } catch (error) {
        console.error('Create building error:', error);
        req.flash('error_msg', 'Error creating building');
        res.redirect('/navigation/admin/create');
    }
};

// Admin: Update building
const updateBuilding = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            floors,
            latitude,
            longitude,
            address,
            contactInfo,
            facilities,
            isActive
        } = req.body;

        await Building.findByIdAndUpdate(req.params.id, {
            name,
            description,
            category,
            floors: parseInt(floors),
            coordinates: {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            },
            address: address ? JSON.parse(address) : {},
            contactInfo: contactInfo ? JSON.parse(contactInfo) : {},
            facilities: facilities ? facilities.split(',').map(f => f.trim()) : [],
            isActive: isActive === 'true'
        });

        req.flash('success_msg', 'Building updated successfully');
        res.redirect('/navigation/map');
    } catch (error) {
        console.error('Update building error:', error);
        req.flash('error_msg', 'Error updating building');
        res.redirect(`/navigation/admin/edit/${req.params.id}`);
    }
};

// Admin: Get building management
const getBuildingManagement = async (req, res) => {
    try {
        const buildings = await Building.find().sort({ name: 1 });

        res.render('navigation/building-management', {
            title: 'Building Management',
            buildings,
            currentPage: 'admin'
        });
    } catch (error) {
        console.error('Building management error:', error);
        req.flash('error_msg', 'Error loading building management');
        res.redirect('/navigation/map');
    }
};

module.exports = {
    getCampusMap,
    getBuildingDetails,
    getRouteToCollege,
    getDirections,
    createBuilding,
    updateBuilding,
    getBuildingManagement
};
