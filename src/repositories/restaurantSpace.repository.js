const { RestaurantSpace } = require('../models');

class RestaurantSpaceRepository {
    async create(data) {
        const space = new RestaurantSpace(data);
        return await space.save();
    }

    async findById(id) {
        return await RestaurantSpace.findById(id);
    }

    async findByRestaurantId(restaurantId) {
        return await RestaurantSpace.find({ restaurantId });
    }

    async findByRestaurantIds(restaurantIds) {
        return await RestaurantSpace.find({ restaurantId: { $in: restaurantIds } }).lean();
    }

    async searchByCapacityAndStyle(guestCount, seatingTypes, excludeSpaceIds = []) {
        const query = {
            maxCapacity: { $gte: guestCount },
            minCapacity: { $lte: guestCount }
        };

        if (seatingTypes && seatingTypes.length > 0) {
            query.allowedEventStyles = { $in: seatingTypes };
        }

        if (excludeSpaceIds.length > 0) {
            query._id = { $nin: excludeSpaceIds };
        }

        return await RestaurantSpace.find(query)
            .select('restaurantId minCapacity maxCapacity')
            .lean();
    }

    async update(id, updateData) {
        return await RestaurantSpace.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id) {
        return await RestaurantSpace.findByIdAndDelete(id);
    }
}

module.exports = RestaurantSpaceRepository;
