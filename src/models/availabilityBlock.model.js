const mongoose = require("mongoose");

const availabilityBlockSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RestaurantSpace",
      required: true,
    },

    eventDate: { type: Date, required: true },

    startTime: { type: String, required: true }, // "18:00"
    endTime: { type: String, required: true },   // "22:00"

    reason: {
      type: String,
      enum: ["event", "maintenance", "hold"],
      required: true,
    },
  },
  { timestamps: true }
);
const AvailabiltyBlock = mongoose.model("AvailabilityBlock", availabilityBlockSchema);

module.exports = AvailabiltyBlock;
