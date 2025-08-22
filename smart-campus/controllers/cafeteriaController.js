const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const QueueStatus = require('../models/QueueStatus');
const { calculateCrowdColor, getCrowdStatus } = require('../utils/calcCrowdColor');

// Get cafeteria dashboard
const getCafeteriaDashboard = async (req, res) => {
    try {
        // Get current queue status
        let queueStatus = await QueueStatus.findOne().sort({ lastUpdated: -1 });
        
        // If no queue status exists, create a default one
        if (!queueStatus) {
            queueStatus = new QueueStatus({
                currentCount: 0,
                maxCapacity: 100,
                crowdColor: 'white',
                crowdStatus: 'Low Crowd',
                message: 'Plenty of space available'
            });
            await queueStatus.save();
        }

        // Get menu items
        const menuItems = await MenuItem.find({ isAvailable: true })
            .sort({ category: 1, name: 1 });

        // Get user's recent orders
        const recentOrders = await Order.find({ user: req.session.user._id })
            .populate('items.menuItem')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get available tables
        const availableTables = await Table.find({ status: 'available' })
            .sort({ tableNumber: 1 });

        res.render('cafeteria/index', {
            title: 'Cafeteria',
            queueStatus,
            menuItems,
            recentOrders,
            availableTables,
            currentPage: 'cafeteria'
        });
    } catch (error) {
        console.error('Get cafeteria dashboard error:', error);
        req.flash('error_msg', 'Error loading cafeteria dashboard');
        res.redirect('/');
    }
};

// Get menu items by category
const getMenuItems = async (req, res) => {
    try {
        const { category } = req.query;
        
        let query = { isAvailable: true };
        if (category && category !== 'all') {
            query.category = category;
        }

        const menuItems = await MenuItem.find(query)
            .sort({ category: 1, name: 1 });

        const categories = await MenuItem.distinct('category');

        res.render('cafeteria/menu', {
            title: 'Menu',
            menuItems,
            categories,
            selectedCategory: category,
            currentPage: 'cafeteria'
        });
    } catch (error) {
        console.error('Get menu items error:', error);
        req.flash('error_msg', 'Error loading menu');
        res.redirect('/cafeteria');
    }
};

// Get menu item details
const getMenuItemDetails = async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            req.flash('error_msg', 'Menu item not found');
            return res.redirect('/cafeteria/menu');
        }

        res.render('cafeteria/menu-item', {
            title: menuItem.name,
            menuItem,
            currentPage: 'cafeteria'
        });
    } catch (error) {
        console.error('Get menu item details error:', error);
        req.flash('error_msg', 'Error loading menu item details');
        res.redirect('/cafeteria/menu');
    }
};

// Create new order
const createOrder = async (req, res) => {
    try {
        const { items, tableNumber, isTakeaway, specialRequests } = req.body;

        if (!items || items.length === 0) {
            req.flash('error_msg', 'Please select at least one item');
            return res.redirect('/cafeteria/menu');
        }

        // Calculate total amount and prepare order items
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItemId);
            if (!menuItem || !menuItem.isAvailable) {
                req.flash('error_msg', `Item ${menuItem?.name || 'unknown'} is not available`);
                return res.redirect('/cafeteria/menu');
            }

            const itemTotal = menuItem.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                menuItem: menuItem._id,
                quantity: item.quantity,
                price: menuItem.price,
                specialInstructions: item.specialInstructions || ''
            });
        }

        // Create order
        const order = new Order({
            user: req.session.user._id,
            items: orderItems,
            totalAmount,
            tableNumber: tableNumber || '',
            isTakeaway: isTakeaway === 'true',
            specialRequests: specialRequests || ''
        });

        await order.save();

        // Update table status if table number is provided
        if (tableNumber) {
            await Table.findOneAndUpdate(
                { tableNumber },
                { status: 'occupied', currentOrder: order._id }
            );
        }

        req.flash('success_msg', 'Order placed successfully!');
        res.redirect('/cafeteria/orders');
    } catch (error) {
        console.error('Create order error:', error);
        req.flash('error_msg', 'Error placing order');
        res.redirect('/cafeteria/menu');
    }
};

// Get user's orders
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.session.user._id })
            .populate('items.menuItem')
            .sort({ createdAt: -1 });

        res.render('cafeteria/orders', {
            title: 'My Orders',
            orders,
            currentPage: 'cafeteria'
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        req.flash('error_msg', 'Error loading orders');
        res.redirect('/cafeteria');
    }
};

// Get order details
const getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.menuItem')
            .populate('user', 'name email');

        if (!order) {
            req.flash('error_msg', 'Order not found');
            return res.redirect('/cafeteria/orders');
        }

        // Check if user owns this order
        if (order.user._id.toString() !== req.session.user._id && req.session.user.role !== 'admin') {
            req.flash('error_msg', 'Access denied');
            return res.redirect('/cafeteria/orders');
        }

        res.render('cafeteria/order-details', {
            title: `Order #${order.orderNumber}`,
            order,
            currentPage: 'cafeteria'
        });
    } catch (error) {
        console.error('Get order details error:', error);
        req.flash('error_msg', 'Error loading order details');
        res.redirect('/cafeteria/orders');
    }
};

// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            req.flash('error_msg', 'Order not found');
            return res.redirect('/cafeteria/orders');
        }

        // Check if user owns this order
        if (order.user.toString() !== req.session.user._id) {
            req.flash('error_msg', 'Access denied');
            return res.redirect('/cafeteria/orders');
        }

        // Check if order can be cancelled
        if (order.status !== 'pending' && order.status !== 'confirmed') {
            req.flash('error_msg', 'Order cannot be cancelled at this stage');
            return res.redirect('/cafeteria/orders');
        }

        order.status = 'cancelled';
        await order.save();

        // Free up table if order was associated with a table
        if (order.tableNumber) {
            await Table.findOneAndUpdate(
                { tableNumber: order.tableNumber },
                { status: 'available', currentOrder: null }
            );
        }

        req.flash('success_msg', 'Order cancelled successfully');
        res.redirect('/cafeteria/orders');
    } catch (error) {
        console.error('Cancel order error:', error);
        req.flash('error_msg', 'Error cancelling order');
        res.redirect('/cafeteria/orders');
    }
};

// Get current queue status
const getQueueStatus = async (req, res) => {
    try {
        const queueStatus = await QueueStatus.findOne().sort({ lastUpdated: -1 });

        if (!queueStatus) {
            return res.json({
                success: false,
                message: 'Queue status not available'
            });
        }

        res.json({
            success: true,
            data: queueStatus
        });
    } catch (error) {
        console.error('Get queue status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting queue status'
        });
    }
};

// Update queue status (for camera integration)
const updateQueueStatus = async (req, res) => {
    try {
        const { currentCount, maxCapacity, isManualOverride, overrideReason } = req.body;

        let queueStatus = await QueueStatus.findOne().sort({ lastUpdated: -1 });

        if (!queueStatus) {
            queueStatus = new QueueStatus({
                currentCount: 0,
                maxCapacity: 100
            });
        }

        queueStatus.currentCount = currentCount;
        queueStatus.maxCapacity = maxCapacity;
        queueStatus.isManualOverride = isManualOverride === 'true';
        queueStatus.overrideReason = overrideReason || '';

        // Calculate crowd color and status
        const crowdColor = calculateCrowdColor(currentCount, maxCapacity);
        const crowdInfo = getCrowdStatus(crowdColor);

        queueStatus.crowdColor = crowdColor;
        queueStatus.crowdStatus = crowdInfo.status;
        queueStatus.message = crowdInfo.message;
        queueStatus.lastUpdated = new Date();

        if (isManualOverride === 'true') {
            queueStatus.overrideBy = req.session.user._id;
        }

        await queueStatus.save();

        res.json({
            success: true,
            data: queueStatus
        });
    } catch (error) {
        console.error('Update queue status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating queue status'
        });
    }
};

module.exports = {
    getCafeteriaDashboard,
    getMenuItems,
    getMenuItemDetails,
    createOrder,
    getUserOrders,
    getOrderDetails,
    cancelOrder,
    getQueueStatus,
    updateQueueStatus
};
