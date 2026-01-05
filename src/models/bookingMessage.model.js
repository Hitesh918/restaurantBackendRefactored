const mongoose = require("mongoose");

const bookingMessageSchema = new mongoose.Schema(
  {
    bookingRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BookingRequest",
      required: true,
    },

    senderUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    messageText: { type: String, required: true },

    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Media" }],
  },
  { timestamps: true }
);

const BookingMessage = mongoose.model("BookingMessage", bookingMessageSchema);

module.exports = BookingMessage