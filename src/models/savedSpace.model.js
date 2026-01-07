const mongoose = require('mongoose');

const savedSpaceSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
}, { 
    timestamps: true
});

// Compound index to ensure uniqueness - a customer can only save a restaurant once
savedSpaceSchema.index({ customerId: 1, restaurantId: 1 }, { unique: true });

const SavedSpace = mongoose.model('SavedSpace', savedSpaceSchema);
module.exports = SavedSpace;

