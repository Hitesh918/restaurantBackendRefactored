const BaseError = require('../errors/base.error');
const { hashPassword } = require("../utils/bcrypt");

class RestaurantService {
    constructor(restaurantRepository, restaurantSpaceRepository, mediaRepository, userRepository, availabilityBlockRepository, reviewRepository) {
        this.restaurantRepository = restaurantRepository;
        this.restaurantSpaceRepository = restaurantSpaceRepository;
        this.mediaRepository = mediaRepository;
        this.userRepository = userRepository;
        this.availabilityBlockRepository = availabilityBlockRepository;
        this.reviewRepository = reviewRepository;
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

        // Step 1: Find spaces that match capacity and seating type (if guestCount is provided)
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

        // Filter by capacity and/or seating types
        let restaurantIdsWithCapacity = [];
        const guestCountNum = guestCount ? parseInt(guestCount) : null;
        const hasSeatingTypesFilter = seatingTypesArray && seatingTypesArray.length > 0;
        const hasGuestCountFilter = guestCountNum && !isNaN(guestCountNum) && guestCountNum > 0;
        
        // If we have seating types filter OR guest count, we need to filter spaces
        if (hasSeatingTypesFilter || hasGuestCountFilter) {
            // Find available spaces matching criteria
            const matchingSpaces = await this.restaurantSpaceRepository.searchByCapacityAndStyle(
                guestCountNum,
                seatingTypesArray,
                blockedSpaceIds
            );

            // Get unique restaurant IDs from matching spaces
            restaurantIdsWithCapacity = [...new Set(matchingSpaces.map(s => s.restaurantId.toString()))];

            // If no spaces match the criteria, return empty
            if (restaurantIdsWithCapacity.length === 0) {
                return [];
            }
        } else if (blockedSpaceIds.length > 0) {
            // If no guestCount and no seating types but we have blocked spaces, get all available spaces
            const allSpaces = await this.restaurantSpaceRepository.findAll();
            const blockedSpaceIdsSet = new Set(blockedSpaceIds.map(id => id.toString()));
            const availableSpaces = allSpaces.filter(s => !blockedSpaceIdsSet.has(s._id.toString()));
            restaurantIdsWithCapacity = [...new Set(availableSpaces.map(s => s.restaurantId.toString()))];
        }
        // If no guestCount, no seating types, and no blocked spaces, restaurantIdsWithCapacity stays empty (show all restaurants)

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

        // Filter to only restaurants that have matching spaces (if capacity filtering was applied)
        let filteredRestaurants = restaurants;
        if (restaurantIdsWithCapacity.length > 0) {
            // If we filtered by capacity or blocked spaces, only show matching restaurants
            filteredRestaurants = restaurants.filter(r => 
                restaurantIdsWithCapacity.includes(r._id.toString())
            );
        }
        // If no capacity filtering, show all restaurants that match other filters

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
            shortDescription: data.shortDescription,
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
            listingStatus: data.listingStatus || 'draft',
            rating: data.rating ? parseFloat(data.rating) : 0,
            pricePerPlate: data.pricePerPlate ? parseFloat(data.pricePerPlate) : undefined,
            certificateCode: data.certificateCode,
            showRadius: data.showRadius ? parseFloat(data.showRadius) : undefined,
            popularDishes: data.popularDishes,
            monThuOffer: data.monThuOffer,
            monThuOfferDescription: data.monThuOfferDescription,
            friSunOffer: data.friSunOffer,
            friSunOfferDescription: data.friSunOfferDescription,
            tableBookingEnabled: data.tableBookingEnabled !== undefined ? data.tableBookingEnabled : true
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
            rating: restaurant.rating,
            pricePerPlate: restaurant.pricePerPlate,
            certificateCode: restaurant.certificateCode,
            showRadius: restaurant.showRadius,
            popularDishes: restaurant.popularDishes,
            monThuOffer: restaurant.monThuOffer,
            monThuOfferDescription: restaurant.monThuOfferDescription,
            friSunOffer: restaurant.friSunOffer,
            friSunOfferDescription: restaurant.friSunOfferDescription,
            tableBookingEnabled: restaurant.tableBookingEnabled,
            createdAt: restaurant.createdAt,
            updatedAt: restaurant.updatedAt,
            spaces: spaces, // Include spaces for frontend compatibility
            venues: spaces, // Legacy field name
            photos: media.photos,
            videos: media.videos,
            menus: media.menus,
            floorplans: media.floorplans
        };
    }

    async updateProfile(restaurantId, updateData) {
        const allowedFields = [
            'restaurantName', 'ownerName', 'shortDescription', 'businessEmail', 'phone',
            'address', 'geo', 'cuisines', 'features', 'openingHours', 'listingStatus',
            'rating', 'pricePerPlate', 'certificateCode', 'showRadius', 'popularDishes',
            'monThuOffer', 'monThuOfferDescription', 'friSunOffer', 'friSunOfferDescription',
            'tableBookingEnabled'
        ];
        const filteredData = {};
        for (const key of allowedFields) {
            if (updateData[key] !== undefined) {
                filteredData[key] = updateData[key];
            }
        }

        // Handle password update if provided
        if (updateData.password) {
            console.log('[updateProfile] Password update requested for restaurantId:', restaurantId);
            const restaurant = await this.restaurantRepository.findById(restaurantId);
            if (!restaurant) {
                throw new BaseError('Restaurant not found', 404);
            }
            console.log('[updateProfile] Found restaurant, userId:', restaurant.userId);
            const hashedPassword = await hashPassword(updateData.password);
            console.log('[updateProfile] Password hashed successfully');
            await this.userRepository.updateUser(restaurant.userId, { password: hashedPassword });
            console.log('[updateProfile] User password updated successfully');
        }

        const updated = await this.restaurantRepository.updateById(restaurantId, filteredData);
        if (!updated) {
            throw new BaseError('Restaurant not found', 404);
        }
        return updated;
    }

    async getAllRestaurants() {
        const restaurants = await this.restaurantRepository.getAll();
        
        // Get hero images for all restaurants
        const restaurantIds = restaurants.map(r => r._id);
        const heroImages = await this.mediaRepository.getHeroImagesByRestaurantIds(restaurantIds);
        
        // Attach hero image URLs to restaurants
        return restaurants.map(restaurant => {
            const restaurantObj = restaurant.toObject ? restaurant.toObject() : restaurant;
            restaurantObj.heroImageUrl = heroImages[restaurant._id.toString()] || null;
            return restaurantObj;
        });
    }

    async deleteRestaurant(id) {
        return await this.restaurantRepository.deleteById(id);
    }

    async getReviews(restaurantId) {
        const restaurant = await this.restaurantRepository.findById(restaurantId);
        if (!restaurant) {
            throw new BaseError('Restaurant not found', 404);
        }

        const reviews = await this.reviewRepository.findByRestaurantId(restaurantId);
        return reviews;
    }
}

module.exports = RestaurantService;
