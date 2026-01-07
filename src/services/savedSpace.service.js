const BaseError = require('../errors/base.error');

class SavedSpaceService {
    constructor(savedSpaceRepository, restaurantRepository) {
        this.savedSpaceRepository = savedSpaceRepository;
        this.restaurantRepository = restaurantRepository;
    }

    async saveSpace(customerId, restaurantId) {
        // Check if restaurant exists
        const restaurant = await this.restaurantRepository.findById(restaurantId);
        if (!restaurant) {
            throw new BaseError('Restaurant not found', 404);
        }

        // Check if already saved
        const existing = await this.savedSpaceRepository.findByCustomerAndRestaurant(customerId, restaurantId);
        if (existing) {
            throw new BaseError('Space already saved', 409);
        }

        return await this.savedSpaceRepository.create({
            customerId,
            restaurantId
        });
    }

    async unsaveSpace(customerId, restaurantId) {
        const deleted = await this.savedSpaceRepository.delete(customerId, restaurantId);
        if (!deleted) {
            throw new BaseError('Saved space not found', 404);
        }
        return { message: 'Space unsaved successfully' };
    }

    async getSavedSpaces(customerId) {
        return await this.savedSpaceRepository.findByCustomerId(customerId);
    }

    async isSpaceSaved(customerId, restaurantId) {
        const saved = await this.savedSpaceRepository.findByCustomerAndRestaurant(customerId, restaurantId);
        return !!saved;
    }
}

module.exports = SavedSpaceService;

