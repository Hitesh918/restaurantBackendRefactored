const express = require('express');
const { GalleryController } = require('../../controllers');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication and restaurant role
router.use(authenticate);
router.use(authorize('Restaurant'));

// Get all gallery items for the logged-in restaurant
router.get('/my', GalleryController.getMyGalleryItems);

// Get single gallery item by ID
router.get('/:id', GalleryController.getGalleryItemById);

// Create gallery item
router.post('/', GalleryController.createGalleryItem);

// Update gallery item
router.put('/:id', GalleryController.updateGalleryItem);

// Delete gallery item
router.delete('/:id', GalleryController.deleteGalleryItem);

module.exports = router;

