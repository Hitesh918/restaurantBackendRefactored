const {RestaurantService} = require('../services');
const {RestaurantRepository, RestaurantSpaceRepository, MediaRepository, UserRepository, AvailabilityBlockRepository, ReviewRepository} = require('../repositories');
const { StatusCodes } = require('http-status-codes');

const restaurantService = new RestaurantService(
    new RestaurantRepository(),
    new RestaurantSpaceRepository(),
    new MediaRepository(),
    new UserRepository(),
    new AvailabilityBlockRepository(),
    new ReviewRepository()
);

async function search(req, res, next) {
    try {
        const results = await restaurantService.search(req.query);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully fetched search results',
            error: {},
            data: { results }
        });
    } catch(error) {
        next(error);
    }
}

async function createRestaurant(req, res, next) {
    try {
        const result = await restaurantService.createRestaurant(req.body);
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Successfully created restaurant listing',
            error: {},
            data: result
        });
    } catch(error) {
        next(error);
    }
}

async function getProfile(req, res, next) {
    try {
        const profile = await restaurantService.getProfile(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully fetched restaurant profile',
            error: {},
            data: profile
        });
    } catch(error) {
        next(error);
    }
}

async function getPublicProfile(req, res, next) {
    try {
        const profile = await restaurantService.getProfile(req.params.id);
        // Only return active restaurants for public view
        if (profile.listingStatus !== 'active') {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Restaurant not found',
                error: {},
                data: null
            });
        }
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully fetched restaurant profile',
            error: {},
            data: profile
        });
    } catch(error) {
        next(error);
    }
}

async function updateProfile(req, res, next) {
    try {
        const updated = await restaurantService.updateProfile(req.params.id, req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully updated restaurant profile',
            error: {},
            data: updated
        });
    } catch(error) {
        next(error);
    }
}

async function getAllRestaurants(req, res, next) {
    try {
        const restaurants = await restaurantService.getAllRestaurants();
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully fetched all restaurants',
            error: {},
            data: restaurants
        });
    } catch(error) {
        next(error);
    }
}

async function deleteRestaurant(req, res, next) {
    try {
        const deleted = await restaurantService.deleteRestaurant(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully deleted restaurant',
            error: {},
            data: deleted
        });
    } catch(error) {
        next(error);
    }
}

async function getReviews(req, res, next) {
    try {
        const reviews = await restaurantService.getReviews(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully fetched restaurant reviews',
            error: {},
            data: reviews
        });
    } catch(error) {
        next(error);
    }
}

module.exports = {
    search,
    createRestaurant,
    getProfile,
    getPublicProfile,
    updateProfile,
    getAllRestaurants,
    deleteRestaurant,
    getReviews
};
