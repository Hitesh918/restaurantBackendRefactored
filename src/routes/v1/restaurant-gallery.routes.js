const express = require('express');
const router = express.Router();

const {
    RestaurantRoomRepository,
    RestaurantProfileRepository
} = require('../../repositories');

const { GalleryService } = require('../../services');
const { GalleryController } = require('../../controllers');

const { authenticate, authorize } = require('../../middleware/auth.middleware');

// Initialize dependencies
const restaurantRoomRepository = new RestaurantRoomRepository();
const restaurantProfileRepository = new RestaurantProfileRepository();

const galleryService = new GalleryService(
    restaurantRoomRepository,
    restaurantProfileRepository
);

const galleryController = new GalleryController(galleryService);

// All routes require authentication and restaurant role
router.use(authenticate);
router.use(authorize('Restaurant'));

// Get all photos for the logged-in restaurant
router.get('/photos', (req, res, next) => 
    galleryController.getAllPhotos(req, res, next)
);

// Get gallery stats for the logged-in restaurant
router.get('/stats', (req, res, next) => 
    galleryController.getGalleryStats(req, res, next)
);

module.exports = router;

