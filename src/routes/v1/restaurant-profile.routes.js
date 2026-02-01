const express = require('express');
const router = express.Router();

const {
    RestaurantProfileRepository,
    MediaRepository,
    UserRepository,
    RestaurantRoomRepository
} = require('../../repositories');

const { RestaurantProfileService } = require('../../services');
const { RestaurantProfileController } = require('../../controllers');

const { authenticate, authorize } = require('../../middleware/auth.middleware');

// Initialize dependencies
const restaurantProfileRepository = new RestaurantProfileRepository();
const mediaRepository = new MediaRepository();
const userRepository = new UserRepository();
const restaurantRoomRepository = new RestaurantRoomRepository();

const restaurantProfileService = new RestaurantProfileService(
    restaurantProfileRepository,
    mediaRepository,
    userRepository,
    restaurantRoomRepository
);

const restaurantProfileController = new RestaurantProfileController(restaurantProfileService);

// Public routes
router.get('/search', (req, res, next) => restaurantProfileController.searchProfiles(req, res, next));
router.get('/public', (req, res, next) => restaurantProfileController.getAllPublicProfiles(req, res, next));
router.get('/featured', (req, res, next) => restaurantProfileController.getFeaturedProfiles(req, res, next));
router.get('/:id/public', (req, res, next) => restaurantProfileController.getPublicProfile(req, res, next));
router.get('/:id', (req, res, next) => restaurantProfileController.getProfile(req, res, next));

// Admin routes
router.get('/', authenticate, authorize('Admin'), (req, res, next) => 
    restaurantProfileController.getAllProfiles(req, res, next)
);
router.post('/', authenticate, authorize('Admin'), (req, res, next) => 
    restaurantProfileController.createProfile(req, res, next)
);
router.put('/:id', authenticate, authorize('Admin'), (req, res, next) => 
    restaurantProfileController.updateProfile(req, res, next)
);
router.delete('/:id', authenticate, authorize('Admin'), (req, res, next) => 
    restaurantProfileController.deleteProfile(req, res, next)
);

// Restaurant owner routes
router.get('/my/profile', authenticate, authorize('Restaurant'), (req, res, next) => 
    restaurantProfileController.getMyProfile(req, res, next)
);
router.post('/my/profile', authenticate, authorize('Restaurant'), (req, res, next) => 
    restaurantProfileController.createMyProfile(req, res, next)
);
router.put('/my/profile', authenticate, authorize('Restaurant'), (req, res, next) => 
    restaurantProfileController.updateMyProfile(req, res, next)
);

module.exports = router;