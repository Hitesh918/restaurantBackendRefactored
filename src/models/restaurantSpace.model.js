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
  },
  { timestamps: true }
);

const RestaurantSpace = mongoose.model(
  "RestaurantSpace",
  restaurantSpaceSchema
);  
module.exports = RestaurantSpace
