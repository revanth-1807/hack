const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['academic', 'holiday', 'exam', 'event', 'deadline'],
        required: true
    },
    academicYear: {
        type: String,
        required: true // e.g., "2023-2024"
    },
    semester: {
        type: String,
        enum: ['1', '2', '3', '4', '5', '6', '7', '8', 'annual'],
        required: true
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurrencePattern: {
        type: String,
        enum: ['yearly', 'semesterly', 'monthly', 'weekly', 'daily'],
        default: 'yearly'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isPublic: {
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
calendarEventSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Index for efficient querying
calendarEventSchema.index({ academicYear: 1, semester: 1 });
calendarEventSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
