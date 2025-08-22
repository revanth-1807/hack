const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['vegetables', 'fruits', 'dairy', 'meat', 'seafood', 'grains', 'spices', 'beverages', 'cleaning', 'other'],
        required: true
    },
    unit: {
        type: String,
        enum: ['kg', 'g', 'l', 'ml', 'piece', 'pack', 'dozen'],
        required: true
    },
    currentStock: {
        type: Number,
        required: true,
        min: 0
    },
    minimumStock: {
        type: Number,
        required: true,
        min: 0
    },
    unitCost: {
        type: Number,
        required: true,
        min: 0
    },
    supplier: {
        type: String,
        trim: true
    },
    supplierContact: {
        type: String,
        trim: true
    },
    lastRestocked: {
        type: Date
    },
    nextRestockDate: {
        type: Date
    },
    shelfLife: {
        type: Number, // in days
        default: 0
    },
    expirationDate: {
        type: Date
    },
    isPerishable: {
        type: Boolean,
        default: false
    },
    usedInMenuItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem'
    }],
    usageRate: {
        type: Number, // average daily usage
        default: 0
    },
    status: {
        type: String,
        enum: ['in_stock', 'low_stock', 'out_of_stock', 'expired'],
        default: 'in_stock'
    },
    notes: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp before saving
inventoryItemSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Update status based on stock levels
    if (this.currentStock === 0) {
        this.status = 'out_of_stock';
    } else if (this.currentStock <= this.minimumStock) {
        this.status = 'low_stock';
    } else if (this.expirationDate && this.expirationDate < new Date()) {
        this.status = 'expired';
    } else {
        this.status = 'in_stock';
    }
    
    next();
});

// Auto-calculate next restock date
inventoryItemSchema.pre('save', function(next) {
    if (this.usageRate > 0 && this.currentStock > 0) {
        const daysUntilRestock = Math.ceil(this.currentStock / this.usageRate);
        this.nextRestockDate = new Date(Date.now() + daysUntilRestock * 24 * 60 * 60 * 1000);
    }
    next();
});

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
