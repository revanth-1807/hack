const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const InventoryItem = require('../models/InventoryItem');
const QueueStatus = require('../models/QueueStatus');

// Admin dashboard
const getAdminDashboard = async (req, res) => {
    try {
        // Get statistics
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const completedOrders = await Order.countDocuments({ status: 'completed' });
        const totalRevenue = await Order.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // Get low stock items
        const lowStockItems = await InventoryItem.find({ status: 'low_stock' })
            .sort({ currentStock: 1 })
            .limit(5);

        // Get recent orders
        const recentOrders = await Order.find()
            .populate('user', 'name email')
            .populate('items.menuItem')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get queue status
        const queueStatus = await QueueStatus.findOne().sort({ lastUpdated: -1 });

        res.render('cafe-admin/dashboard', {
            title: 'Cafeteria Admin',
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            lowStockItems,
            recentOrders,
            queueStatus,
            currentPage: 'admin'
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        req.flash('error_msg', 'Error loading admin dashboard');
        res.redirect('/');
    }
};

// Menu management
const getMenuManagement = async (req, res) => {
    try {
        const menuItems = await MenuItem.find().sort({ category: 1, name: 1 });
        const categories = await MenuItem.distinct('category');

        res.render('cafe-admin/menu-management', {
            title: 'Menu Management',
            menuItems,
            categories,
            currentPage: 'admin'
        });
    } catch (error) {
        console.error('Menu management error:', error);
        req.flash('error_msg', 'Error loading menu management');
        res.redirect('/admin/cafe');
    }
};

// Create menu item
const createMenuItem = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            price,
            ingredients,
            allergens,
            isVegetarian,
            isVegan,
            preparationTime,
            nutritionalInfo
        } = req.body;

        const newMenuItem = new MenuItem({
            name,
            description,
            category,
            price: parseFloat(price),
            ingredients: ingredients ? ingredients.split(',').map(i => i.trim()) : [],
            allergens: allergens ? allergens.split(',').map(a => a.trim()) : [],
            isVegetarian: isVegetarian === 'true',
            isVegan: isVegan === 'true',
            preparationTime: parseInt(preparationTime) || 15,
            nutritionalInfo: nutritionalInfo ? JSON.parse(nutritionalInfo) : {},
            createdBy: req.session.user._id
        });

        await newMenuItem.save();

        req.flash('success_msg', 'Menu item created successfully');
        res.redirect('/admin/cafe/menu');
    } catch (error) {
        console.error('Create menu item error:', error);
        req.flash('error_msg', 'Error creating menu item');
        res.redirect('/admin/cafe/menu/create');
    }
};

// Update menu item
const updateMenuItem = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            price,
            ingredients,
            allergens,
            isVegetarian,
            isVegan,
            isAvailable,
            preparationTime,
            nutritionalInfo
        } = req.body;

        await MenuItem.findByIdAndUpdate(req.params.id, {
            name,
            description,
            category,
            price: parseFloat(price),
            ingredients: ingredients ? ingredients.split(',').map(i => i.trim()) : [],
            allergens: allergens ? allergens.split(',').map(a => a.trim()) : [],
            isVegetarian: isVegetarian === 'true',
            isVegan: isVegan === 'true',
            isAvailable: isAvailable === 'true',
            preparationTime: parseInt(preparationTime) || 15,
            nutritionalInfo: nutritionalInfo ? JSON.parse(nutritionalInfo) : {}
        });

        req.flash('success_msg', 'Menu item updated successfully');
        res.redirect('/admin/cafe/menu');
    } catch (error) {
        console.error('Update menu item error:', error);
        req.flash('error_msg', 'Error updating menu item');
        res.redirect(`/admin/cafe/menu/edit/${req.params.id}`);
    }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
    try {
        await MenuItem.findByIdAndDelete(req.params.id);

        req.flash('success_msg', 'Menu item deleted successfully');
        res.redirect('/admin/cafe/menu');
    } catch (error) {
        console.error('Delete menu item error:', error);
        req.flash('error_msg', 'Error deleting menu item');
        res.redirect('/admin/cafe/menu');
    }
};

// Order management
const getOrderManagement = async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .populate('items.menuItem')
            .sort({ createdAt: -1 });

        res.render('cafe-admin/order-management', {
            title: 'Order Management',
            orders,
            selectedStatus: status,
            currentPage: 'admin'
        });
    } catch (error) {
        console.error('Order management error:', error);
        req.flash('error_msg', 'Error loading orders');
        res.redirect('/admin/cafe');
    }
};

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('user', 'name email');

        if (!order) {
            req.flash('error_msg', 'Order not found');
            return res.redirect('/admin/cafe/orders');
        }

        // If order is completed, free up the table
        if (status === 'completed' && order.tableNumber) {
            await Table.findOneAndUpdate(
                { tableNumber: order.tableNumber },
                { status: 'available', currentOrder: null }
            );
        }

        req.flash('success_msg', 'Order status updated successfully');
        res.redirect('/admin/cafe/orders');
    } catch (error) {
        console.error('Update order status error:', error);
        req.flash('error_msg', 'Error updating order status');
        res.redirect('/admin/cafe/orders');
    }
};

// Table management
const getTableManagement = async (req, res) => {
    try {
        const tables = await Table.find().sort({ tableNumber: 1 });
        const reservations = await Reservation.find({
            reservationDate: { $gte: new Date() },
            status: 'confirmed'
        }).populate('user', 'name email');

        res.render('cafe-admin/table-management', {
            title: 'Table Management',
            tables,
            reservations,
            currentPage: 'admin'
        });
    } catch (error) {
        console.error('Table management error:', error);
        req.flash('error_msg', 'Error loading tables');
        res.redirect('/admin/cafe');
    }
};

// Update table status
const updateTableStatus = async (req, res) => {
    try {
        const { status } = req.body;

        await Table.findByIdAndUpdate(req.params.id, { status });

        req.flash('success_msg', 'Table status updated successfully');
        res.redirect('/admin/cafe/tables');
    } catch (error) {
        console.error('Update table status error:', error);
        req.flash('error_msg', 'Error updating table status');
        res.redirect('/admin/cafe/tables');
    }
};

// Inventory management
const getInventoryManagement = async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        const inventoryItems = await InventoryItem.find(query).sort({ name: 1 });
        const categories = await InventoryItem.distinct('category');

        res.render('cafe-admin/inventory-management', {
            title: 'Inventory Management',
            inventoryItems,
            categories,
            selectedStatus: status,
            currentPage: 'admin'
        });
    } catch (error) {
        console.error('Inventory management error:', error);
        req.flash('error_msg', 'Error loading inventory');
        res.redirect('/admin/cafe');
    }
};

// Create inventory item
const createInventoryItem = async (req, res) => {
    try {
        const {
            name,
            category,
            unit,
            currentStock,
            minimumStock,
            unitCost,
            supplier,
            shelfLife,
            isPerishable
        } = req.body;

        const newItem = new InventoryItem({
            name,
            category,
            unit,
            currentStock: parseInt(currentStock),
            minimumStock: parseInt(minimumStock),
            unitCost: parseFloat(unitCost),
            supplier,
            shelfLife: parseInt(shelfLife) || 0,
            isPerishable: isPerishable === 'true',
            createdBy: req.session.user._id
        });

        await newItem.save();

        req.flash('success_msg', 'Inventory item created successfully');
        res.redirect('/admin/cafe/inventory');
    } catch (error) {
        console.error('Create inventory item error:', error);
        req.flash('error_msg', 'Error creating inventory item');
        res.redirect('/admin/cafe/inventory/create');
    }
};

// Update inventory item
const updateInventoryItem = async (req, res) => {
    try {
        const {
            name,
            category,
            unit,
            currentStock,
            minimumStock,
            unitCost,
            supplier,
            shelfLife,
            isPerishable
        } = req.body;

        await InventoryItem.findByIdAndUpdate(req.params.id, {
            name,
            category,
            unit,
            currentStock: parseInt(currentStock),
            minimumStock: parseInt(minimumStock),
            unitCost: parseFloat(unitCost),
            supplier,
            shelfLife: parseInt(shelfLife) || 0,
            isPerishable: isPerishable === 'true'
        });

        req.flash('success_msg', 'Inventory item updated successfully');
        res.redirect('/admin/cafe/inventory');
    } catch (error) {
        console.error('Update inventory item error:', error);
        req.flash('error_msg', 'Error updating inventory item');
        res.redirect(`/admin/cafe/inventory/edit/${req.params.id}`);
    }
};

// Restock inventory
const restockInventory = async (req, res) => {
    try {
        const { quantity } = req.body;

        const item = await InventoryItem.findById(req.params.id);
        if (!item) {
            req.flash('error_msg', 'Item not found');
            return res.redirect('/admin/cafe/inventory');
        }

        item.currentStock += parseInt(quantity);
        item.lastRestocked = new Date();
        await item.save();

        req.flash('success_msg', 'Inventory restocked successfully');
        res.redirect('/admin/cafe/inventory');
    } catch (error) {
        console.error('Restock inventory error:', error);
        req.flash('error_msg', 'Error restocking inventory');
        res.redirect('/admin/cafe/inventory');
    }
};

// Reports and analytics
const getReports = async (req, res) => {
    try {
        // Sales report (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const salesReport = await Order.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    totalSales: { $sum: '$totalAmount' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Popular items
        const popularItems = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.menuItem',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'menuitems',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'menuItem'
                }
            },
            { $unwind: '$menuItem' }
        ]);

        res.render('cafe-admin/reports', {
            title: 'Reports & Analytics',
            salesReport,
            popularItems,
            currentPage: 'admin'
        });
    } catch (error) {
        console.error('Reports error:', error);
        req.flash('error_msg', 'Error loading reports');
        res.redirect('/admin/cafe');
    }
};

module.exports = {
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
};
