const { StatusCodes } = require('http-status-codes');
const CRMService = require('../services/crm.service');
const EventRepository = require('../repositories/event.repository');
const BookingRequestRepository = require('../repositories/bookingRequest.repository');
const ReviewRepository = require('../repositories/review.repository');
const CustomerRepository = require('../repositories/customer.repository');
const RestaurantRepository = require('../repositories/restaurant.repository');

const eventRepository = new EventRepository();
const bookingRequestRepository = new BookingRequestRepository();
const reviewRepository = new ReviewRepository();
const customerRepository = new CustomerRepository();
const restaurantRepository = new RestaurantRepository();
const crmService = new CRMService(
    eventRepository,
    bookingRequestRepository,
    reviewRepository,
    customerRepository,
    restaurantRepository
);

/**
 * GET /restaurant/crm/kpis
 * Get CRM KPIs for the logged-in restaurant
 */
async function getKPIs(req, res, next) {
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

        const kpis = await crmService.getKPIs(restaurant._id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'KPIs fetched successfully',
            error: {},
            data: kpis
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /restaurant/crm/events
 * Get events for the logged-in restaurant
 */
async function getEvents(req, res, next) {
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
            status: req.query.status,
            search: req.query.search,
        };

        const events = await crmService.getEvents(restaurant._id, filters);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Events fetched successfully',
            error: {},
            data: events
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /restaurant/crm/clients
 * Get clients for the logged-in restaurant
 */
async function getClients(req, res, next) {
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

        const clients = await crmService.getClients(restaurant._id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Clients fetched successfully',
            error: {},
            data: clients
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /restaurant/crm/feedback
 * Get feedback/reviews for the logged-in restaurant
 */
async function getFeedback(req, res, next) {
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

        const feedback = await crmService.getFeedback(restaurant._id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Feedback fetched successfully',
            error: {},
            data: feedback
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getKPIs,
    getEvents,
    getClients,
    getFeedback,
};

