const express = require('express');
const { SubscriptionService } = require('../../services');
const { RestaurantProfileRepository, SubscriptionRepository } = require('../../repositories');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// Initialize dependencies
const restaurantProfileRepository = new RestaurantProfileRepository();
const subscriptionRepository = new SubscriptionRepository();

const subscriptionService = new SubscriptionService(subscriptionRepository, restaurantProfileRepository);

// Controller functions
const getRestaurantSubscription = async (req, res, next) => {
  try {
    // Use userId if available, fallback to id
    const userId = req.user.userId || req.user.id;
    const subscription = await subscriptionService.getRestaurantSubscription(userId);
    res.status(200).json({
      success: true,
      message: 'Subscription retrieved successfully',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

const updateSubscriptionPlan = async (req, res, next) => {
  try {
    // Use userId if available, fallback to id
    const userId = req.user.userId || req.user.id;
    const subscription = await subscriptionService.updateSubscriptionPlan(userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

const requestPDRConsultation = async (req, res, next) => {
  try {
    // Use userId if available, fallback to id
    const userId = req.user.userId || req.user.id;
    const consultation = await subscriptionService.requestPDRConsultation(userId, req.body);
    res.status(201).json({
      success: true,
      message: 'PDR consultation requested successfully',
      data: consultation
    });
  } catch (error) {
    next(error);
  }
};

const getSubscriptionMetrics = async (req, res, next) => {
  try {
    // Use userId if available, fallback to id
    const userId = req.user.userId || req.user.id;
    const metrics = await subscriptionService.getSubscriptionMetrics(userId);
    res.status(200).json({
      success: true,
      message: 'Subscription metrics retrieved successfully',
      data: metrics
    });
  } catch (error) {
    next(error);
  }
};

const updatePaymentMethod = async (req, res, next) => {
  try {
    // Use userId if available, fallback to id
    const userId = req.user.userId || req.user.id;
    const paymentMethod = await subscriptionService.updatePaymentMethod(userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Payment method updated successfully',
      data: paymentMethod
    });
  } catch (error) {
    next(error);
  }
};

const getBillingHistory = async (req, res, next) => {
  try {
    // Use userId if available, fallback to id
    const userId = req.user.userId || req.user.id;
    const billingHistory = await subscriptionService.getBillingHistory(userId);
    res.status(200).json({
      success: true,
      message: 'Billing history retrieved successfully',
      data: billingHistory
    });
  } catch (error) {
    next(error);
  }
};

// Routes
router.get('/status', authenticate, authorize('restaurant'), getRestaurantSubscription);
router.put('/plan', authenticate, authorize('restaurant'), updateSubscriptionPlan);
router.post('/pdr-consultation', authenticate, authorize('restaurant'), requestPDRConsultation);
router.get('/metrics', authenticate, authorize('restaurant'), getSubscriptionMetrics);
router.put('/payment-method', authenticate, authorize('restaurant'), updatePaymentMethod);
router.get('/billing-history', authenticate, authorize('restaurant'), getBillingHistory);

module.exports = router;