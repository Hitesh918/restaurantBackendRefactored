const express = require('express');
const { PlanController } = require('../../controllers');

const planRouter = express.Router();

// Plan CRUD (Admin)
planRouter.post('/', PlanController.addPlan);
planRouter.get('/', PlanController.getPlans);
planRouter.get('/active', PlanController.getActivePlans);
planRouter.get('/:id', PlanController.getPlanById);
planRouter.put('/:id', PlanController.updatePlan);
planRouter.patch('/:id/status', PlanController.updatePlanStatus);
planRouter.delete('/:id', PlanController.deletePlan);

// Restaurant Subscription APIs
planRouter.post('/subscribe/:restaurantId', PlanController.subscribe);
planRouter.get('/subscription/:restaurantId', PlanController.getSubscription);
planRouter.post('/subscription/:restaurantId/cancel', PlanController.cancelSubscription);
planRouter.post('/subscription/:restaurantId/renew', PlanController.renewSubscription);

module.exports = planRouter;
