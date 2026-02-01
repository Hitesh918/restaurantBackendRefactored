const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    restaurantProfileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RestaurantProfile",
        required: true,
        unique: true
    },
    
    // Subscription Details
    planType: {
        type: String,
        enum: ['trial', 'monthly', 'annual'],
        required: true
    },
    
    status: {
        type: String,
        enum: ['active', 'trial', 'expired', 'cancelled', 'suspended'],
        default: 'trial'
    },
    
    // Trial Information
    trialStartDate: {
        type: Date,
        default: Date.now
    },
    
    trialEndDate: {
        type: Date,
        default: function() {
            // 6 months from now
            const date = new Date();
            date.setMonth(date.getMonth() + 6);
            return date;
        }
    },
    
    // Subscription Dates
    subscriptionStartDate: {
        type: Date
    },
    
    subscriptionEndDate: {
        type: Date
    },
    
    // Pricing
    monthlyPrice: {
        type: Number,
        default: 99
    },
    
    annualPrice: {
        type: Number,
        default: 999
    },
    
    // Restaurant Attributes
    restaurantType: {
        privateDiningRooms: {
            type: Boolean,
            default: false
        },
        wholeBuyoutAvailable: {
            type: Boolean,
            default: false
        }
    },
    
    // Trial Tracking
    trialMetrics: {
        inquiriesReceived: {
            type: Number,
            default: 0
        },
        conversions: {
            type: Number,
            default: 0
        },
        conversionRate: {
            type: Number,
            default: 0
        },
        lastInquiryDate: {
            type: Date
        },
        lastConversionDate: {
            type: Date
        }
    },
    
    // PDR Advisor/Consultation
    pdrAdvisor: {
        assigned: {
            type: Boolean,
            default: false
        },
        advisorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" // Admin user who is the advisor
        },
        consultationStatus: {
            type: String,
            enum: ['not_requested', 'requested', 'scheduled', 'completed'],
            default: 'not_requested'
        },
        consultationDate: {
            type: Date
        },
        consultationNotes: {
            type: String
        },
        setupCompleted: {
            type: Boolean,
            default: false
        }
    },
    
    // Payment Information
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'bank_transfer', 'invoice'],
    },
    
    lastPaymentDate: {
        type: Date
    },
    
    nextPaymentDate: {
        type: Date
    },
    
    // Billing
    billingHistory: [{
        date: { type: Date, default: Date.now },
        amount: { type: Number, required: true },
        planType: { type: String, required: true },
        status: { 
            type: String, 
            enum: ['paid', 'pending', 'failed', 'refunded'],
            default: 'pending'
        },
        invoiceNumber: { type: String },
        paymentMethod: { type: String }
    }],
    
    // Notes and Communication
    adminNotes: {
        type: String
    },
    
    communicationLog: [{
        date: { type: Date, default: Date.now },
        type: { 
            type: String, 
            enum: ['email', 'call', 'meeting', 'system'],
            required: true
        },
        subject: { type: String },
        message: { type: String },
        adminUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }]
    
}, { timestamps: true });

// Indexes for performance
subscriptionSchema.index({ restaurantProfileId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ planType: 1 });
subscriptionSchema.index({ trialEndDate: 1 });
subscriptionSchema.index({ subscriptionEndDate: 1 });

// Virtual for trial days remaining
subscriptionSchema.virtual('trialDaysRemaining').get(function() {
    if (this.status !== 'trial') return 0;
    const now = new Date();
    const diffTime = this.trialEndDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
});

// Virtual for subscription days remaining
subscriptionSchema.virtual('subscriptionDaysRemaining').get(function() {
    if (!this.subscriptionEndDate) return 0;
    const now = new Date();
    const diffTime = this.subscriptionEndDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
});

// Method to update trial metrics
subscriptionSchema.methods.updateTrialMetrics = function(type, data = {}) {
    if (type === 'inquiry') {
        this.trialMetrics.inquiriesReceived += 1;
        this.trialMetrics.lastInquiryDate = new Date();
    } else if (type === 'conversion') {
        this.trialMetrics.conversions += 1;
        this.trialMetrics.lastConversionDate = new Date();
    }
    
    // Calculate conversion rate
    if (this.trialMetrics.inquiriesReceived > 0) {
        this.trialMetrics.conversionRate = (this.trialMetrics.conversions / this.trialMetrics.inquiriesReceived) * 100;
    }
    
    return this.save();
};

// Method to add communication log
subscriptionSchema.methods.addCommunication = function(type, subject, message, adminUserId) {
    this.communicationLog.push({
        type,
        subject,
        message,
        adminUserId
    });
    return this.save();
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;