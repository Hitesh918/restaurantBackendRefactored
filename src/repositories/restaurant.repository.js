const {Restaurant} = require('../models');

class RestaurantRepository {
    async createRestaurant(restaurantData) {
        try {
            const restaurant = await Restaurant.create(restaurantData);
            return restaurant;
        } catch(error) {
            console.log(error);
            throw error;
        }
    }

    async findByUserId(userId) {
        try {
            return await Restaurant.findOne({ userId });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async findById(id) {
        return await Restaurant.findById(id);
    }

    async findByName(name) {
        try {
            const restaurant = await Restaurant.findOne({ restaurantName: name });
            return restaurant;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getAll() {
        try {
            const restaurants = await Restaurant.find({});
            return restaurants;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async search(filters) {
        const query = { listingStatus: 'active' };

        // Location filter (city, area, or address line)
        if (filters.location) {
            const locationRegex = new RegExp(filters.location, 'i');
            query.$or = [
                { 'address.city': locationRegex },
                { 'address.area': locationRegex },
                { 'address.line1': locationRegex },
                { restaurantName: locationRegex }
            ];
        }

        // Cuisine filter
        if (filters.cuisines && filters.cuisines.length > 0) {
            query.cuisines = { $in: filters.cuisines };
        }

        // Features filter
        if (filters.features && filters.features.length > 0) {
            query.features = { $all: filters.features };
        }

        // Category tags filter
        if (filters.categoryTags && filters.categoryTags.length > 0) {
            query.categoryTags = { $in: filters.categoryTags };
        }

        // Rating filter
        if (filters.ratingMin) {
            query.rating = { $gte: parseFloat(filters.ratingMin) };
        }

        // Budget filter
        if (filters.budgetMin || filters.budgetMax) {
            query.pricePerPlate = {};
            if (filters.budgetMin) query.pricePerPlate.$gte = parseFloat(filters.budgetMin);
            if (filters.budgetMax) query.pricePerPlate.$lte = parseFloat(filters.budgetMax);
        }

        // Exclude restaurants with no available spaces
        if (filters.excludeRestaurantIds && filters.excludeRestaurantIds.length > 0) {
            query._id = { $nin: filters.excludeRestaurantIds };
        }

        return await Restaurant.find(query)
            .select('_id restaurantName address.city rating pricePerPlate')
            .lean();
    }

    async updateById(id, updateData) {
        try {
            const restaurant = await Restaurant.findOneAndUpdate(
                { _id: id },
                updateData,
                { new: true }
            );
            return restaurant;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async deleteById(id) {
        try {
            const result = await Restaurant.deleteOne({ _id: id });
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

module.exports = RestaurantRepository;