const BaseError = require('../errors/base.error');

class EventService {
    constructor(eventRepository, reviewRepository, bookingRepository) {
        this.eventRepository = eventRepository;
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
    }

    /**
     * Get all events (admin)
     */
    async getAllEvents() {
        return await this.eventRepository.findAll();
    }

    /**
     * Get events by restaurant
     */
    async getEventsByRestaurant(restaurantId) {
        return await this.eventRepository.findByRestaurantId(restaurantId);
    }

    /**
     * Get events by customer
     */
    async getEventsByCustomer(customerId) {
        return await this.eventRepository.findByCustomerId(customerId);
    }

    /**
     * Get event by ID
     */
    async getEventById(eventId) {
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new BaseError('Event not found', 404);
        }
        return event;
    }

    /**
     * PUT /events/:eventId/specs
     * Update event specs (finalize details after booking approval)
     * Does NOT affect availability
     */
    async updateSpecs(eventId, specsData) {
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new BaseError('Event not found', 404);
        }

        // Can only update if status is draft or final (not completed)
        if (event.status === 'completed') {
            throw new BaseError('Cannot update specs for completed events', 400);
        }

        // If specsStatus is already "final", reject updates
        if (event.specsStatus === 'final') {
            throw new BaseError('Event specs are finalized and cannot be modified', 400);
        }

        // Build update object
        const updateData = {};

        if (specsData.finalGuestCount !== undefined) {
            updateData.finalGuestCount = specsData.finalGuestCount;
        }

        if (specsData.menuSelection) {
            updateData.menuSelection = {
                menuId: specsData.menuSelection.menuId,
                selectedItems: specsData.menuSelection.selectedItems || []
            };
        }

        if (specsData.setupNotes !== undefined) {
            updateData.setupNotes = specsData.setupNotes;
        }

        if (specsData.timeline) {
            updateData.timeline = {
                guestArrival: specsData.timeline.guestArrival,
                foodService: specsData.timeline.foodService,
                teardown: specsData.timeline.teardown
            };
        }

        if (specsData.productionRequirements) {
            updateData.productionRequirements = specsData.productionRequirements;
        }

        if (specsData.fnbDetails !== undefined) {
            updateData.fnbDetails = specsData.fnbDetails;
        }

        // Handle specsStatus
        if (specsData.specsStatus) {
            if (!['draft', 'final'].includes(specsData.specsStatus)) {
                throw new BaseError('specsStatus must be draft or final', 400);
            }
            updateData.specsStatus = specsData.specsStatus;
        }

        const updatedEvent = await this.eventRepository.updateSpecs(eventId, updateData);

        return {
            eventId: updatedEvent._id,
            specsStatus: updatedEvent.specsStatus
        };
    }

    /**
     * Mark event as completed (after the event date has passed)
     */
    async markCompleted(eventId) {
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new BaseError('Event not found', 404);
        }

        if (event.status === 'completed') {
            throw new BaseError('Event is already completed', 400);
        }

        const updated = await this.eventRepository.updateStatus(eventId, 'completed');
        return updated;
    }

    /**
     * POST /events/:eventId/reviews
     * Submit a review after event completion
     * Uses customerId (from login) directly
     */
    async createReview(eventId, reviewData) {
        const event = await this.eventRepository.findById(eventId);
        if (!event) {
            throw new BaseError('Event not found', 404);
        }

        // Review can ONLY be created if event status is "completed"
        if (event.status !== 'completed') {
            throw new BaseError('Reviews can only be submitted for completed events', 400);
        }

        // Only ONE review per event
        const existingReview = await this.reviewRepository.existsByEventId(eventId);
        if (existingReview) {
            throw new BaseError('A review already exists for this event', 409);
        }

        // Validate required fields - now uses customerId (reviewerId)
        if (!reviewData.reviewerId) {
            throw new BaseError('reviewerId is required', 400);
        }
        if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
            throw new BaseError('rating must be between 1 and 5', 400);
        }
        if (!reviewData.reviewText) {
            throw new BaseError('review_text is required', 400);
        }
        if (reviewData.eventType && !['corporate', 'personal', 'agency'].includes(reviewData.eventType)) {
            throw new BaseError('event_type must be corporate, personal, or agency', 400);
        }

        // Fetch restaurantId from booking chain
        const booking = await this.bookingRepository.findById(event.bookingRequestId);
        if (!booking) {
            throw new BaseError('Booking not found', 404);
        }

        const review = await this.reviewRepository.create({
            eventId,
            restaurantId: booking.restaurantId,
            reviewerId: reviewData.reviewerId,
            rating: reviewData.rating,
            reviewText: reviewData.reviewText,
            eventType: reviewData.eventType,
            photos: reviewData.photos || [],
            status: 'pending_moderation'
        });

        return {
            reviewId: review._id,
            status: review.status
        };
    }

    /**
     * Get review for an event
     */
    async getReview(eventId) {
        const review = await this.reviewRepository.findByEventId(eventId);
        return review;
    }

    /**
     * POST /restaurants/:restaurantId/reviews
     * Submit a general review for a restaurant (not tied to an event)
     * Uses reviewerId (customerId from login)
     */
    async createGeneralReview(restaurantId, reviewData) {
        // Validate required fields
        if (!reviewData.reviewerId) {
            throw new BaseError('reviewerId is required', 400);
        }
        if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
            throw new BaseError('rating must be between 1 and 5', 400);
        }
        if (!reviewData.reviewText) {
            throw new BaseError('reviewText is required', 400);
        }
        if (reviewData.eventType && !['corporate', 'personal', 'agency'].includes(reviewData.eventType)) {
            throw new BaseError('eventType must be corporate, personal, or agency', 400);
        }

        const review = await this.reviewRepository.create({
            eventId: null, // No event for general reviews
            restaurantId,
            reviewerId: reviewData.reviewerId,
            rating: reviewData.rating,
            reviewText: reviewData.reviewText,
            eventType: reviewData.eventType,
            photos: reviewData.photos || [],
            status: 'pending_moderation'
        });

        return {
            reviewId: review._id,
            status: review.status
        };
    }

    /**
     * GET /restaurants/:restaurantId/reviews
     * Get all published reviews for a restaurant
     */
    async getRestaurantReviews(restaurantId) {
        const reviews = await this.reviewRepository.findByRestaurantId(restaurantId);
        return reviews;
    }
}

module.exports = EventService;
