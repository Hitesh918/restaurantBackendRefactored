const express = require('express');
const { RestaurantController } = require('../../controllers');
const AvailabilityController = require('../../controllers/availability.controller');

const router = express.Router();

// Search restaurants
router.get('/search', RestaurantController.search);

// Create new restaurant listing
router.post('/', RestaurantController.createRestaurant);

// Profile routes
router.get('/:id/profile', RestaurantController.getProfile);
router.put('/:id/profile', RestaurantController.updateProfile);

// Availability APIs
router.get('/:restaurantId/availability', AvailabilityController.checkAvailability);
router.get('/:restaurantId/availability/blocks', AvailabilityController.getBlocks);
router.post('/:restaurantId/availability/blocks', AvailabilityController.createBlock);
router.delete('/:restaurantId/availability/blocks/:blockId', AvailabilityController.deleteBlock);

// Admin routes
router.get('/', RestaurantController.getAllRestaurants);
router.delete('/:id', RestaurantController.deleteRestaurant);

module.exports = router;
