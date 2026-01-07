const express = require('express');
const { SpaceController } = require('../../controllers');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication and restaurant role
router.use(authenticate);
router.use(authorize('Restaurant'));

// Get spaces for the logged-in restaurant
router.get('/my', SpaceController.getMySpaces);

// Get space by ID (must belong to the restaurant)
router.get('/:id', SpaceController.getSpaceById);

// Create space (restaurantId will be set from logged-in user)
router.post('/', SpaceController.createSpace);

// Update space (must belong to the restaurant)
router.put('/:id', SpaceController.updateSpace);

// Delete space (must belong to the restaurant)
router.delete('/:id', SpaceController.deleteSpace);

module.exports = router;

