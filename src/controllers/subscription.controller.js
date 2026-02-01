const { StatusCodes } = require('http-status-codes');
const BaseError = require('../errors/base.error');
const { SubscriptionService } = require('../services');
const { RestaurantProfileRepository, SubscriptionRepository } = require('../repositories');

const subscriptionService = new SubscriptionService(SubscriptionRepository, RestaurantProfileRepository);

const getRestaurantSubscription = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.getRestaurantSubscription(req.user.id);
    res.status(StatusCodes.OK).json({
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
    const subscription = await subscriptionService.updateSubscriptionPlan(req.user.id, req.body);
    res.status(StatusCodes.OK).json({
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
    const consultation = await subscriptionService.requestPDRConsultation(req.user.id, req.body);
    res.status(StatusCodes.CREATED).json({
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
    const metrics = await subscriptionService.getSubscriptionMetrics(req.user.id);
    res.status(StatusCodes.OK).json({
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
    const paymentMethod = await subscriptionService.updatePaymentMethod(req.user.id, req.body);
    res.status(StatusCodes.OK).json({
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
    const billingHistory = await subscriptionService.getBillingHistory(req.user.id);
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Billing history retrieved successfully',
      data: billingHistory
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRestaurantSubscription,
  updateSubscriptionPlan,
  requestPDRConsultation,
  getSubscriptionMetrics,
  updatePaymentMethod,
  getBillingHistory,
};