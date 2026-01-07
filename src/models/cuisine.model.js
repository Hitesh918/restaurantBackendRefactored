const mongoose = require('mongoose');

const cuisineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Cuisine name is required'],
        unique: true,
        trim: true,
    },
    imageUrl: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['Publish', 'Draft', 'Unpublish'],
        default: 'Draft',
    },
}, { 
    timestamps: true 
});

// Index for faster searches
// Note: name field already has an index from unique: true, so we don't need to index it again
cuisineSchema.index({ status: 1 });

const Cuisine = mongoose.model('Cuisine', cuisineSchema);

module.exports = Cuisine;

