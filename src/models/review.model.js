const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: false,
      sparse: true, // Allows multiple null values for general reviews
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    rating: { 
      type: Number, 
      min: 1, 
      max: 5, 
      required: true 
    },

    reviewText: { 
      type: String,
      required: true 
    },

    eventType: {
      type: String,
      enum: ["corporate", "personal", "agency"],
      
    },

    photos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Media" }],

    status: {
      type: String,
      enum: ["pending_moderation", "published", "rejected"],
      default: "pending_moderation",
    },
  },
  { timestamps: true }
);

// Index for eventId with sparse option to allow multiple null values
reviewSchema.index({ eventId: 1 }, { sparse: true, unique: true });

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
