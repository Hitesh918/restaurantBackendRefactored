const BaseError = require('../errors/base.error');

class SpaceService {
    constructor(spaceRepository, restaurantRepository, mediaRepository) {
        this.spaceRepository = spaceRepository;
        this.restaurantRepository = restaurantRepository;
        this.mediaRepository = mediaRepository;
    }

    async getAllSpaces() {
        const spaces = await this.spaceRepository.findAll();

        if (spaces.length === 0) {
            return [];
        }

        // Get restaurant info and hero images for each space
        const restaurantIds = [...new Set(spaces.map(s => s.restaurantId.toString()))];
        const restaurants = await Promise.all(
            restaurantIds.map(id => this.restaurantRepository.findById(id))
        );
        const restaurantMap = {};
        restaurants.forEach(r => {
            if (r) {
                const rObj = r.toObject ? r.toObject() : r;
                restaurantMap[rObj._id.toString()] = rObj;
            }
        });

        // Get hero images
        const heroImages = await this.mediaRepository.getHeroImagesByRestaurantIds(restaurantIds);

        // Combine space data with restaurant info
        return spaces.map(space => {
            const spaceObj = space.toObject ? space.toObject() : space;
            const restaurant = restaurantMap[spaceObj.restaurantId.toString()];
            return {
                _id: spaceObj._id,
                name: spaceObj.name,
                restaurantId: spaceObj.restaurantId,
                restaurantName: restaurant?.restaurantName || 'Unknown',
                minCapacity: spaceObj.minCapacity,
                maxCapacity: spaceObj.maxCapacity,
                allowedEventStyles: spaceObj.allowedEventStyles,
                features: spaceObj.features || [],
                heroImageUrl: heroImages[spaceObj.restaurantId.toString()] || null,
                status: 'Publish', // Default status - can be enhanced later
                createdAt: spaceObj.createdAt,
                updatedAt: spaceObj.updatedAt
            };
        });
    }

    async getSpaceById(id) {
        const space = await this.spaceRepository.findById(id);
        if (!space) {
            throw new BaseError('Space not found', 404);
        }

        const restaurant = await this.restaurantRepository.findById(space.restaurantId);
        const media = await this.mediaRepository.findByOwnerGrouped('restaurant', space.restaurantId);

        return {
            _id: space._id,
            name: space.name,
            restaurantId: space.restaurantId,
            restaurantName: restaurant?.restaurantName || 'Unknown',
            minCapacity: space.minCapacity,
            maxCapacity: space.maxCapacity,
            allowedEventStyles: space.allowedEventStyles,
            features: space.features || [],
            heroImageUrl: media.photos.find(p => p.category === 'hero')?.url || null,
            status: 'Publish',
            createdAt: space.createdAt,
            updatedAt: space.updatedAt
        };
    }

    async createSpace(spaceData) {
        // Validate required fields
        if (!spaceData.name || !spaceData.restaurantId) {
            throw new BaseError('Space name and restaurantId are required', 400);
        }

        // Validate restaurant exists
        const restaurant = await this.restaurantRepository.findById(spaceData.restaurantId);
        if (!restaurant) {
            throw new BaseError('Restaurant not found', 404);
        }

        // Set defaults
        const space = {
            restaurantId: spaceData.restaurantId,
            name: spaceData.name.trim(),
            minCapacity: spaceData.minCapacity || 1,
            maxCapacity: spaceData.maxCapacity || 50,
            allowedEventStyles: spaceData.allowedEventStyles || ['seated', 'standing'],
            features: spaceData.features || [],
            pricing: spaceData.pricing || {},
            contracts: spaceData.contracts || []
        };

        return await this.spaceRepository.create(space);
    }

    async updateSpace(id, spaceData) {
        // Check if space exists
        const existingSpace = await this.spaceRepository.findById(id);
        if (!existingSpace) {
            throw new BaseError('Space not found', 404);
        }

        const updateData = {};

        if (spaceData.name) {
            updateData.name = spaceData.name.trim();
        }

        if (spaceData.minCapacity !== undefined) {
            updateData.minCapacity = spaceData.minCapacity;
        }

        if (spaceData.maxCapacity !== undefined) {
            updateData.maxCapacity = spaceData.maxCapacity;
        }

        if (spaceData.allowedEventStyles) {
            updateData.allowedEventStyles = spaceData.allowedEventStyles;
        }

        if (spaceData.features !== undefined) {
            updateData.features = spaceData.features;
        }

        if (spaceData.pricing !== undefined) {
            updateData.pricing = spaceData.pricing;
        }

        if (spaceData.contracts !== undefined) {
            updateData.contracts = spaceData.contracts;
        }

        return await this.spaceRepository.update(id, updateData);
    }

    async deleteSpace(id) {
        const space = await this.spaceRepository.findById(id);
        if (!space) {
            throw new BaseError('Space not found', 404);
        }

        return await this.spaceRepository.delete(id);
    }

    async getSpacesByRestaurantId(restaurantId) {
        const spaces = await this.spaceRepository.findByRestaurantId(restaurantId);
        
        if (spaces.length === 0) {
            return [];
        }

        // Get restaurant info and hero images
        const restaurant = await this.restaurantRepository.findById(restaurantId);
        const heroImages = await this.mediaRepository.getHeroImagesByRestaurantIds([restaurantId.toString()]);

        return spaces.map(space => {
            const spaceObj = space.toObject ? space.toObject() : space;
            return {
                _id: spaceObj._id,
                name: spaceObj.name,
                restaurantId: spaceObj.restaurantId,
                restaurantName: restaurant?.restaurantName || 'Unknown',
                minCapacity: spaceObj.minCapacity,
                maxCapacity: spaceObj.maxCapacity,
                allowedEventStyles: spaceObj.allowedEventStyles,
                features: spaceObj.features || [],
                heroImageUrl: heroImages[restaurantId.toString()] || null,
                status: 'Publish', // Default status
                createdAt: spaceObj.createdAt,
                updatedAt: spaceObj.updatedAt
            };
        });
    }
}

module.exports = SpaceService;

