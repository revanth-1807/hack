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
        type: String,
        default: ''
    },
    image: {
        type: String, // file path or URL
        default: ''
    },
    status: {
        type: String,
        enum: ['found', 'claimed', 'archived'],
        default: 'found'
    },

    // Reporter details
    foundBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reporterName: { type: String, required: true },
    reporterPhone: { type: String, required: true },
    reporterEmail: { type: String, required: true },

    // Claimer details
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    claimedByName: String,
    claimedByPhone: String,
    claimedByEmail: String,
    claimDate: Date,

    verificationCode: {
        type: String,
        unique: true
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Generate verification code before saving
lostItemSchema.pre('save', async function (next) {
    if (this.isNew && !this.verificationCode) {
        let code, exists = true;
        while (exists) {
            code = Math.random().toString(36).substr(2, 8).toUpperCase();
            exists = await mongoose.models.LostItem.findOne({ verificationCode: code });
        }
        this.verificationCode = code;
    }
    next();
});

module.exports = mongoose.model('LostItem', lostItemSchema);
