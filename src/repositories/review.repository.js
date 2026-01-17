const Review = require('../models/review.model');

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
        return await Review.find({ restaurantId })
            .populate('reviewerId', 'name email phone companyName')
            .populate('photos')
            .sort({ createdAt: -1 });
    }

    async findPublishedByRestaurantId(restaurantId) {
        return await Review.find({ restaurantId, status: 'published' })
            .populate('reviewerId', 'name email phone companyName')
            .populate('photos')
            .sort({ createdAt: -1 });
    }

    async findByEventIds(eventIds) {
        return await Review.find({ eventId: { $in: eventIds } })
            .populate('reviewerId', 'name email');
    }

    async updateStatus(id, status) {
        return await Review.findByIdAndUpdate(id, { status }, { new: true });
    }

    async findByRestaurantIdAndEventId(restaurantId, eventId) {
        return await Review.findOne({ restaurantId, eventId })
            .populate('reviewerId', 'name email')
            .populate('photos');
    }
}

module.exports = ReviewRepository;
