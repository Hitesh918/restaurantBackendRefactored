const { BookingRequest, Event } = require('../models');

class BookingRequestRepository {
    async create(data) {
        const booking = new BookingRequest(data);
        return await booking.save();
    }

    async findById(id) {
        return await BookingRequest.findById(id)
            .populate('restaurantId', 'restaurantName')
            .populate('customerId', 'name email phone')
            .populate({
                path: 'spaceId',
                model: 'RestaurantRoom',
                select: 'roomName roomType capacity description'
            });
    }

    async findByRestaurantId(restaurantId) {
        return await BookingRequest.find({ restaurantId })
            .populate('customerId', 'name email phone companyName')
            .populate({
                path: 'spaceId',
                model: 'RestaurantRoom',
                select: 'roomName roomType capacity description'
            })
            .sort({ createdAt: -1 })
            .lean();
    }

    async getGroupedByRestaurant(restaurantId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const bookings = await BookingRequest.find({ restaurantId })
            .populate('customerId', 'name email phone')
            .populate({
                path: 'spaceId',
                model: 'RestaurantRoom',
                select: 'roomName roomType capacity description'
            })
            .sort({ eventDate: -1 })
            .lean();

        const result = {
            pending: [],
            upcoming: [],
            past: [],
            rejected: []
        };

        for (const booking of bookings) {
            const customer = booking.customerId;
            
            const formatted = {
                _id: booking._id,
                customerName: customer?.name || null,
                customerEmail: customer?.email || null,
                customerPhone: customer?.phone || null,
                spaceName: booking.spaceId?.roomName || null,
                eventDate: booking.eventDate,
                startTime: booking.startTime,
                endTime: booking.endTime,
                guestCount: booking.guestCount,
                eventStyle: booking.eventStyle,
                bidPrice: booking.bidPrice,
                acceptMinSpend: booking.acceptMinSpend,
                currency: booking.currency,
                messageToHost: booking.messageToHost,
                status: booking.status,
                expiresAt: booking.expiresAt,
                createdAt: booking.createdAt
            };

            if (booking.status === 'pending') {
                result.pending.push(formatted);
            } else if (booking.status === 'rejected' || booking.status === 'expired') {
                result.rejected.push(formatted);
            } else if (booking.status === 'approved') {
                const eventDate = new Date(booking.eventDate);
                if (eventDate >= today) {
                    result.upcoming.push(formatted);
                } else {
                    result.past.push(formatted);
                }
            }
        }

        return result;
    }

    async updateStatus(id, status, decisionNotes = null) {
        const updateData = { 
            status, 
            decisionAt: new Date(),
            decisionNotes: decisionNotes
        };
        return await BookingRequest.findByIdAndUpdate(id, updateData, { new: true });
    }

    async getGroupedBookingHistory(customerId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Query by customerId
        const bookings = await BookingRequest.find({ customerId })
            .populate('restaurantId', 'restaurantName')
            .populate({
                path: 'spaceId',
                model: 'RestaurantRoom',
                select: 'roomName roomType capacity description'
            })
            .sort({ eventDate: -1 })
            .lean();

        const result = {
            pending: [],
            upcoming: [],
            past: [],
            rejected: []
        };

        const approvedBookingIds = bookings
            .filter(b => b.status === 'approved')
            .map(b => b._id);

        const events = await Event.find({ bookingRequestId: { $in: approvedBookingIds } })
            .select('bookingRequestId createdAt')
            .lean();

        const eventMap = new Map(events.map(e => [e.bookingRequestId.toString(), e]));

        for (const booking of bookings) {
            const formatted = {
                _id: booking._id,
                restaurantName: booking.restaurantId?.restaurantName || null,
                spaceName: booking.spaceId?.roomName || null,
                eventDate: booking.eventDate,
                startTime: booking.startTime,
                endTime: booking.endTime,
                guestCount: booking.guestCount,
                eventStyle: booking.eventStyle,
                status: booking.status,
                createdAt: booking.createdAt
            };

            if (booking.status === 'pending') {
                result.pending.push(formatted);
            } else if (booking.status === 'rejected' || booking.status === 'expired') {
                result.rejected.push(formatted);
            } else if (booking.status === 'approved') {
                const event = eventMap.get(booking._id.toString());
                if (event) {
                    formatted.eventId = event._id;
                    formatted.eventCreatedAt = event.createdAt;
                }
                
                const eventDate = new Date(booking.eventDate);
                if (eventDate >= today) {
                    result.upcoming.push(formatted);
                } else {
                    result.past.push(formatted);
                }
            }
        }

        return result;
    }
}

module.exports = BookingRequestRepository;
