const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    reservationNumber: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: true
    },
    tableNumber: {
        type: String,
        required: true
    },
    reservationDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    numberOfGuests: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['confirmed', 'checked-in', 'completed', 'cancelled', 'no-show'],
        default: 'confirmed'
    },
    specialRequests: {
        type: String,
        default: ''
    },
    contactPhone: {
        type: String,
        required: true
    },
    contactEmail: {
        type: String,
        required: true
    },
    checkInTime: {
        type: Date
    },
    checkOutTime: {
        type: Date
    },
    cancellationReason: {
        type: String
    },
    cancellationTime: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
reservationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Generate reservation number before saving
reservationSchema.pre('save', function(next) {
    if (this.isNew && !this.reservationNumber) {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.reservationNumber = `RES-${timestamp}-${random}`;
    }
    next();
});

// Check for overlapping reservations
reservationSchema.index({ table: 1, reservationDate: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
