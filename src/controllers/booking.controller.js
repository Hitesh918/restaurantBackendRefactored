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

async function createBookingRequest(req, res, next) {
    try {
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

module.exports = {
    createBookingRequest,
    sendMessage,
    getMessages,
    makeDecision,
    getBookingById,
    getBookingsByRestaurant,
    getBookingsByCustomer
};
