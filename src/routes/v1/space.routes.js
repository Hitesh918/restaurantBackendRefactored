const express = require('express');
const { SpaceController } = require('../../controllers');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// Public routes (no authentication required)
// Get all spaces
router.get('/', SpaceController.getAllSpaces);

// Get space by ID
router.get('/:id', SpaceController.getSpaceById);

// Protected routes (require authentication and admin role)
// Create space
router.post('/', authenticate, authorize('Admin'), SpaceController.createSpace);

// Update space
router.put('/:id', authenticate, authorize('Admin'), SpaceController.updateSpace);

// Delete space
router.delete('/:id', authenticate, authorize('Admin'), SpaceController.deleteSpace);

module.exports = router;

