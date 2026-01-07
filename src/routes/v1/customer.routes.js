const express = require('express');
const {CustomerController} = require('../../controllers');
const SavedSpaceController = require('../../controllers/savedSpace.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const customerRouter = express.Router();

// Profile routes - :id is customerId from login
customerRouter.get('/:id/profile', CustomerController.getProfile);
customerRouter.put('/:id/profile', CustomerController.updateProfile);

// Saved Spaces routes - requires authentication
customerRouter.post('/:id/saved-spaces', authenticate, SavedSpaceController.saveSpace);
customerRouter.delete('/:id/saved-spaces/:restaurantId', authenticate, SavedSpaceController.unsaveSpace);
customerRouter.get('/:id/saved-spaces', authenticate, SavedSpaceController.getSavedSpaces);
customerRouter.get('/:id/saved-spaces/check/:restaurantId', authenticate, SavedSpaceController.checkIfSaved);

// Admin routes
customerRouter.get('/', CustomerController.getAllCustomers);
customerRouter.delete('/:id', CustomerController.deleteCustomer);

module.exports = customerRouter;
