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
        if (restaurantIds.length === 0) {
            // If empty array, return all spaces
            return await RestaurantSpace.find({}).lean();
        }
        return await RestaurantSpace.find({ restaurantId: { $in: restaurantIds } }).lean();
    }

    async findAll() {
        return await RestaurantSpace.find({}).lean();
    }

    async searchByCapacityAndStyle(guestCount, seatingTypes, excludeSpaceIds = []) {
        const query = {};

        // Only apply capacity filters if guestCount is a valid positive number
        if (guestCount && !isNaN(guestCount) && guestCount > 0) {
            query.maxCapacity = { $gte: guestCount };
            query.minCapacity = { $lte: guestCount };
        }

        // Apply seating type filter if provided
        if (seatingTypes && seatingTypes.length > 0) {
            query.allowedEventStyles = { $in: seatingTypes };
        }

        if (excludeSpaceIds.length > 0) {
            query._id = { $nin: excludeSpaceIds };
        }

        return await RestaurantSpace.find(query)
            .select('restaurantId minCapacity maxCapacity allowedEventStyles')
            .lean();
    }

    /**
     * Find spaces by seating types only (no capacity filter)
     */
    async findBySeatingTypes(seatingTypes, excludeSpaceIds = []) {
        const query = {};

        if (seatingTypes && seatingTypes.length > 0) {
            query.allowedEventStyles = { $in: seatingTypes };
        }

        if (excludeSpaceIds.length > 0) {
            query._id = { $nin: excludeSpaceIds };
        }

        return await RestaurantSpace.find(query)
            .select('restaurantId minCapacity maxCapacity allowedEventStyles')
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
