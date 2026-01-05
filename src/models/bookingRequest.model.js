const mongoose = require("mongoose");

const bookingRequestSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

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
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },

    guestCount: { type: Number, required: true },
    eventStyle: { type: String, enum: ["seated", "standing"], required: true },

    messageToHost: { type: String },

    bidPrice: { type: Number },
    acceptMinSpend: { type: Number },

    currency: { type: String, default: "INR" },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "expired"],
      default: "pending",
    },

    decisionNotes: { type: String },
    decisionAt: { type: Date },

    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const BookingRequest = mongoose.model("BookingRequest", bookingRequestSchema);
module.exports = BookingRequest;
