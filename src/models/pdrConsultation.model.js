const mongoose = require('mongoose');

const pdrConsultationSchema = new mongoose.Schema({
  // Event Information
  eventType: {
    type: String,
    required: true,
    enum: ['corporate', 'birthday', 'anniversary', 'wedding', 'business', 'other']
  },
  guestCount: {
    type: Number,
    required: true,
    min: 1
  },
  preferredDate: {
    type: Date,
    required: true
  },
  budgetRange: {
    type: String,
    required: true,
    enum: ['under-5k', '5k-10k', '10k-25k', '25k-50k', 'over-50k']
  },
  specialRequirements: {
    type: String,
    maxlength: 1000
  },
  
  // Contact Information
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  
  // Optional customer reference
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: false
  },
  
  // Status and Assignment
  status: {
    type: String,
    enum: ['pending', 'contacted', 'scheduled', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedSpecialistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming specialists are users with a specific role
    required: false
  },
  assignedSpecialistName: {
    type: String,
    required: false
  },
  
  // Timestamps for status changes
  contactedAt: {
    type: Date,
    required: false
  },
  scheduledAt: {
    type: Date,
    required: false
  },
  completedAt: {
    type: Date,
    required: false
  },
  
  // Notes from specialist
  notes: {
    type: String,
    maxlength: 2000
  },
  
  // Internal tracking
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  source: {
    type: String,
    default: 'website'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
pdrConsultationSchema.index({ email: 1 });
pdrConsultationSchema.index({ customerId: 1 });
pdrConsultationSchema.index({ status: 1 });
pdrConsultationSchema.index({ assignedSpecialistId: 1 });
pdrConsultationSchema.index({ preferredDate: 1 });
pdrConsultationSchema.index({ createdAt: -1 });

const PDRConsultation = mongoose.model('PDRConsultation', pdrConsultationSchema);

module.exports = PDRConsultation;