const BaseError = require('../errors/base.error');

class BookingService {
    constructor(
        bookingRequestRepository, 
        bookingMessageRepository, 
        restaurantRepository, 
        customerRepository,
        restaurantSpaceRepository,
        availabilityBlockRepository,
        eventRepository
    ) {
        this.bookingRequestRepository = bookingRequestRepository;
        this.bookingMessageRepository = bookingMessageRepository;
        this.restaurantRepository = restaurantRepository;
        this.customerRepository = customerRepository;
        this.restaurantSpaceRepository = restaurantSpaceRepository;
        this.availabilityBlockRepository = availabilityBlockRepository;
        this.eventRepository = eventRepository;
    }

    /**
     * Create a booking request (lead)
     * Uses customerId (from login) directly
     */
    async createBookingRequest(data) {
        if (!data.customerId) {
            throw new BaseError('customerId is required', 400);
        }
        if (!data.bidPrice && !data.acceptMinSpend) {
            throw new BaseError('Either bidPrice or acceptMinSpend is required', 400);
        }

        // Validate customer exists
        const customer = await this.customerRepository.findById(data.customerId);
        if (!customer) {
            throw new BaseError('Customer not found', 404);
        }

        // Validate space exists and belongs to restaurant
        const space = await this.restaurantSpaceRepository.findById(data.spaceId);
        if (!space) {
            throw new BaseError('Space not found', 404);
        }
        if (space.restaurantId.toString() !== data.restaurantId) {
            throw new BaseError('Space does not belong to this restaurant', 400);
        }

        // Validate guest count within capacity
        if (data.guestCount < space.minCapacity || data.guestCount > space.maxCapacity) {
            throw new BaseError(
                `Guest count must be between ${space.minCapacity} and ${space.maxCapacity}`,
                400
            );
        }

        // Validate event style is allowed
        if (!space.allowedEventStyles.includes(data.eventStyle)) {
            throw new BaseError(
                `Event style '${data.eventStyle}' not allowed. Allowed: ${space.allowedEventStyles.join(', ')}`,
                400
            );
        }

        // Set expiration (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const bookingData = {
            customerId: data.customerId,
            restaurantId: data.restaurantId,
            spaceId: data.spaceId,
            eventDate: new Date(data.eventDate),
            startTime: data.startTime,
            endTime: data.endTime,
            guestCount: data.guestCount,
            eventStyle: data.eventStyle,
            messageToHost: data.messageToHost,
            bidPrice: data.bidPrice,
            acceptMinSpend: data.acceptMinSpend,
            currency: data.currency || 'INR',
            status: 'pending',
            expiresAt
        };

        const booking = await this.bookingRequestRepository.create(bookingData);

        // Create initial message if provided
        if (data.messageToHost) {
            await this.bookingMessageRepository.create({
                bookingRequestId: booking._id,
                senderUserId: customer.userId, // Use the user ID for messages
                messageText: data.messageToHost,
                attachments: []
            });
        }

        return {
            bookingRequestId: booking._id,
            status: booking.status,
            expiresAt: booking.expiresAt
        };
    }

    /**
     * Send message in booking thread
     * senderType: 'customer' or 'restaurant' - resolved from booking
     */
    async sendMessage(bookingRequestId, data) {
        const booking = await this.bookingRequestRepository.findById(bookingRequestId);
        if (!booking) {
            throw new BaseError('Booking request not found', 404);
        }

        if (!data.senderType || !['customer', 'restaurant'].includes(data.senderType)) {
            throw new BaseError('senderType must be "customer" or "restaurant"', 400);
        }

        // Resolve senderUserId from booking based on senderType
        let senderUserId;
        
        if (data.senderType === 'customer') {
            const customerId = booking.customerId?._id || booking.customerId;
            const customer = await this.customerRepository.findById(customerId);
            if (!customer) {
                throw new BaseError('Customer not found', 404);
            }
            senderUserId = customer.userId;
        } else {
            const restaurantId = booking.restaurantId?._id || booking.restaurantId;
            const restaurant = await this.restaurantRepository.findById(restaurantId);
            if (!restaurant) {
                throw new BaseError('Restaurant not found', 404);
            }
            senderUserId = restaurant.userId;
        }

        const message = await this.bookingMessageRepository.create({
            bookingRequestId,
            senderUserId,
            messageText: data.messageText,
            attachments: data.attachments || []
        });

        return {
            messageId: message._id,
            createdAt: message.createdAt
        };
    }

    async getMessages(bookingRequestId) {
        return await this.bookingMessageRepository.findByBookingRequestId(bookingRequestId);
    }

    /**
     * Restaurant approves or rejects a booking
     * Uses restaurantId (from login) directly
     */
    async makeDecision(bookingRequestId, data) {
        const booking = await this.bookingRequestRepository.findById(bookingRequestId);
        if (!booking) {
            throw new BaseError('Booking request not found', 404);
        }

        // Verify authorization using restaurantId from login
        if (!data.restaurantId) {
            throw new BaseError('restaurantId is required', 400);
        }

        // Get the restaurantId from the booking (handle populated vs non-populated)
        const bookingRestaurantId = booking.restaurantId?._id 
            ? booking.restaurantId._id.toString() 
            : booking.restaurantId?.toString();

        const inputRestaurantId = data.restaurantId.toString();

        if (bookingRestaurantId !== inputRestaurantId) {
            throw new BaseError('Unauthorized to make decision on this booking', 403);
        }

        if (booking.status !== 'pending') {
            throw new BaseError('Booking is no longer pending', 400);
        }

        const decision = data.decision.toLowerCase();
        if (!['approve', 'reject'].includes(decision)) {
            throw new BaseError('Decision must be approve or reject', 400);
        }

        if (decision === 'reject') {
            const updated = await this.bookingRequestRepository.updateStatus(
                bookingRequestId,
                'rejected',
                data.notes
            );
            return {
                status: updated.status,
                decisionAt: updated.decisionAt
            };
        }

        return await this._approveBooking(booking, data.notes);
    }

    async _approveBooking(booking, notes) {
        const bookingRequestId = booking._id;
        
        // Handle populated vs non-populated references
        const spaceId = booking.spaceId?._id || booking.spaceId;
        const restaurantId = booking.restaurantId?._id || booking.restaurantId;

        // 1. Check availability via AvailabilityBlock ONLY
        const overlappingBlocks = await this.availabilityBlockRepository.findOverlappingBlocks(
            spaceId,
            booking.eventDate,
            booking.startTime,
            booking.endTime
        );

        if (overlappingBlocks.length > 0) {
            throw new BaseError(
                'Cannot approve: Time slot is no longer available',
                409,
                'SLOT_UNAVAILABLE',
                {
                    conflicts: overlappingBlocks.map(b => ({
                        date: b.eventDate,
                        startTime: b.startTime,
                        endTime: b.endTime,
                        reason: b.reason
                    }))
                }
            );
        }

        // 2. Idempotency check - don't create duplicate Event
        const existingEvent = await this.eventRepository.existsByBookingRequestId(bookingRequestId);
        if (existingEvent) {
            throw new BaseError('Booking already has an associated event', 400);
        }

        // 3. Idempotency check - don't create duplicate AvailabilityBlock
        const blockExists = await this.availabilityBlockRepository.existsForBooking(
            spaceId,
            booking.eventDate,
            booking.startTime,
            booking.endTime,
            'event'
        );
        if (blockExists) {
            throw new BaseError('Availability block already exists for this booking', 400);
        }

        // 4. Update BookingRequest status
        const updatedBooking = await this.bookingRequestRepository.updateStatus(
            bookingRequestId,
            'approved',
            notes
        );

        // 5. Create Event
        const event = await this.eventRepository.create({
            bookingRequestId,
            finalGuestCount: booking.guestCount,
            status: 'draft'
        });

        // 6. Create AvailabilityBlock
        await this.availabilityBlockRepository.create({
            restaurantId,
            spaceId,
            eventDate: booking.eventDate,
            startTime: booking.startTime,
            endTime: booking.endTime,
            reason: 'event'
        });

        return {
            status: updatedBooking.status,
            decisionAt: updatedBooking.decisionAt,
            eventId: event._id
        };
    }

    async getBookingById(bookingRequestId) {
        const booking = await this.bookingRequestRepository.findById(bookingRequestId);
        if (!booking) {
            throw new BaseError('Booking request not found', 404);
        }
        return booking;
    }

    async getBookingsByRestaurant(restaurantId) {
        return await this.bookingRequestRepository.getGroupedByRestaurant(restaurantId);
    }

    async getBookingsByCustomer(customerId) {
        return await this.bookingRequestRepository.getGroupedBookingHistory(customerId);
    }
}

module.exports = BookingService;
