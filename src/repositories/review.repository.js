const { Review } = require('../models');

class ReviewRepository {
    async create(data) {
        const review = new Review(data);
        return await review.save();
    }

    async findById(id) {
        return await Review.findById(id)
            .populate('eventId')
            .populate('reviewerId', 'name email')
            .populate('photos');
    }

    async findByEventId(eventId) {
        return await Review.findOne({ eventId })
            .populate('reviewerId', 'name email')
            .populate('photos');
    }

    async existsByEventId(eventId) {
        const count = await Review.countDocuments({ eventId });
        return count > 0;
    }

    async findByRestaurantId(restaurantId) {
        // Need to join through BookingRequest
        return await Review.find()
            .populate({
                path: 'eventId',
                populate: {
                    path: 'bookingRequestId',
                    match: { restaurantId },
                    select: 'restaurantId'
                }
            })
            .populate('reviewerId', 'name email');
    }

    async updateStatus(id, status) {
        return await Review.findByIdAndUpdate(id, { status }, { new: true });
    }
}

module.exports = ReviewRepository;
