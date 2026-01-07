const express = require('express');
const { InquiryController } = require('../../controllers');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication and restaurant role
router.use(authenticate);
router.use(authorize('Restaurant'));

// Get all inquiries for the logged-in restaurant
router.get('/my', InquiryController.getMyInquiries);

// Get status counts
router.get('/status-counts', InquiryController.getStatusCounts);

// Get single inquiry by ID
router.get('/:id', InquiryController.getInquiryById);

// Update inquiry status
router.put('/:id/status', InquiryController.updateInquiryStatus);

// Update inquiry
router.put('/:id', InquiryController.updateInquiry);

// Delete inquiry
router.delete('/:id', InquiryController.deleteInquiry);

module.exports = router;

