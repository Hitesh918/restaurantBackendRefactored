const mongoose = require("mongoose");

const restaurantSpaceSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    name: { type: String, required: true },

    minCapacity: { type: Number, required: true },
    maxCapacity: { type: Number, required: true },

    allowedEventStyles: {
      type: [String],
      enum: ["seated", "standing"],
      required: true,
    },

    features: [String],

    // Pricing fields
    pricing: {
      minimumSpend: { type: Number },
      pricePerPerson: { type: Number },
      buyoutCost: { type: Number },
      currency: { type: String, default: "USD" },
      depositRequired: { type: Number },
      cancellationPolicy: { type: String },
    },

    // Contract fields
    contracts: [{
      name: { type: String, required: true },
      documentUrl: { type: String, required: true },
      documentType: { 
        type: String, 
        enum: ["terms", "contract", "agreement", "policy", "other"],
        default: "contract"
      },
      isActive: { type: Boolean, default: true },
      effectiveDate: { type: Date },
      expiryDate: { type: Date },
      description: { type: String },
    }],
  },
  { timestamps: true }
);

const RestaurantSpace = mongoose.model(
  "RestaurantSpace",
  restaurantSpaceSchema
);  
module.exports = RestaurantSpace
