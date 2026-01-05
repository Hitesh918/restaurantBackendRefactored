const express = require('express');
const {CustomerController} = require('../../controllers');

const customerRouter = express.Router();

// Profile routes - :id is customerId from login
customerRouter.get('/:id/profile', CustomerController.getProfile);
customerRouter.put('/:id/profile', CustomerController.updateProfile);

// Admin routes
customerRouter.get('/', CustomerController.getAllCustomers);
customerRouter.delete('/:id', CustomerController.deleteCustomer);

module.exports = customerRouter;
