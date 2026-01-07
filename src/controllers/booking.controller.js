const { BookingService } = require('../services');
const { 
    BookingRequestRepository, 
    BookingMessageRepository, 
    RestaurantRepository, 
    CustomerRepository,
    RestaurantSpaceRepository,
    AvailabilityBlockRepository,
    EventRepository
} = require('../repositories');
const { StatusCodes } = require('http-status-codes');

const bookingService = new BookingService(
    new BookingRequestRepository(),
    new BookingMessageRepository(),
    new RestaurantRepository(),
    new CustomerRepository(),
    new RestaurantSpaceRepository(),
    new AvailabilityBlockRepository(),
    new EventRepository()
);

const restaurantRepository = new RestaurantRepository();

async function createBookingRequest(req, res, next) {
    try {
        // For Customer role, use the id from token (which is customerId)
        // For security, override customerId from body with authenticated user's id
        if (req.user && req.user.role === 'Customer') {
            req.body.customerId = req.user.id; // id is customerId for Customer role
        }
        
        const result = await bookingService.createBookingRequest(req.body);
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Booking request created successfully',
            error: {},
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function sendMessage(req, res, next) {
    try {
        const { bookingRequestId } = req.params;
        const result = await bookingService.sendMessage(bookingRequestId, req.body);
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Message sent successfully',
            error: {},
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function getMessages(req, res, next) {
    try {
        const { bookingRequestId } = req.params;
        const messages = await bookingService.getMessages(bookingRequestId);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Messages fetched successfully',
            error: {},
            data: messages
        });
    } catch (error) {
        next(error);
    }
}

async function makeDecision(req, res, next) {
    try {
        const { bookingRequestId } = req.params;
        const result = await bookingService.makeDecision(bookingRequestId, req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Decision recorded successfully',
            error: {},
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function getBookingById(req, res, next) {
    try {
        const { bookingRequestId } = req.params;
        const booking = await bookingService.getBookingById(bookingRequestId);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Booking fetched successfully',
            error: {},
            data: booking
        });
    } catch (error) {
        next(error);
    }
}

async function getBookingsByRestaurant(req, res, next) {
    try {
        const { restaurantId } = req.params;
        const bookings = await bookingService.getBookingsByRestaurant(restaurantId);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Bookings fetched successfully',
            error: {},
            data: bookings
        });
    } catch (error) {
        next(error);
    }
}

async function getBookingsByCustomer(req, res, next) {
    try {
        const { customerId } = req.params;
        const bookings = await bookingService.getBookingsByCustomer(customerId);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Bookings fetched successfully',
            error: {},
            data: bookings
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /restaurant/bookings/my
 * Get bookings for the logged-in restaurant
 */
async function getMyBookings(req, res, next) {
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

        const bookings = await bookingService.getBookingsByRestaurant(restaurant._id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Bookings fetched successfully',
            error: {},
            data: bookings
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /restaurant/bookings/:bookingRequestId
 * Get single booking by ID (must belong to restaurant)
 */
async function getMyBookingById(req, res, next) {
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

        const booking = await bookingService.getBookingById(req.params.bookingRequestId);
        
        // Verify booking belongs to restaurant
        const bookingRestaurantId = booking.restaurantId?._id 
            ? booking.restaurantId._id.toString() 
            : booking.restaurantId?.toString();
        
        if (bookingRestaurantId !== restaurant._id.toString()) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'You do not have permission to view this booking',
                error: {},
                data: null
            });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Booking fetched successfully',
            error: {},
            data: booking
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /restaurant/bookings/:bookingRequestId/decision
 * Make decision on booking (approve/reject) - restaurantId auto-set from logged-in user
 */
async function makeMyDecision(req, res, next) {
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

        // Set restaurantId from logged-in user
        req.body.restaurantId = restaurant._id.toString();
        
        const result = await bookingService.makeDecision(req.params.bookingRequestId, req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Decision recorded successfully',
            error: {},
            data: result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createBookingRequest,
    sendMessage,
    getMessages,
    makeDecision,
    getBookingById,
    getBookingsByRestaurant,
    getBookingsByCustomer,
    getMyBookings,
    getMyBookingById,
    makeMyDecision
};
