const { SavedSpace } = require('../models');

class SavedSpaceRepository {
    async create(data) {
        const savedSpace = new SavedSpace(data);
        return await savedSpace.save();
    }

    async findByCustomerId(customerId) {
        return await SavedSpace.find({ customerId })
            .populate('restaurantId', 'restaurantName address geo rating pricePerPlate cuisines')
            .sort({ createdAt: -1 })
            .lean();
    }

    async findByCustomerAndRestaurant(customerId, restaurantId) {
        return await SavedSpace.findOne({ customerId, restaurantId }).lean();
    }

    async delete(customerId, restaurantId) {
        return await SavedSpace.findOneAndDelete({ customerId, restaurantId });
    }

    async deleteById(id) {
        return await SavedSpace.findByIdAndDelete(id);
    }

    async countByCustomerId(customerId) {
        return await SavedSpace.countDocuments({ customerId });
    }
}

module.exports = SavedSpaceRepository;

