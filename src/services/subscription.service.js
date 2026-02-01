const BaseError = require('../errors/base.error');
const { Subscription } = require('../models');

class SubscriptionService {
    constructor(subscriptionRepository, restaurantProfileRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.restaurantProfileRepository = restaurantProfileRepository;
    }

    async createTrialSubscription(restaurantProfileId, restaurantType = {}) {
        // Use findOneAndUpdate with upsert to handle race conditions
        const subscription = await Subscription.findOneAndUpdate(
            { restaurantProfileId },
            {
                $setOnInsert: {
                    restaurantProfileId,
                    planType: 'trial',
                    status: 'trial',
                    restaurantType: {
                        privateDiningRooms: restaurantType.privateDiningRooms || false,
                        wholeBuyoutAvailable: restaurantType.wholeBuyoutAvailable || false
                    },
                    trialStartDate: new Date(),
                    trialEndDate: (() => {
                        const date = new Date();
                        date.setMonth(date.getMonth() + 6);
                        return date;
                    })(),
                    monthlyPrice: 99,
                    annualPrice: 999,
                    trialMetrics: {
                        inquiriesReceived: 0,
                        conversions: 0,
                        conversionRate: 0
                    },
                    pdrAdvisor: {
                        consultationStatus: 'not_requested',
                        assigned: false
                    },
                    billingHistory: []
                }
            },
            { 
                new: true, 
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

        return subscription;
    }

    async getSubscriptionByProfileId(restaurantProfileId) {
        const subscription = await Subscription.findOne({ restaurantProfileId })
            .populate('pdrAdvisor.advisorId', 'name email')
            .populate('restaurantProfileId', 'profileName restaurantName');
            
        if (!subscription) {
            throw new BaseError('Subscription not found', 404);
        }

        return subscription;
    }

    async getSubscriptionById(subscriptionId) {
        const subscription = await Subscription.findById(subscriptionId)
            .populate('pdrAdvisor.advisorId', 'name email')
            .populate('restaurantProfileId', 'profileName restaurantName contactEmail contactPhone privateDiningRooms wholeBuyoutAvailable');
            
        if (!subscription) {
            throw new BaseError('Subscription not found', 404);
        }

        // Calculate days remaining
        const subscriptionObj = subscription.toObject();
        
        if (subscriptionObj.status === 'trial') {
            const now = new Date();
            const trialEnd = new Date(subscriptionObj.trialEndDate);
            subscriptionObj.trialDaysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
        }
        
        if (subscriptionObj.subscriptionEndDate) {
            const now = new Date();
            const subEnd = new Date(subscriptionObj.subscriptionEndDate);
            subscriptionObj.subscriptionDaysRemaining = Math.ceil((subEnd - now) / (1000 * 60 * 60 * 24));
        }

        return subscriptionObj;
    }

    async getAllSubscriptions(filters = {}) {
        const query = {};
        
        if (filters.status) query.status = filters.status;
        if (filters.planType) query.planType = filters.planType;
        if (filters.trialExpiring) {
            // Find trials expiring in next 30 days
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            query.status = 'trial';
            query.trialEndDate = { $lte: thirtyDaysFromNow };
        }

        const subscriptions = await Subscription.find(query)
            .populate('restaurantProfileId', 'profileName restaurantName contactEmail contactPhone privateDiningRooms wholeBuyoutAvailable')
            .populate('pdrAdvisor.advisorId', 'name email')
            .sort({ createdAt: -1 });

        // Calculate days remaining for each subscription
        return subscriptions.map(sub => {
            const subscription = sub.toObject();
            
            if (subscription.status === 'trial') {
                const now = new Date();
                const trialEnd = new Date(subscription.trialEndDate);
                subscription.trialDaysRemaining = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
            }
            
            if (subscription.subscriptionEndDate) {
                const now = new Date();
                const subEnd = new Date(subscription.subscriptionEndDate);
                subscription.subscriptionDaysRemaining = Math.ceil((subEnd - now) / (1000 * 60 * 60 * 24));
            }
            
            return subscription;
        });
    }

    async updateSubscription(subscriptionId, updateData) {
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            throw new BaseError('Subscription not found', 404);
        }

        // Handle plan upgrade/downgrade
        if (updateData.planType && updateData.planType !== subscription.planType) {
            if (updateData.planType === 'monthly' || updateData.planType === 'annual') {
                subscription.status = 'active';
                subscription.subscriptionStartDate = new Date();
                
                // Set end date based on plan
                const endDate = new Date();
                if (updateData.planType === 'monthly') {
                    endDate.setMonth(endDate.getMonth() + 1);
                } else {
                    endDate.setFullYear(endDate.getFullYear() + 1);
                }
                subscription.subscriptionEndDate = endDate;
            }
        }

        Object.assign(subscription, updateData);
        return await subscription.save();
    }

    async assignPDRAdvisor(subscriptionId, advisorId) {
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            throw new BaseError('Subscription not found', 404);
        }

        subscription.pdrAdvisor.assigned = true;
        subscription.pdrAdvisor.advisorId = advisorId;
        subscription.pdrAdvisor.consultationStatus = 'scheduled';

        return await subscription.save();
    }

    async assignPDRAdvisorById(subscriptionId, advisorId) {
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            throw new BaseError('Subscription not found', 404);
        }

        subscription.pdrAdvisor.assigned = true;
        subscription.pdrAdvisor.advisorId = advisorId;
        subscription.pdrAdvisor.consultationStatus = 'scheduled';

        return await subscription.save();
    }

    async updateSubscriptionById(subscriptionId, updateData) {
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            throw new BaseError('Subscription not found', 404);
        }

        // Handle plan upgrade/downgrade
        if (updateData.planType && updateData.planType !== subscription.planType) {
            if (updateData.planType === 'monthly' || updateData.planType === 'annual') {
                subscription.status = 'active';
                subscription.subscriptionStartDate = new Date();
                
                // Set end date based on plan
                const endDate = new Date();
                if (updateData.planType === 'monthly') {
                    endDate.setMonth(endDate.getMonth() + 1);
                } else {
                    endDate.setFullYear(endDate.getFullYear() + 1);
                }
                subscription.subscriptionEndDate = endDate;
            }
        }

        Object.assign(subscription, updateData);
        return await subscription.save();
    }

    async updateTrialMetrics(restaurantProfileId, type, data = {}) {
        const subscription = await Subscription.findOne({ restaurantProfileId });
        if (!subscription) {
            throw new BaseError('Subscription not found', 404);
        }

        return await subscription.updateTrialMetrics(type, data);
    }

    async getTrialAnalytics() {
        const analytics = await Subscription.aggregate([
            {
                $match: { status: 'trial' }
            },
            {
                $group: {
                    _id: null,
                    totalTrials: { $sum: 1 },
                    totalInquiries: { $sum: '$trialMetrics.inquiriesReceived' },
                    totalConversions: { $sum: '$trialMetrics.conversions' },
                    avgConversionRate: { $avg: '$trialMetrics.conversionRate' },
                    trialsExpiringSoon: {
                        $sum: {
                            $cond: [
                                {
                                    $lte: [
                                        '$trialEndDate',
                                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        return analytics[0] || {
            totalTrials: 0,
            totalInquiries: 0,
            totalConversions: 0,
            avgConversionRate: 0,
            trialsExpiringSoon: 0
        };
    }

    async getSubscriptionAnalytics() {
        const analytics = await Subscription.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    revenue: {
                        $sum: {
                            $cond: [
                                { $eq: ['$planType', 'monthly'] },
                                '$monthlyPrice',
                                '$annualPrice'
                            ]
                        }
                    }
                }
            }
        ]);

        const planAnalytics = await Subscription.aggregate([
            {
                $group: {
                    _id: '$planType',
                    count: { $sum: 1 }
                }
            }
        ]);

        return {
            byStatus: analytics,
            byPlan: planAnalytics
        };
    }

    async addCommunicationLog(subscriptionId, type, subject, message, adminUserId) {
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            throw new BaseError('Subscription not found', 404);
        }

        return await subscription.addCommunication(type, subject, message, adminUserId);
    }

    async processPayment(subscriptionId, paymentData) {
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            throw new BaseError('Subscription not found', 404);
        }

        // Add to billing history
        subscription.billingHistory.push({
            amount: paymentData.amount,
            planType: subscription.planType,
            status: paymentData.status || 'paid',
            invoiceNumber: paymentData.invoiceNumber,
            paymentMethod: paymentData.paymentMethod
        });

        subscription.lastPaymentDate = new Date();
        
        // Set next payment date
        const nextPayment = new Date();
        if (subscription.planType === 'monthly') {
            nextPayment.setMonth(nextPayment.getMonth() + 1);
        } else if (subscription.planType === 'annual') {
            nextPayment.setFullYear(nextPayment.getFullYear() + 1);
        }
        subscription.nextPaymentDate = nextPayment;

        return await subscription.save();
    }

    // Helper method to get or create subscription
    async getOrCreateSubscription(restaurantId) {
        const restaurantProfile = await this.restaurantProfileRepository.findByUserId(restaurantId);
        if (!restaurantProfile) {
            throw new BaseError('Restaurant profile not found. Please create your restaurant profile first.', 404);
        }

        let subscription = await Subscription.findOne({ restaurantProfileId: restaurantProfile._id });
        
        if (!subscription) {
            subscription = await this.createTrialSubscription(restaurantProfile._id, {
                privateDiningRooms: restaurantProfile.privateDiningRooms || false,
                wholeBuyoutAvailable: restaurantProfile.wholeBuyoutAvailable || false
            });
        }

        return { subscription, restaurantProfile };
    }

    // Restaurant-specific methods
    async getRestaurantSubscription(restaurantId) {
        const { subscription } = await this.getOrCreateSubscription(restaurantId);
        
        // Populate the advisor field if it exists
        if (subscription.pdrAdvisor?.advisorId) {
            return await subscription.populate('pdrAdvisor.advisorId', 'name email');
        }
        
        return subscription;
    }

    async updateSubscriptionPlan(restaurantId, planData) {
        const { subscription } = await this.getOrCreateSubscription(restaurantId);

        // Handle plan upgrade/downgrade
        if (planData.planType && planData.planType !== subscription.planType) {
            if (planData.planType === 'monthly' || planData.planType === 'annual') {
                subscription.status = 'active';
                subscription.subscriptionStartDate = new Date();
                
                // Set end date based on plan
                const endDate = new Date();
                if (planData.planType === 'monthly') {
                    endDate.setMonth(endDate.getMonth() + 1);
                } else {
                    endDate.setFullYear(endDate.getFullYear() + 1);
                }
                subscription.subscriptionEndDate = endDate;
            }
        }

        Object.assign(subscription, planData);
        return await subscription.save();
    }

    async requestPDRConsultation(restaurantId, consultationData) {
        const { subscription } = await this.getOrCreateSubscription(restaurantId);

        subscription.pdrAdvisor.consultationStatus = 'requested';
        subscription.pdrAdvisor.consultationNotes = consultationData.notes || '';

        return await subscription.save();
    }

    async getSubscriptionMetrics(restaurantId) {
        const { subscription } = await this.getOrCreateSubscription(restaurantId);

        return {
            trialMetrics: subscription.trialMetrics,
            status: subscription.status,
            planType: subscription.planType,
            trialEndDate: subscription.trialEndDate,
            subscriptionEndDate: subscription.subscriptionEndDate,
            daysRemaining: subscription.status === 'trial' 
                ? Math.ceil((subscription.trialEndDate - new Date()) / (1000 * 60 * 60 * 24))
                : null
        };
    }

    async updatePaymentMethod(restaurantId, paymentMethodData) {
        const { subscription } = await this.getOrCreateSubscription(restaurantId);

        subscription.paymentMethod = paymentMethodData;
        return await subscription.save();
    }

    async getBillingHistory(restaurantId) {
        const { subscription } = await this.getOrCreateSubscription(restaurantId);

        return subscription.billingHistory.sort((a, b) => b.date - a.date);
    }
}

module.exports = SubscriptionService;