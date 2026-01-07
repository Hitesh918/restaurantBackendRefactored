const { StatusCodes } = require('http-status-codes');
const InquiryService = require('../services/inquiry.service');
const InquiryRepository = require('../repositories/inquiry.repository');
const RestaurantRepository = require('../repositories/restaurant.repository');

const inquiryRepository = new InquiryRepository();
const restaurantRepository = new RestaurantRepository();
const inquiryService = new InquiryService(inquiryRepository, restaurantRepository);

/**
 * POST /restaurant/inquiries
 * Create a new inquiry (public endpoint, no auth required)
 */
async function createInquiry(req, res, next) {
    try {
        const result = await inquiryService.createInquiry(req.body);
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Inquiry created successfully',
            error: {},
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /restaurant/inquiries/my
 * Get all inquiries for the logged-in restaurant
 */
async function getMyInquiries(req, res, next) {
    try {
        // Get restaurant - try userId first (for new tokens), then try id as restaurant._id (for old tokens)
        let restaurant = null;
        if (req.user.userId) {
            restaurant = await restaurantRepository.findByUserId(req.user.userId);
        }
        
        // Fallback: if not found and we have id, try finding restaurant by _id (for backward compatibility)
        if (!restaurant && req.user.id) {
            restaurant = await restaurantRepository.findById(req.user.id);
        }
        
        if (!restaurant) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Restaurant not found for this user',
                error: {},
                data: null
            });
        }

        const filters = {
            status: req.query.status || 'all',
            priority: req.query.priority,
            search: req.query.search,
        };

        const inquiries = await inquiryService.getInquiriesByRestaurant(restaurant._id, filters);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Inquiries fetched successfully',
            error: {},
            data: inquiries
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /restaurant/inquiries/status-counts
 * Get status counts for the logged-in restaurant
 */
async function getStatusCounts(req, res, next) {
    try {
        // Get restaurant - try userId first (for new tokens), then try id as restaurant._id (for old tokens)
        let restaurant = null;
        if (req.user.userId) {
            restaurant = await restaurantRepository.findByUserId(req.user.userId);
        }
        
        // Fallback: if not found and we have id, try finding restaurant by _id (for backward compatibility)
        if (!restaurant && req.user.id) {
            restaurant = await restaurantRepository.findById(req.user.id);
        }
        
        if (!restaurant) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Restaurant not found for this user',
                error: {},
                data: null
            });
        }

        const counts = await inquiryService.getStatusCounts(restaurant._id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Status counts fetched successfully',
            error: {},
            data: counts
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /restaurant/inquiries/:id
 * Get single inquiry by ID
 */
async function getInquiryById(req, res, next) {
    try {
        const inquiry = await inquiryService.getInquiryById(req.params.id);
        
        // Verify ownership if user is restaurant
        if (req.user.role === 'Restaurant') {
            // Get restaurant - try userId first (for new tokens), then try id as restaurant._id (for old tokens)
            let restaurant = null;
            if (req.user.userId) {
                restaurant = await restaurantRepository.findByUserId(req.user.userId);
            }
            
            // Fallback: if not found and we have id, try finding restaurant by _id (for backward compatibility)
            if (!restaurant && req.user.id) {
                restaurant = await restaurantRepository.findById(req.user.id);
            }
            
            if (!restaurant || inquiry.restaurantId.toString() !== restaurant._id.toString()) {
                return res.status(StatusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'You do not have permission to view this inquiry',
                    error: {},
                    data: null
                });
            }
        }
        
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Inquiry fetched successfully',
            error: {},
            data: inquiry
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /restaurant/inquiries/:id/status
 * Update inquiry status (respond, archive, etc.)
 */
async function updateInquiryStatus(req, res, next) {
    try {
        const inquiry = await inquiryService.getInquiryById(req.params.id);
        
        // Verify ownership
        let restaurant = null;
        if (req.user.userId) {
            restaurant = await restaurantRepository.findByUserId(req.user.userId);
        }
        
        if (!restaurant && req.user.id) {
            restaurant = await restaurantRepository.findById(req.user.id);
        }
        
        if (!restaurant || inquiry.restaurantId.toString() !== restaurant._id.toString()) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'You do not have permission to update this inquiry',
                error: {},
                data: null
            });
        }

        const { status, responseMessage } = req.body;
        const updated = await inquiryService.updateInquiryStatus(
            req.params.id,
            status,
            responseMessage,
            req.user.id
        );
        
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Inquiry status updated successfully',
            error: {},
            data: updated
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /restaurant/inquiries/:id
 * Update inquiry details
 */
async function updateInquiry(req, res, next) {
    try {
        const inquiry = await inquiryService.getInquiryById(req.params.id);
        
        // Verify ownership
        let restaurant = null;
        if (req.user.userId) {
            restaurant = await restaurantRepository.findByUserId(req.user.userId);
        }
        
        if (!restaurant && req.user.id) {
            restaurant = await restaurantRepository.findById(req.user.id);
        }
        
        if (!restaurant || inquiry.restaurantId.toString() !== restaurant._id.toString()) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'You do not have permission to update this inquiry',
                error: {},
                data: null
            });
        }

        const updated = await inquiryService.updateInquiry(req.params.id, req.body);
        
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Inquiry updated successfully',
            error: {},
            data: updated
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /restaurant/inquiries/:id
 * Delete inquiry
 */
async function deleteInquiry(req, res, next) {
    try {
        const inquiry = await inquiryService.getInquiryById(req.params.id);
        
        // Verify ownership
        let restaurant = null;
        if (req.user.userId) {
            restaurant = await restaurantRepository.findByUserId(req.user.userId);
        }
        
        if (!restaurant && req.user.id) {
            restaurant = await restaurantRepository.findById(req.user.id);
        }
        
        if (!restaurant || inquiry.restaurantId.toString() !== restaurant._id.toString()) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'You do not have permission to delete this inquiry',
                error: {},
                data: null
            });
        }

        await inquiryService.deleteInquiry(req.params.id);
        
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Inquiry deleted successfully',
            error: {},
            data: null
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createInquiry,
    getMyInquiries,
    getStatusCounts,
    getInquiryById,
    updateInquiryStatus,
    updateInquiry,
    deleteInquiry,
};

