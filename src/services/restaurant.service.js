const BaseError = require('../errors/base.error');
const { hashPassword } = require("../utils/bcrypt");

class RestaurantService {
    constructor(restaurantRepository, restaurantSpaceRepository, mediaRepository, userRepository, availabilityBlockRepository) {
        this.restaurantRepository = restaurantRepository;
        this.restaurantSpaceRepository = restaurantSpaceRepository;
        this.mediaRepository = mediaRepository;
        this.userRepository = userRepository;
        this.availabilityBlockRepository = availabilityBlockRepository;
    }

    async search(query) {
        const {
            location,
            eventDate,
            dateFrom,
            dateTo,
            startTime,
            endTime,
            guestCount,
            seatingTypes,
            cuisines,
            budgetMin,
            budgetMax,
            features,
            ratingMin,
            categoryTags
        } = query;

        // Step 1: Find spaces that match capacity and seating type
        const seatingTypesArray = seatingTypes ? seatingTypes.split(',') : null;
        
        // Get blocked space IDs for the date/time (with 30min buffer)
        let blockedSpaceIds = [];
        const searchDate = eventDate || dateFrom;
        if (searchDate && startTime && endTime) {
            blockedSpaceIds = await this.availabilityBlockRepository.getBlockedSpaceIds(
                new Date(searchDate),
                startTime,
                endTime,
                30 // buffer minutes
            );
        }

        // Find available spaces matching criteria
        const matchingSpaces = await this.restaurantSpaceRepository.searchByCapacityAndStyle(
            parseInt(guestCount),
            seatingTypesArray,
            blockedSpaceIds
        );

        // Get unique restaurant IDs from matching spaces
        const restaurantIdsWithCapacity = [...new Set(matchingSpaces.map(s => s.restaurantId.toString()))];

        if (restaurantIdsWithCapacity.length === 0) {
            return [];
        }

        // Step 2: Search restaurants with filters
        const cuisinesArray = cuisines ? cuisines.split(',') : null;
        const featuresArray = features ? features.split(',') : null;
        const categoryTagsArray = categoryTags ? categoryTags.split(',') : null;

        const restaurants = await this.restaurantRepository.search({
            location,
            cuisines: cuisinesArray,
            features: featuresArray,
            categoryTags: categoryTagsArray,
            ratingMin,
            budgetMin,
            budgetMax
        });

        // Filter to only restaurants that have matching spaces
        const filteredRestaurants = restaurants.filter(r => 
            restaurantIdsWithCapacity.includes(r._id.toString())
        );

        // Step 3: Get hero images and capacity ranges
        const restaurantIds = filteredRestaurants.map(r => r._id);
        const allSpaces = await this.restaurantSpaceRepository.findByRestaurantIds(restaurantIds);
        const heroImages = await this.mediaRepository.getHeroImagesByRestaurantIds(restaurantIds);

        // Build response
        const results = filteredRestaurants.map(restaurant => {
            const spaces = allSpaces.filter(s => s.restaurantId.toString() === restaurant._id.toString());
            const minCap = Math.min(...spaces.map(s => s.minCapacity));
            const maxCap = Math.max(...spaces.map(s => s.maxCapacity));

            return {
                restaurantId: restaurant._id,
                name: restaurant.restaurantName,
                city: restaurant.address?.city,
                heroImage: heroImages[restaurant._id.toString()] || null,
                capacityRange: { min: minCap, max: maxCap },
                rating: restaurant.rating,
                price: restaurant.pricePerPlate
            };
        });

        return results;
    }

    async createRestaurant(data) {
        // Check if email already exists
        const existingUser = await this.userRepository.findByEmail(data.businessEmail);
        if (existingUser) {
            throw new BaseError('Email already registered', 409);
        }

        // Create user account for restaurant
        const hashedPassword = await hashPassword(data.password);
        const user = await this.userRepository.createUser({
            email: data.businessEmail,
            password: hashedPassword,
            role: 'Restaurant',
            fullName: data.ownerName,
            phone: data.phone,
            companyName: data.restaurantName
        });

        // Create restaurant profile
        const restaurant = await this.restaurantRepository.createRestaurant({
            userId: user._id,
            restaurantName: data.restaurantName,
            ownerName: data.ownerName,
            businessEmail: data.businessEmail,
            phone: data.phone,
            address: {
                line1: data.addressLine1,
                area: data.area,
                city: data.city,
                state: data.state,
                country: data.country,
                zip: data.zip
            },
            geo: {
                lat: data.geoLat,
                lng: data.geoLng
            },
            cuisines: data.cuisines,
            features: data.features || [],
            openingHours: data.openingHours || {},
            listingStatus: data.listingStatus || 'draft'
        });

        // Create default space with capacity and seating types
        await this.restaurantSpaceRepository.create({
            restaurantId: restaurant._id,
            name: data.spaceName || 'Main Space',
            minCapacity: data.minCapacity,
            maxCapacity: data.maxCapacity,
            allowedEventStyles: data.seatingTypes || ['seated', 'standing'],
            features: data.spaceFeatures || []
        });

        // Create media entries for floorplan
        if (data.floorplanUrl) {
            await this.mediaRepository.create({
                ownerType: 'restaurant',
                ownerId: restaurant._id,
                mediaType: 'pdf',
                category: 'floorplan',
                url: data.floorplanUrl
            });
        }

        // Create media entries for photos with categories
        if (data.photos && data.photos.length > 0) {
            for (const photo of data.photos) {
                await this.mediaRepository.create({
                    ownerType: 'restaurant',
                    ownerId: restaurant._id,
                    mediaType: 'photo',
                    category: photo.category || 'hero',
                    url: photo.url
                });
            }
        }

        // Create media entries for menus
        if (data.menus && data.menus.length > 0) {
            for (const menu of data.menus) {
                await this.mediaRepository.create({
                    ownerType: 'restaurant',
                    ownerId: restaurant._id,
                    mediaType: 'pdf',
                    category: 'menu',
                    url: menu.url || menu
                });
            }
        }

        return {
            id: restaurant._id,
            listingStatus: restaurant.listingStatus
        };
    }

    async getProfile(restaurantId) {
        const restaurant = await this.restaurantRepository.findById(restaurantId);
        if (!restaurant) {
            throw new BaseError('Restaurant not found', 404);
        }

        const spaces = await this.restaurantSpaceRepository.findByRestaurantId(restaurantId);
        const media = await this.mediaRepository.findByOwnerGrouped('restaurant', restaurantId);

        return {
            _id: restaurant._id,
            userId: restaurant.userId,
            restaurantName: restaurant.restaurantName,
            ownerName: restaurant.ownerName,
            shortDescription: restaurant.shortDescription,
            businessEmail: restaurant.businessEmail,
            phone: restaurant.phone,
            address: restaurant.address,
            geo: restaurant.geo,
            cuisines: restaurant.cuisines,
            features: restaurant.features,
            openingHours: restaurant.openingHours,
            listingStatus: restaurant.listingStatus,
            createdAt: restaurant.createdAt,
            updatedAt: restaurant.updatedAt,
            venues: spaces,
            photos: media.photos,
            videos: media.videos,
            menus: media.menus,
            floorplans: media.floorplans
        };
    }

    async updateProfile(restaurantId, updateData) {
        const allowedFields = [
            'restaurantName', 'ownerName', 'shortDescription', 'businessEmail', 'phone',
            'address', 'geo', 'cuisines', 'features', 'openingHours', 'listingStatus'
        ];
        const filteredData = {};
        for (const key of allowedFields) {
            if (updateData[key] !== undefined) {
                filteredData[key] = updateData[key];
            }
        }

        const updated = await this.restaurantRepository.updateById(restaurantId, filteredData);
        if (!updated) {
            throw new BaseError('Restaurant not found', 404);
        }
        return updated;
    }

    async getAllRestaurants() {
        return await this.restaurantRepository.getAll();
    }

    async deleteRestaurant(id) {
        return await this.restaurantRepository.deleteById(id);
    }
}

module.exports = RestaurantService;
