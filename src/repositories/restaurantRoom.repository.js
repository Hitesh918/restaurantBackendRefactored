const RestaurantRoom = require('../models/restaurantRoom.model');

class RestaurantRoomRepository {
    async create(roomData) {
        const room = new RestaurantRoom(roomData);
        return await room.save();
    }

    async findById(id) {
        return await RestaurantRoom.findById(id).populate('restaurantProfileId');
    }

    async findByProfileId(profileId) {
        return await RestaurantRoom.find({ 
            restaurantProfileId: profileId, 
            isActive: true 
        }).sort({ createdAt: -1 });
    }

    async updateById(id, updateData) {
        return await RestaurantRoom.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
    }

    async deleteById(id) {
        // Soft delete by setting isActive to false
        return await RestaurantRoom.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );
    }

    async hardDeleteById(id) {
        return await RestaurantRoom.findByIdAndDelete(id);
    }

    async getAll() {
        return await RestaurantRoom.find({ isActive: true })
            .populate('restaurantProfileId')
            .sort({ createdAt: -1 });
    }

    async search(filters) {
        const query = { isActive: true };
        
        if (filters.profileId) {
            query.restaurantProfileId = filters.profileId;
        }
        
        if (filters.roomType) {
            query.roomType = filters.roomType;
        }
        
        if (filters.minSeatedCapacity || filters.maxSeatedCapacity) {
            query['capacity.seated.max'] = {};
            if (filters.minSeatedCapacity) {
                query['capacity.seated.max'].$gte = parseInt(filters.minSeatedCapacity);
            }
            if (filters.maxSeatedCapacity) {
                query['capacity.seated.min'].$lte = parseInt(filters.maxSeatedCapacity);
            }
        }
        
        if (filters.minStandingCapacity || filters.maxStandingCapacity) {
            query['capacity.standing.max'] = {};
            if (filters.minStandingCapacity) {
                query['capacity.standing.max'].$gte = parseInt(filters.minStandingCapacity);
            }
            if (filters.maxStandingCapacity) {
                query['capacity.standing.min'].$lte = parseInt(filters.maxStandingCapacity);
            }
        }
        
        // Feature filters
        if (filters.features) {
            const featureArray = Array.isArray(filters.features) ? filters.features : filters.features.split(',');
            featureArray.forEach(feature => {
                if (feature.trim()) {
                    query[`features.${feature.trim()}`] = true;
                }
            });
        }
        
        if (filters.searchText) {
            query.$text = { $search: filters.searchText };
        }
        
        return await RestaurantRoom.find(query)
            .populate('restaurantProfileId')
            .sort({ createdAt: -1 });
    }

    async findByIds(ids) {
        return await RestaurantRoom.find({ 
            _id: { $in: ids }, 
            isActive: true 
        }).populate('restaurantProfileId');
    }

    async countByProfileId(profileId) {
        return await RestaurantRoom.countDocuments({ 
            restaurantProfileId: profileId, 
            isActive: true 
        });
    }
}

module.exports = RestaurantRoomRepository;