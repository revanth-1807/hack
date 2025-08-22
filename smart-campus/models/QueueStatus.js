const mongoose = require('mongoose');

const queueStatusSchema = new mongoose.Schema({
    currentCount: {
        type: Number,
        required: true,
        min: 0
    },
    maxCapacity: {
        type: Number,
        required: true,
        min: 1
    },
    crowdColor: {
        type: String,
        enum: ['white', 'orange', 'red'],
        required: true
    },
    crowdStatus: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    estimatedWaitTime: {
        type: Number, // in minutes
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    isManualOverride: {
        type: Boolean,
        default: false
    },
    overrideReason: {
        type: String,
        default: ''
    },
    overrideBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cameraId: {
        type: String,
        default: 'default'
    },
    location: {
        type: String,
        enum: ['main_hall', 'north_wing', 'south_wing', 'terrace'],
        default: 'main_hall'
    },
    historicalData: [{
        timestamp: { type: Date, default: Date.now },
        count: Number,
        color: String,
        status: String
    }],
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
queueStatusSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Add to historical data if count or color changes
    if (this.isModified('currentCount') || this.isModified('crowdColor')) {
        this.historicalData.push({
            timestamp: new Date(),
            count: this.currentCount,
            color: this.crowdColor,
            status: this.crowdStatus
        });
        
        // Keep only last 100 records
        if (this.historicalData.length > 100) {
            this.historicalData = this.historicalData.slice(-100);
        }
    }
    
    next();
});

// Calculate estimated wait time based on crowd level
queueStatusSchema.pre('save', function(next) {
    const percentage = (this.currentCount / this.maxCapacity) * 100;
    
    if (percentage < 33) {
        this.estimatedWaitTime = 5; // 5 minutes
    } else if (percentage >= 33 && percentage < 66) {
        this.estimatedWaitTime = 15; // 15 minutes
    } else {
        this.estimatedWaitTime = 30; // 30 minutes
    }
    
    next();
});

module.exports = mongoose.model('QueueStatus', queueStatusSchema);
