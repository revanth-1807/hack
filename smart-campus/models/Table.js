const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    tableNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    location: {
        type: String,
        enum: ['indoor', 'outdoor', 'terrace', 'private'],
        default: 'indoor'
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'reserved', 'maintenance'],
        default: 'available'
    },
    currentOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    currentReservation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reservation'
    },
    features: [{
        type: String,
        enum: ['window', 'power_outlet', 'wheelchair_accessible', 'smoking']
    }],
    qrCode: {
        type: String, // URL or data for QR code
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
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
tableSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Table', tableSchema);
