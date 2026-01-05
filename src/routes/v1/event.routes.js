const express = require('express');
const EventController = require('../../controllers/event.controller');

const router = express.Router();

// Get all events (admin)
router.get('/', EventController.getAllEvents);

// Get events by restaurant
router.get('/restaurant/:restaurantId', EventController.getEventsByRestaurant);

// Get events by customer
router.get('/customer/:customerId', EventController.getEventsByCustomer);

// Get event details
router.get('/:eventId', EventController.getEvent);

// Update event specs (finalize details)
router.put('/:eventId/specs', EventController.updateSpecs);

// Mark event as completed
router.post('/:eventId/complete', EventController.markCompleted);

// Reviews
router.post('/:eventId/reviews', EventController.createReview);
router.get('/:eventId/reviews', EventController.getReview);

module.exports = router;
