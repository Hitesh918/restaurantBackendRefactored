const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    restaurantName: { type: String, required: true },
    ownerName: { type: String, required: true },
    shortDescription: { type: String },
    businessEmail: { type: String, required: true },
    phone: { type: String, required: true },

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

    cuisines: { type: [String], required: true },
    features: [String],
    categoryTags: [String], // best_view, iconic, awarded, etc.

    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    pricePerPlate: { type: Number }, // average price per person

    openingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },

    listingStatus: {
      type: String,
      enum: ['draft', 'pending', 'active'],
      default: 'draft'
    }
}, { timestamps: true });

// Index for search performance
restaurantSchema.index({ 'address.city': 1, listingStatus: 1 });
restaurantSchema.index({ cuisines: 1 });
restaurantSchema.index({ features: 1 });
restaurantSchema.index({ categoryTags: 1 });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
