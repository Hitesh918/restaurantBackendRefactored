const mongoose = require("mongoose");

const media = new mongoose.Schema(
  {
    ownerType: {
      type: String,
      enum: ["restaurant", "space", "event"],
      required: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    mediaType: {
      type: String,
      enum: ["photo", "video", "pdf"],
      required: true,
    },

    category: {
      type: String,
      enum: [
        "hero",
        "private_dining",
        "events_style",
        "food_beverage",
        "ambience",
        "outdoor",
        "floorplan",
        "menu",
      ],
      required: true,
    },

    url: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Media", media);
