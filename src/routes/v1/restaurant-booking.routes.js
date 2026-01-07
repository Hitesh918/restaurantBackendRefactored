const express = require('express');
const BookingController = require('../../controllers/booking.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication and restaurant role
router.use(authenticate);
router.use(authorize('Restaurant'));

// Get bookings for the logged-in restaurant
router.get('/my', BookingController.getMyBookings);

// Get single booking by ID (must belong to restaurant)
router.get('/:bookingRequestId', BookingController.getMyBookingById);

// Restaurant decision (approve/reject)
router.post('/:bookingRequestId/decision', BookingController.makeMyDecision);

// Messaging
router.post('/:bookingRequestId/messages', BookingController.sendMessage);
router.get('/:bookingRequestId/messages', BookingController.getMessages);

module.exports = router;

