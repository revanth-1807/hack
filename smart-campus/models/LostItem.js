const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['electronics', 'books', 'clothing', 'accessories', 'documents', 'other'],
        required: true
    },
    locationFound: {
        type: String,
        required: true
    },
    dateFound: {
        type: Date,
        default: Date.now
    },
    timeFound: {
        type: String
    },
    image: {
        type: String, // URL to image
        default: ''
    },
    status: {
        type: String,
        enum: ['found', 'claimed', 'archived'],
        default: 'found'
    },
    foundBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    foundByName: {
        type: String,
        required: true
    },
    foundByPhone: {
        type: String,
        required: true
    },
    foundByEmail: {
        type: String,
        required: true
    },
    claimedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    claimedByName: {
        type: String
    },
    claimedByPhone: {
        type: String
    },
    claimedByEmail: {
        type: String
    },
    claimDate: {
        type: Date
    },
    verificationCode: {
        type: String,
        unique: true
    },
    isVerified: {
        type: Boolean,
        default: false
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
lostItemSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Generate verification code before saving
lostItemSchema.pre('save', function(next) {
    if (this.isNew && !this.verificationCode) {
        this.verificationCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    }
    next();
});

module.exports = mongoose.model('LostItem', lostItemSchema);
