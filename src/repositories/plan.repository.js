const { Plan } = require('../models');
const BaseError = require('../errors/base.error');

class PlanRepository {
    async createPlan(planData) {
        const plan = new Plan(planData);
        return await plan.save();
    }

    async findById(id) {
        return await Plan.findById(id);
    }

    async getAllPlans() {
        return await Plan.find({});
    }

    async getActivePlans() {
        return await Plan.find({ status: 'active' });
    }

    async getPlanByName(name) {
        return await Plan.findOne({ name });
    }

    async updatePlan(id, planData) {
        const plan = await Plan.findByIdAndUpdate(id, planData, { new: true });
        if (!plan) {
            throw new BaseError('Plan not found', 404);
        }
        return plan;
    }

    async updatePlanStatus(id, status) {
        const plan = await Plan.findByIdAndUpdate(id, { status }, { new: true });
        if (!plan) {
            throw new BaseError('Plan not found', 404);
        }
        return plan;
    }

    async deletePlan(id) {
        const plan = await Plan.findByIdAndDelete(id);
        if (!plan) {
            throw new BaseError('Plan not found', 404);
        }
        return plan;
    }
}

module.exports = PlanRepository;
