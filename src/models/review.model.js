const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      unique: true, // Only ONE review per event
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
      required: true,
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

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
