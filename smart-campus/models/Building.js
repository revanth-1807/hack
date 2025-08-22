const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['academic', 'administrative', 'residential', 'recreational', 'library', 'cafeteria', 'sports'],
        required: true
    },
    floors: {
        type: Number,
        required: true,
        min: 1
    },
    coordinates: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    contactInfo: {
        phone: String,
        email: String,
        website: String
    },
    operatingHours: {
        Monday: { open: String, close: String },
        Tuesday: { open: String, close: String },
        Wednesday: { open: String, close: String },
        Thursday: { open: String, close: String },
        Friday: { open: String, close: String },
        Saturday: { open: String, close: String },
        Sunday: { open: String, close: String }
    },
    facilities: [{
        type: String,
        enum: ['wifi', 'cafeteria', 'library', 'labs', 'classrooms', 'auditorium', 'parking', 'disabled_access']
    }],
    image3d: {
        type: String, // URL to 3D model or image
        default: ''
    },
    floorPlan: {
        type: String, // URL to floor plan
        default: ''
    },
    departments: [{
        name: String,
        contact: String,
        location: String
    }],
    isActive: {
        type: Boolean,
        default: true
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
buildingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Geospatial index for location-based queries
buildingSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });

module.exports = mongoose.model('Building', buildingSchema);
