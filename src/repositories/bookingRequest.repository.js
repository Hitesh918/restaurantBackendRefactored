const { BookingRequest, Event } = require('../models');

class BookingRequestRepository {
    async create(data) {
        const booking = new BookingRequest(data);
        return await booking.save();
    }

    async findById(id) {
        const booking = await BookingRequest.findById(id)
            .populate('customerId', 'name email phone')
            .populate({
                path: 'spaceId',
                model: 'RestaurantRoom',
                select: 'roomName roomType capacity description'
            })
            .lean();

        if (!booking) return null;

        // Handle restaurant/restaurantProfile population manually
        // Since restaurantId might contain a RestaurantProfile ID instead of Restaurant ID
        if (booking.restaurantId) {
            // Try to populate as Restaurant first
            const { Restaurant } = require('../models');
            const restaurant = await Restaurant.findById(booking.restaurantId).select('restaurantName');

            if (restaurant) {
                booking.restaurantId = {
                    _id: booking.restaurantId,
                    restaurantName: restaurant.restaurantName
                };
            } else {
                // Try as RestaurantProfile
                const { RestaurantProfile } = require('../models');
                const restaurantProfile = await RestaurantProfile.findById(booking.restaurantId).select('restaurantName');

                if (restaurantProfile) {
                    booking.restaurantId = {
                        _id: booking.restaurantId,
                        restaurantName: restaurantProfile.restaurantName
                    };
                }
            }
        }

        if (booking.restaurantProfileId) {
            const { RestaurantProfile } = require('../models');
            const restaurantProfile = await RestaurantProfile.findById(booking.restaurantProfileId).select('restaurantName');

            if (restaurantProfile) {
                booking.restaurantProfileId = {
                    _id: booking.restaurantProfileId,
                    restaurantName: restaurantProfile.restaurantName
                };
            }
        }

        return booking;
    }

    async findByIdRaw(id) {
        // Get booking without population for internal service use
        return await BookingRequest.findById(id).lean();
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

    async getGroupedByRestaurantProfile(restaurantProfileId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find bookings by restaurantProfileId (new bookings) OR by restaurantId that belongs to this profile (legacy bookings)
        // First, we need to find the restaurant record that belongs to this profile
        const { Restaurant } = require('../models');

        // Find restaurant by restaurantProfileId
        const restaurant = await Restaurant.findOne({ restaurantProfileId }).select('_id');

        // Also find restaurant by userId (fallback for cases where restaurantProfileId is not set)
        const { RestaurantProfile } = require('../models');
        const restaurantProfile = await RestaurantProfile.findById(restaurantProfileId).select('userId');
        let restaurantByUserId = null;
        if (restaurantProfile && restaurantProfile.userId) {
            restaurantByUserId = await Restaurant.findOne({ userId: restaurantProfile.userId }).select('_id');
        }

        // Build query to find bookings
        const restaurantIds = [];
        if (restaurant) restaurantIds.push(restaurant._id);
        if (restaurantByUserId && restaurantByUserId._id.toString() !== restaurant?._id?.toString()) {
            restaurantIds.push(restaurantByUserId._id);
        }

        // IMPORTANT: Also check if restaurantId in booking matches the restaurantProfileId
        // This handles cases where restaurantProfileId was stored in restaurantId field
        restaurantIds.push(restaurantProfileId);

        const query = {
            $or: [
                { restaurantProfileId }, // New bookings with restaurantProfileId
                { restaurantId: { $in: restaurantIds } } // Legacy bookings with restaurantId (including profile ID)
            ]
        };

        console.log('Booking query:', JSON.stringify(query, null, 2));
        console.log('Restaurant profile ID:', restaurantProfileId);
        console.log('Found restaurant IDs:', restaurantIds);

        const bookings = await BookingRequest.find(query)
            .populate('customerId', 'name email phone')
            .populate({
                path: 'spaceId',
                model: 'RestaurantRoom',
                select: 'roomName roomType capacity description'
            })
            .sort({ eventDate: -1 })
            .lean();

        console.log('Found bookings count:', bookings.length);

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
            .populate({
                path: 'spaceId',
                model: 'RestaurantRoom',
                select: 'roomName roomType capacity description'
            })
            .sort({ eventDate: -1 })
            .lean();

        // Manually populate restaurant information
        for (const booking of bookings) {
            if (booking.restaurantId) {
                // Try to populate as Restaurant first
                const { Restaurant } = require('../models');
                const restaurant = await Restaurant.findById(booking.restaurantId).select('restaurantName');

                if (restaurant) {
                    booking.restaurantId = {
                        _id: booking.restaurantId,
                        restaurantName: restaurant.restaurantName
                    };
                } else {
                    // Try as RestaurantProfile
                    const { RestaurantProfile } = require('../models');
                    const restaurantProfile = await RestaurantProfile.findById(booking.restaurantId).select('restaurantName');

                    if (restaurantProfile) {
                        booking.restaurantId = {
                            _id: booking.restaurantId,
                            restaurantName: restaurantProfile.restaurantName
                        };
                    }
                }
            }

            if (booking.restaurantProfileId) {
                const { RestaurantProfile } = require('../models');
                const restaurantProfile = await RestaurantProfile.findById(booking.restaurantProfileId).select('restaurantName');

                if (restaurantProfile) {
                    booking.restaurantProfileId = {
                        _id: booking.restaurantProfileId,
                        restaurantName: restaurantProfile.restaurantName
                    };
                }
            }
        }

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

            console.log(`Categorizing booking ${booking._id}: status=${booking.status}, eventDate=${booking.eventDate}`);

            if (booking.status === 'pending') {
                console.log('→ Adding to pending');
                result.pending.push(formatted);
            } else if (booking.status === 'rejected' || booking.status === 'expired') {
                console.log('→ Adding to rejected');
                result.rejected.push(formatted);
            } else if (booking.status === 'approved') {
                const event = eventMap.get(booking._id.toString());
                if (event) {
                    formatted.eventId = event._id;
                    formatted.eventCreatedAt = event.createdAt;
                }

                const eventDate = new Date(booking.eventDate);
                if (eventDate >= today) {
                    console.log('→ Adding to upcoming (approved + future date)');
                    result.upcoming.push(formatted);
                } else {
                    console.log('→ Adding to past (approved + past date)');
                    result.past.push(formatted);
                }
            } else {
                console.log(`→ Unknown status: ${booking.status}`);
            }
        }

        console.log('Final categorization:', {
            pending: result.pending.length,
            upcoming: result.upcoming.length,
            past: result.past.length,
            rejected: result.rejected.length
        });

        return result;
    }
}

module.exports = BookingRequestRepository;
