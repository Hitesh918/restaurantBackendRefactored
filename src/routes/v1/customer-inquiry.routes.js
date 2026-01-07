const express = require('express');
const InquiryController = require('../../controllers/inquiry.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const router = express.Router();

/**
 * GET /customers/:customerId/inquiries
 * Get all inquiries made by a customer
 */
router.get('/:customerId/inquiries', authenticate, async (req, res, next) => {
    try {
        const { customerId } = req.params;
        
        // Verify the customerId matches the authenticated user
        if (req.user.role !== 'Customer' || req.user.id !== customerId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to access these inquiries',
                error: {},
                data: null
            });
        }

        const InquiryRepository = require('../../repositories/inquiry.repository');
        const CustomerRepository = require('../../repositories/customer.repository');
        const inquiryRepository = new InquiryRepository();
        const customerRepository = new CustomerRepository();
        
        // Get the customer to find the userId and email
        const customer = await customerRepository.findById(customerId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found',
                error: {},
                data: null
            });
        }

        // Get inquiries where customerId (User reference) matches the customer's userId
        // Also get inquiries by email as fallback (for inquiries created before login)
        const [inquiriesByUserId, inquiriesByEmail] = await Promise.all([
            inquiryRepository.findByCustomerId(customer.userId),
            inquiryRepository.findByCustomerEmail(customer.email)
        ]);

        // Combine and deduplicate inquiries
        const inquiryMap = new Map();
        [...inquiriesByUserId, ...inquiriesByEmail].forEach(inquiry => {
            inquiryMap.set(inquiry._id.toString(), inquiry);
        });
        const inquiries = Array.from(inquiryMap.values());
        
        return res.status(200).json({
            success: true,
            message: 'Inquiries fetched successfully',
            error: {},
            data: inquiries
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

