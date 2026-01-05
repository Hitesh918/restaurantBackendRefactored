const { BookingMessage } = require('../models');

class BookingMessageRepository {
    async create(data) {
        const message = new BookingMessage(data);
        return await message.save();
    }

    async findById(id) {
        return await BookingMessage.findById(id);
    }

    async findByBookingRequestId(bookingRequestId) {
        return await BookingMessage.find({ bookingRequestId })
            .populate('senderUserId', 'email role')
            .sort({ createdAt: 1 });
    }
}

module.exports = BookingMessageRepository;
