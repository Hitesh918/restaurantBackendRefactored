const RestaurantProfile = require('../models/restaurantProfile.model');

class RestaurantProfileRepository {
    async create(profileData) {
        const profile = new RestaurantProfile(profileData);
        return await profile.save();
    }

    async findById(id) {
        return await RestaurantProfile.findById(id);
    }

    async findByUserId(userId) {
        return await RestaurantProfile.findOne({ userId });
    }

    async updateById(id, updateData) {
        return await RestaurantProfile.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
    }

    async deleteById(id) {
        return await RestaurantProfile.findByIdAndDelete(id);
    }

    async getAll() {
        return await RestaurantProfile.find({}).sort({ createdAt: -1 });
    }

    async search(filters) {
        const query = {};
        
        if (filters.location) {
            query['address.city'] = new RegExp(filters.location, 'i');
        }
        
        if (filters.cuisine) {
            query.cuisine = new RegExp(filters.cuisine, 'i');
        }
        
        if (filters.profileStatus) {
            query.profileStatus = filters.profileStatus;
        }
        
        if (filters.searchText) {
            query.$text = { $search: filters.searchText };
        }
        
        return await RestaurantProfile.find(query).sort({ createdAt: -1 });
    }

    async updateProfileStatus(id, status) {
        return await RestaurantProfile.findByIdAndUpdate(
            id,
            { profileStatus: status },
            { new: true }
        );
    }

    async findPublicProfiles() {
        return await RestaurantProfile.find({ 
            profileStatus: 'active',
            subscriptionStatus: 'paid'
        }).sort({ createdAt: -1 });
    }

    async findPublicById(id) {
        return await RestaurantProfile.findOne({ 
            _id: id,
            profileStatus: 'active',
            subscriptionStatus: 'paid'
        });
    }

    async findFeaturedProfiles(limit = 6) {
        return await RestaurantProfile.find({ 
            profileStatus: 'active',
            subscriptionStatus: 'paid',
            rating: { $gte: 4.0 }
        })
        .sort({ rating: -1, reviewCount: -1 })
        .limit(limit);
    }
}

module.exports = RestaurantProfileRepository;