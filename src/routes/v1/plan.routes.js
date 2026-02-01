const express = require('express');
const { PlanController } = require('../../controllers');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const planRouter = express.Router();

// Public routes (no authentication required)
planRouter.get('/active', PlanController.getActivePlans);

// Authenticated routes
planRouter.use(authenticate);

// Admin-only routes
planRouter.post('/', authorize('Admin'), PlanController.addPlan);
planRouter.get('/', authorize('Admin'), PlanController.getPlans);
planRouter.get('/:id', authorize('Admin'), PlanController.getPlanById);
planRouter.put('/:id', authorize('Admin'), PlanController.updatePlan);
planRouter.patch('/:id/status', authorize('Admin'), PlanController.updatePlanStatus);
planRouter.delete('/:id', authorize('Admin'), PlanController.deletePlan);

// Restaurant Subscription APIs (Admin and Restaurant access)
planRouter.post('/subscribe/:restaurantId', authorize('Admin', 'Restaurant'), PlanController.subscribe);
planRouter.get('/subscription/:restaurantId', authorize('Admin', 'Restaurant'), PlanController.getSubscription);
planRouter.post('/subscription/:restaurantId/cancel', authorize('Admin', 'Restaurant'), PlanController.cancelSubscription);
planRouter.post('/subscription/:restaurantId/renew', authorize('Admin', 'Restaurant'), PlanController.renewSubscription);

module.exports = planRouter;
