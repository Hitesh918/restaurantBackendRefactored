const express = require('express');
const { RestaurantController } = require('../../controllers');
const AvailabilityController = require('../../controllers/availability.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// Public routes
// Search restaurants
router.get('/search', RestaurantController.search);
// Get restaurant public profile (no auth required)
router.get('/:id/public', RestaurantController.getPublicProfile);

// Admin routes (require authentication and admin role)
// Must be before /:id routes to avoid route conflicts
router.get('/', authenticate, authorize('Admin'), RestaurantController.getAllRestaurants);
router.delete('/:id', authenticate, authorize('Admin'), RestaurantController.deleteRestaurant);

// Create new restaurant listing (requires authentication)
router.post('/', authenticate, RestaurantController.createRestaurant);

// Profile routes (requires authentication)
router.get('/:id/profile', authenticate, RestaurantController.getProfile);
router.put('/:id/profile', authenticate, RestaurantController.updateProfile);

// Reviews route (public - anyone can view reviews)
router.get('/:id/reviews', RestaurantController.getReviews);

// Availability APIs (requires authentication)
router.get('/:restaurantId/availability', authenticate, AvailabilityController.checkAvailability);
router.get('/:restaurantId/availability/blocks', authenticate, AvailabilityController.getBlocks);
router.post('/:restaurantId/availability/blocks', authenticate, AvailabilityController.createBlock);
router.delete('/:restaurantId/availability/blocks/:blockId', authenticate, AvailabilityController.deleteBlock);

module.exports = router;
