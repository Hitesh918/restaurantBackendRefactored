const BaseError = require('../errors/base.error');

class PlanService {
    constructor(planRepository, subscriptionRepository) {
        this.planRepository = planRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    // Plan CRUD
    async createPlan(planData) {
        const existingPlan = await this.planRepository.getPlanByName(planData.name);
        if (existingPlan) {
            throw new BaseError('Plan with this name already exists', 409);
        }
        return await this.planRepository.createPlan(planData);
    }

    async getAllPlans() {
        return await this.planRepository.getAllPlans();
    }

    async getActivePlans() {
        return await this.planRepository.getActivePlans();
    }

    async getPlanById(id) {
        const plan = await this.planRepository.findById(id);
        if (!plan) {
            throw new BaseError('Plan not found', 404);
        }
        return plan;
    }

    async updatePlan(id, planData) {
        return await this.planRepository.updatePlan(id, planData);
    }

    async updatePlanStatus(id, status) {
        return await this.planRepository.updatePlanStatus(id, status);
    }

    async deletePlan(id) {
        return await this.planRepository.deletePlan(id);
    }

    // Subscription methods
    async subscribe(restaurantId, planId, assignedByAdminId = null) {
        const plan = await this.planRepository.findById(planId);
        if (!plan) {
            throw new BaseError('Plan not found', 404);
        }

        if (plan.status !== 'active') {
            throw new BaseError('Plan is not active', 400);
        }

        // Check if restaurant already has an active subscription
        const existingSubscription = await this.subscriptionRepository.findActiveByRestaurantId(restaurantId);
        if (existingSubscription) {
            throw new BaseError('Restaurant already has an active subscription', 400);
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.durationInDays);

        const subscription = await this.subscriptionRepository.updateByRestaurantId(restaurantId, {
            restaurantId,
            planId,
            assignedByAdminId,
            status: 'active',
            startDate,
            endDate
        });

        return {
            subscriptionId: subscription._id,
            planName: plan.name,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate
        };
    }

    async getSubscription(restaurantId) {
        const subscription = await this.subscriptionRepository.findByRestaurantId(restaurantId);
        if (!subscription) {
            return null;
        }

        // Check if subscription has expired
        if (subscription.status === 'active' && new Date() > subscription.endDate) {
            await this.subscriptionRepository.update(subscription._id, { status: 'expired' });
            subscription.status = 'expired';
        }

        return subscription;
    }

    async cancelSubscription(restaurantId) {
        const subscription = await this.subscriptionRepository.findByRestaurantId(restaurantId);
        if (!subscription) {
            throw new BaseError('No subscription found', 404);
        }

        return await this.subscriptionRepository.cancel(restaurantId);
    }

    async renewSubscription(restaurantId, planId = null) {
        const currentSubscription = await this.subscriptionRepository.findByRestaurantId(restaurantId);
        
        const targetPlanId = planId || currentSubscription?.planId;
        if (!targetPlanId) {
            throw new BaseError('Plan ID required for new subscription', 400);
        }

        const plan = await this.planRepository.findById(targetPlanId);
        if (!plan || plan.status !== 'active') {
            throw new BaseError('Plan not found or inactive', 404);
        }

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.durationInDays);

        const subscription = await this.subscriptionRepository.updateByRestaurantId(restaurantId, {
            restaurantId,
            planId: targetPlanId,
            status: 'active',
            startDate,
            endDate
        });

        return {
            subscriptionId: subscription._id,
            planName: plan.name,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate
        };
    }
}

module.exports = PlanService;
