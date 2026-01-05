const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name cannot be empty'],
        unique: true,  
    },
    description: { type: String },
    price: {
        type: Number,
        required: [true, 'Price cannot be empty'],
    },
    currency: { type: String, default: "INR" },
    features: {
        priorityListing: { type: Boolean, default: false },
        crmAccess: { type: Boolean, default: false },
        messagingEnabled: { type: Boolean, default: true },
        analyticsAccess: { type: Boolean, default: false },
    },
    durationInDays: {
        type: Number,
        required: [true, 'Duration cannot be empty'],
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
