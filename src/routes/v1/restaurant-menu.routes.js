const express = require('express');
const { MenuController } = require('../../controllers');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication and restaurant role
router.use(authenticate);
router.use(authorize('Restaurant'));

// Get menu for the logged-in restaurant
router.get('/my', MenuController.getMyMenu);

// Upload menu PDF
router.post('/upload', MenuController.uploadMenu);

// Delete menu
router.delete('/my', MenuController.deleteMenu);

module.exports = router;

