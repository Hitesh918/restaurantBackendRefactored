const mongoose = require('mongoose');

const restaurantProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    
    // Basic Profile Information
    profileName: { type: String, required: true }, // Umbrella name (e.g., "Smith Restaurant Group")
    restaurantName: { type: String, required: true }, // Main restaurant name
    
    // Contact Information
    contactName: { type: String, required: true },
    contactPosition: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    
    // Business Information
    businessEmail: { type: String, required: true },
    businessPhone: { type: String, required: true },
    
    // Address
    address: {
        line1: { type: String, required: true },
        area: String,
        city: { type: String, required: true },
        state: String,
        country: { type: String, required: true },
        zip: String,
    },
    
    geo: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    
    // Restaurant Details
    cuisine: { type: String, required: true },
    description: { type: String, required: true },
    
    // Hours
    openingHours: {
        monday: { open: String, close: String, closed: { type: Boolean, default: false } },
        tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
        wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
        thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
        friday: { open: String, close: String, closed: { type: Boolean, default: false } },
        saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
        sunday: { open: String, close: String, closed: { type: Boolean, default: false } },
    },
    
    // Social Media Links
    socialMedia: {
        facebook: String,
        instagram: String,
        twitter: String,
        linkedin: String,
        tiktok: String,
        youtube: String,
        website: String,
    },
    
    // Facilities
    facilities: {
        wifi: { type: Boolean, default: false },
        outdoorSeating: { type: Boolean, default: false },
        soundSystem: { type: Boolean, default: false },
        visual: { type: Boolean, default: false }, // TV, screens
        separateEntrance: { type: Boolean, default: false },
        privateBar: { type: Boolean, default: false },
        privateWashrooms: { type: Boolean, default: false },
    },
    
    // Offers
    offers: {
        tableBookingEnabled: { type: Boolean, default: true },
        specialOffers: [String], // Array of special offers
    },
    
    // Media URLs (will be stored in media collection but referenced here)
    logoUrl: String,
    heroImageUrl: String,
    
    // Documents and additional content
    googleTourUrl: String,
    
    // Legacy system compatibility
    legacyRestaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        sparse: true // Allow null values
    },
    profileStatus: {
        type: String,
        enum: ['draft', 'pending', 'active', 'expired', 'suspended', 'needs_attention'],
        default: 'draft'
    },
    
    // Enhanced status tracking
    subscriptionStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'expired', 'trial', 'cancelled'],
        default: 'unpaid'
    },
    
    subscriptionExpiry: {
        type: Date
    },
    
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'overdue'],
        default: 'pending'
    },
    
    lastPaymentDate: {
        type: Date
    },
    
    // Attention flags
    needsAttention: {
        type: Boolean,
        default: false
    },
    
    attentionReasons: [{
        type: String,
        enum: ['incomplete_profile', 'payment_overdue', 'expired_subscription', 'missing_documents', 'compliance_issue', 'customer_complaint']
    }],
    
    // Legacy fields for compatibility
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    pricePerPlate: { type: Number },
    
}, { timestamps: true });

// Indexes for search performance
restaurantProfileSchema.index({ 'address.city': 1, profileStatus: 1 });
restaurantProfileSchema.index({ cuisine: 1 });
restaurantProfileSchema.index({ profileName: 'text', restaurantName: 'text', description: 'text' });

const RestaurantProfile = mongoose.model('RestaurantProfile', restaurantProfileSchema);

module.exports = RestaurantProfile;