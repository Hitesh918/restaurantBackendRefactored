const { PlanService } = require('../services');
const { PlanRepository, SubscriptionRepository } = require('../repositories');
const { StatusCodes } = require('http-status-codes');

const planService = new PlanService(new PlanRepository(), new SubscriptionRepository());

// Plan CRUD
async function addPlan(req, res, next) {
    try {
        const newPlan = await planService.createPlan(req.body);
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Successfully created a new plan',
            error: {},
            data: newPlan
        });
    } catch(error) {
        next(error);
    }
}

async function getPlans(req, res, next) {
    try {
        const plans = await planService.getAllPlans();
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully fetched all plans',
            error: {},
            data: plans
        });
    } catch(error) {
        next(error);
    }
}

async function getActivePlans(req, res, next) {
    try {
        const plans = await planService.getActivePlans();
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully fetched active plans',
            error: {},
            data: plans
        });
    } catch(error) {
        next(error);
    }
}

async function getPlanById(req, res, next) {
    try {
        const plan = await planService.getPlanById(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully fetched plan',
            error: {},
            data: plan
        });
    } catch(error) {
        next(error);
    }
}

async function updatePlan(req, res, next) {
    try {
        const updatedPlan = await planService.updatePlan(req.params.id, req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully updated the plan',
            error: {},
            data: updatedPlan
        });
    } catch(error) {
        next(error);
    }
}

async function updatePlanStatus(req, res, next) {
    try {
        const updatedPlan = await planService.updatePlanStatus(req.params.id, req.body.status);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully updated the plan status',
            error: {},
            data: updatedPlan
        });
    } catch(error) {
        next(error);
    }
}

async function deletePlan(req, res, next) {
    try {
        await planService.deletePlan(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully deleted the plan',
            error: {},
            data: null
        });
    } catch(error) {
        next(error);
    }
}

// Subscription APIs
async function subscribe(req, res, next) {
    try {
        const { restaurantId } = req.params;
        const { planId, assignedByAdminId } = req.body;
        const subscription = await planService.subscribe(restaurantId, planId, assignedByAdminId);
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Successfully subscribed to plan',
            error: {},
            data: subscription
        });
    } catch(error) {
        next(error);
    }
}

async function getSubscription(req, res, next) {
    try {
        const { restaurantId } = req.params;
        const subscription = await planService.getSubscription(restaurantId);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: subscription ? 'Subscription found' : 'No active subscription',
            error: {},
            data: subscription
        });
    } catch(error) {
        next(error);
    }
}

async function cancelSubscription(req, res, next) {
    try {
        const { restaurantId } = req.params;
        const subscription = await planService.cancelSubscription(restaurantId);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully cancelled subscription',
            error: {},
            data: subscription
        });
    } catch(error) {
        next(error);
    }
}

async function renewSubscription(req, res, next) {
    try {
        const { restaurantId } = req.params;
        const { planId } = req.body;
        const subscription = await planService.renewSubscription(restaurantId, planId);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully renewed subscription',
            error: {},
            data: subscription
        });
    } catch(error) {
        next(error);
    }
}

module.exports = {
    addPlan,
    getPlans,
    getActivePlans,
    getPlanById,
    updatePlan,
    updatePlanStatus,
    deletePlan,
    subscribe,
    getSubscription,
    cancelSubscription,
    renewSubscription
};
