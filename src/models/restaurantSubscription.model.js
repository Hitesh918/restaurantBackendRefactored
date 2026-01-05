const mongoose = require("mongoose");

const restaurantSubscriptionSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      unique: true,
    },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    assignedByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["active", "paused", "expired", "cancelled"],
      default: "active",
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const RestaurantSubscription = mongoose.model(
  "RestaurantSubscription",
  restaurantSubscriptionSchema
);

module.exports = RestaurantSubscription;
