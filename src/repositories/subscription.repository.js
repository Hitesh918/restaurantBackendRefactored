const { RestaurantSubscription } = require('../models');

class SubscriptionRepository {
    async create(data) {
        const subscription = new RestaurantSubscription(data);
        return await subscription.save();
    }

    async findById(id) {
        return await RestaurantSubscription.findById(id)
            .populate('planId', 'name price durationInDays features');
    }

    async findByRestaurantId(restaurantId) {
        return await RestaurantSubscription.findOne({ restaurantId })
            .populate('planId', 'name price durationInDays features currency');
    }

    async findActiveByRestaurantId(restaurantId) {
        return await RestaurantSubscription.findOne({ 
            restaurantId, 
            status: 'active',
            endDate: { $gte: new Date() }
        }).populate('planId', 'name price durationInDays features');
    }

    async update(id, data) {
        return await RestaurantSubscription.findByIdAndUpdate(id, data, { new: true });
    }

    async updateByRestaurantId(restaurantId, data) {
        return await RestaurantSubscription.findOneAndUpdate(
            { restaurantId }, 
            data, 
            { new: true, upsert: true }
        );
    }

    async cancel(restaurantId) {
        return await RestaurantSubscription.findOneAndUpdate(
            { restaurantId },
            { status: 'cancelled' },
            { new: true }
        );
    }
}

module.exports = SubscriptionRepository;
