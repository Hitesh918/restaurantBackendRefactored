const express = require('express');
const BookingController = require('../../controllers/booking.controller');

const router = express.Router();

// Create booking request (lead)
router.post('/requests', BookingController.createBookingRequest);

// Get bookings by restaurant (for restaurant dashboard)
router.get('/restaurant/:restaurantId', BookingController.getBookingsByRestaurant);

// Get bookings by customer (for customer dashboard)
router.get('/customer/:customerId', BookingController.getBookingsByCustomer);

// Get single booking by ID
router.get('/:bookingRequestId', BookingController.getBookingById);

// Messaging
router.post('/:bookingRequestId/messages', BookingController.sendMessage);
router.get('/:bookingRequestId/messages', BookingController.getMessages);

// Restaurant decision
router.post('/:bookingRequestId/decision', BookingController.makeDecision);

module.exports = router;
