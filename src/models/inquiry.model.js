const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
        index: true,
    },
    
    // Customer information (can be from User or anonymous)
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    
    // Contact information
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        default: '',
    },
    company: {
        type: String,
        default: '',
    },
    
    // Inquiry details
    subject: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    
    // Event details (optional)
    eventDate: {
        type: Date,
        default: null,
    },
    guestCount: {
        type: Number,
        default: null,
    },
    location: {
        type: String,
        default: '',
    },
    
    // Status and metadata
    status: {
        type: String,
        enum: ['new', 'responded', 'archived'],
        default: 'new',
        index: true,
    },
    
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    
    tags: [{
        type: String,
    }],
    
    // Response tracking
    responseMessage: {
        type: String,
        default: '',
    },
    respondedAt: {
        type: Date,
        default: null,
    },
    respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
}, { timestamps: true });

// Indexes for efficient queries
inquirySchema.index({ restaurantId: 1, status: 1 });
inquirySchema.index({ createdAt: -1 });

const Inquiry = mongoose.model('Inquiry', inquirySchema);

module.exports = Inquiry;

