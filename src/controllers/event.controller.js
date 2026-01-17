const { EventService } = require('../services');
const { EventRepository, ReviewRepository, BookingRequestRepository } = require('../repositories');
const { StatusCodes } = require('http-status-codes');

const eventService = new EventService(
    new EventRepository(),
    new ReviewRepository(),
    new BookingRequestRepository()
);

/**
 * GET /events
 * Get all events (admin)
 */
async function getAllEvents(req, res, next) {
    try {
        const events = await eventService.getAllEvents();
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
 * GET /events/restaurant/:restaurantId
 * Get events by restaurant
 */
async function getEventsByRestaurant(req, res, next) {
    try {
        const { restaurantId } = req.params;
        const events = await eventService.getEventsByRestaurant(restaurantId);
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
 * GET /events/customer/:customerId
 * Get events by customer
 */
async function getEventsByCustomer(req, res, next) {
    try {
        const { customerId } = req.params;
        const events = await eventService.getEventsByCustomer(customerId);
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
 * GET /events/:eventId
 */
async function getEvent(req, res, next) {
    try {
        const { eventId } = req.params;
        const event = await eventService.getEventById(eventId);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Event fetched successfully',
            error: {},
            data: event
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /events/:eventId/specs
 * Update event specifications
 */
async function updateSpecs(req, res, next) {
    try {
        const { eventId } = req.params;
        const result = await eventService.updateSpecs(eventId, req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Event specs updated successfully',
            error: {},
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /events/:eventId/complete
 * Mark event as completed
 */
async function markCompleted(req, res, next) {
    try {
        const { eventId } = req.params;
        const event = await eventService.markCompleted(eventId);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Event marked as completed',
            error: {},
            data: event
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /events/:eventId/reviews
 * Submit a review for completed event
 */
async function createReview(req, res, next) {
    try {
        const { eventId } = req.params;
        const result = await eventService.createReview(eventId, req.body);
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Review submitted successfully',
            error: {},
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /events/:eventId/reviews
 * Get review for an event
 */
async function getReview(req, res, next) {
    try {
        const { eventId } = req.params;
        const review = await eventService.getReview(eventId);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: review ? 'Review fetched successfully' : 'No review found',
            error: {},
            data: review
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /restaurants/:restaurantId/reviews
 * Submit a general review for a restaurant (not tied to an event)
 */
async function createGeneralReview(req, res, next) {
    try {
        const { restaurantId } = req.params;
        const result = await eventService.createGeneralReview(restaurantId, req.body);
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Review submitted successfully',
            error: {},
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /restaurants/:restaurantId/reviews
 * Get all published reviews for a restaurant
 */
async function getRestaurantReviews(req, res, next) {
    try {
        const { restaurantId } = req.params;
        const reviews = await eventService.getRestaurantReviews(restaurantId);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Reviews fetched successfully',
            error: {},
            data: reviews
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllEvents,
    getEventsByRestaurant,
    getEventsByCustomer,
    getEvent,
    updateSpecs,
    markCompleted,
    createReview,
    getReview,
    createGeneralReview,
    getRestaurantReviews
};
