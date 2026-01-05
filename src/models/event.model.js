const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    bookingRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookingRequest",
      required: true,
      unique: true,
    },

    finalGuestCount: { type: Number, required: true },

    menuSelection: {
      menuId: { type: mongoose.Schema.Types.ObjectId, ref: "Media" },
      selectedItems: [String],
    },

    setupNotes: { type: String },

    timeline: {
      guestArrival: { type: String },
      foodService: { type: String },
      teardown: { type: String },
    },

    productionRequirements: [String],
    fnbDetails: { type: String },

    specsStatus: {
      type: String,
      enum: ["draft", "final"],
      default: "draft",
    },

    status: {
      type: String,
      enum: ["draft", "final", "completed"],
      default: "draft",
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
