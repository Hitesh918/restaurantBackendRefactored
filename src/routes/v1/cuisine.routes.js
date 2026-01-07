const express = require('express');
const { CuisineController } = require('../../controllers');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// Public routes (no authentication required)
// Get all cuisines
router.get('/', CuisineController.getAllCuisines);

// Get cuisine by ID
router.get('/:id', CuisineController.getCuisineById);

// Protected routes (require authentication and admin role)
// Create cuisine
router.post('/', authenticate, authorize('Admin'), CuisineController.createCuisine);

// Update cuisine
router.put('/:id', authenticate, authorize('Admin'), CuisineController.updateCuisine);

// Delete cuisine
router.delete('/:id', authenticate, authorize('Admin'), CuisineController.deleteCuisine);

module.exports = router;

