const Event = require('../models/event.model');

class EventRepository {
    async create(data) {
        const event = new Event(data);
        return await event.save();
    }

    async findAll() {
        return await Event.find()
            .populate({
                path: 'bookingRequestId',
                populate: [
                    { path: 'restaurantId', select: 'restaurantName' },
                    { path: 'spaceId', select: 'name' },
                    { path: 'customerId', select: 'name email' }
                ]
            })
            .sort({ createdAt: -1 });
    }

    async findByRestaurantId(restaurantId) {
        // Events don't have restaurantId directly, need to join through BookingRequest
        const events = await Event.find()
            .populate({
                path: 'bookingRequestId',
                match: { restaurantId },
                populate: [
                    { path: 'restaurantId', select: 'restaurantName' },
                    { path: 'spaceId', select: 'name' },
                    { path: 'customerId', select: 'name email' }
                ]
            })
            .sort({ createdAt: -1 });
        
        // Filter out events where bookingRequestId is null (didn't match restaurantId)
        return events.filter(e => e.bookingRequestId !== null);
    }

    async findByCustomerId(customerId) {
        const events = await Event.find()
            .populate({
                path: 'bookingRequestId',
                match: { customerId },
                populate: [
                    { path: 'restaurantId', select: 'restaurantName' },
                    { path: 'spaceId', select: 'name' }
                ]
            })
            .sort({ createdAt: -1 });
        
        return events.filter(e => e.bookingRequestId !== null);
    }

    async findById(id) {
        return await Event.findById(id)
            .populate({
                path: 'bookingRequestId',
                populate: [
                    { path: 'restaurantId', select: 'restaurantName' },
                    { path: 'spaceId', select: 'name' }
                ]
            });
    }

    async findByBookingRequestId(bookingRequestId) {
        return await Event.findOne({ bookingRequestId });
    }

    async existsByBookingRequestId(bookingRequestId) {
        const count = await Event.countDocuments({ bookingRequestId });
        return count > 0;
    }

    async update(id, data) {
        return await Event.findByIdAndUpdate(id, data, { new: true });
    }

    async updateSpecs(id, specsData) {
        return await Event.findByIdAndUpdate(id, specsData, { new: true });
    }

    async updateStatus(id, status) {
        return await Event.findByIdAndUpdate(id, { status }, { new: true });
    }

    async updateSpecsStatus(id, specsStatus) {
        return await Event.findByIdAndUpdate(id, { specsStatus }, { new: true });
    }
}

module.exports = EventRepository;
