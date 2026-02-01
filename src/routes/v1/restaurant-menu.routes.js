const express = require('express');
const router = express.Router();

const {
    RestaurantRoomRepository,
    RestaurantProfileRepository
} = require('../../repositories');

const { MenuManagementService } = require('../../services');
const { MenuManagementController } = require('../../controllers');

const { authenticate, authorize } = require('../../middleware/auth.middleware');

// Initialize dependencies
const restaurantRoomRepository = new RestaurantRoomRepository();
const restaurantProfileRepository = new RestaurantProfileRepository();

const menuManagementService = new MenuManagementService(
    restaurantRoomRepository,
    restaurantProfileRepository
);

const menuManagementController = new MenuManagementController(menuManagementService);

// All routes require authentication and restaurant role
router.use(authenticate);
router.use(authorize('Restaurant'));

// Get all menu files for the logged-in restaurant
router.get('/files', (req, res, next) => 
    menuManagementController.getAllMenus(req, res, next)
);

// Get menu stats for the logged-in restaurant
router.get('/stats', (req, res, next) => 
    menuManagementController.getMenuStats(req, res, next)
);

module.exports = router;

