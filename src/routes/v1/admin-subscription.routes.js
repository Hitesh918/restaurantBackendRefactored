const express = require('express');
const { SubscriptionService } = require('../../services');
const { RestaurantProfileRepository, SubscriptionRepository } = require('../../repositories');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// Initialize dependencies
const restaurantProfileRepository = new RestaurantProfileRepository();
const subscriptionRepository = new SubscriptionRepository();

const subscriptionService = new SubscriptionService(subscriptionRepository, restaurantProfileRepository);

// Get all subscriptions (admin view)
const getAllSubscriptions = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      planType: req.query.planType,
      trialExpiring: req.query.trialExpiring === 'true'
    };
    
    const subscriptions = await subscriptionService.getAllSubscriptions(filters);
    res.status(200).json({
      success: true,
      message: 'Subscriptions retrieved successfully',
      data: subscriptions
    });
  } catch (error) {
    next(error);
  }
};

// Get subscription analytics
const getSubscriptionAnalytics = async (req, res, next) => {
  try {
    const [trialAnalytics, subscriptionAnalytics] = await Promise.all([
      subscriptionService.getTrialAnalytics(),
      subscriptionService.getSubscriptionAnalytics()
    ]);
    
    const analytics = {
      ...trialAnalytics,
      ...subscriptionAnalytics
    };
    
    res.status(200).json({
      success: true,
      message: 'Analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

// Get single subscription by ID
const getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getSubscriptionById(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Subscription retrieved successfully',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// Assign PDR advisor
const assignPDRAdvisor = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.assignPDRAdvisorById(req.params.id, req.body.advisorId);
    res.status(200).json({
      success: true,
      message: 'PDR advisor assigned successfully',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// Update subscription status
const updateSubscriptionStatus = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.updateSubscriptionById(req.params.id, { status: req.body.status });
    res.status(200).json({
      success: true,
      message: 'Subscription status updated successfully',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// Add communication log
const addCommunicationLog = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.addCommunicationLog(
      req.params.id,
      req.body.type,
      req.body.subject,
      req.body.message,
      req.user.id
    );
    res.status(200).json({
      success: true,
      message: 'Communication log added successfully',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// Process payment
const processPayment = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.processPayment(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.get('/', authenticate, authorize('admin'), getAllSubscriptions);
router.get('/analytics', authenticate, authorize('admin'), getSubscriptionAnalytics);
router.get('/:id', authenticate, authorize('admin'), getSubscriptionById);
router.post('/:id/assign-advisor', authenticate, authorize('admin'), assignPDRAdvisor);
router.patch('/:id/status', authenticate, authorize('admin'), updateSubscriptionStatus);
router.post('/:id/communication', authenticate, authorize('admin'), addCommunicationLog);
router.post('/:id/payment', authenticate, authorize('admin'), processPayment);

module.exports = router;