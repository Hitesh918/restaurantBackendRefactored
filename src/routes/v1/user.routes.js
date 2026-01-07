const express = require('express');
const { UserController } = require('../../controllers');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('Admin'));

// Get restaurant users (with subscription details)
router.get('/restaurants', UserController.getRestaurantUsers);

// Get all users
router.get('/', UserController.getAllUsers);

// Get user by ID
router.get('/:id', UserController.getUserById);

// Update user
router.put('/:id', UserController.updateUser);

// Delete user
router.delete('/:id', UserController.deleteUser);

module.exports = router;

