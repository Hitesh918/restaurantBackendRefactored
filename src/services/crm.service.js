const BaseError = require('../errors/base.error');

class CRMService {
    constructor(
        eventRepository,
        bookingRequestRepository,
        reviewRepository,
        customerRepository,
        restaurantRepository
    ) {
        this.eventRepository = eventRepository;
        this.bookingRequestRepository = bookingRequestRepository;
        this.reviewRepository = reviewRepository;
        this.customerRepository = customerRepository;
        this.restaurantRepository = restaurantRepository;
    }

    /**
     * Get events for restaurant with enriched data
     */
    async getEvents(restaurantId, filters = {}) {
        const events = await this.eventRepository.findByRestaurantId(restaurantId);
        
        // Enrich events with booking request details
        const enrichedEvents = events.map(event => {
            const booking = event.bookingRequestId;
            if (!booking) return null;

            const customer = booking.customerId;
            const space = booking.spaceId;
            
            // Calculate revenue and profit (simplified - can be enhanced)
            const revenue = booking.bidPrice || booking.acceptMinSpend || 0;
            const profit = Math.round(revenue * 0.57); // 57% profit margin (can be calculated from actual costs)

            return {
                _id: event._id,
                id: event._id.toString(),
                name: space?.name || 'Unknown Space',
                clientName: customer?.name || 'Unknown',
                company: null, // Customer model doesn't have companyName field
                date: booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }) : '',
                location: space?.name || '',
                guests: event.finalGuestCount || booking.guestCount || 0,
                status: event.status === 'completed' ? 'completed' : 'upcoming',
                revenue: revenue,
                profit: profit,
                rating: null, // Will be populated from reviews
                bookingRequestId: booking._id,
                eventDate: booking.eventDate,
                createdAt: event.createdAt
            };
        }).filter(e => e !== null);

        // Get reviews for these events to add ratings
        const eventIds = enrichedEvents.map(e => e._id);
        const reviews = await this.reviewRepository.findByEventIds(eventIds);
        const reviewMap = new Map();
        reviews.forEach(review => {
            if (review.eventId) {
                reviewMap.set(review.eventId.toString(), review.rating);
            }
        });

        // Add ratings to events
        enrichedEvents.forEach(event => {
            const rating = reviewMap.get(event._id.toString());
            if (rating) {
                event.rating = rating;
            }
        });

        // Apply filters
        let filtered = enrichedEvents;
        if (filters.status) {
            filtered = filtered.filter(e => e.status === filters.status);
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(e => 
                e.name?.toLowerCase().includes(searchLower) ||
                e.clientName?.toLowerCase().includes(searchLower) ||
                e.company?.toLowerCase().includes(searchLower)
            );
        }

        // Sort by date (most recent first)
        filtered.sort((a, b) => {
            const dateA = new Date(a.eventDate || a.createdAt);
            const dateB = new Date(b.eventDate || b.createdAt);
            return dateB - dateA;
        });

        return filtered;
    }

    /**
     * Get clients (customers) for restaurant
     */
    async getClients(restaurantId) {
        // Get all booking requests for this restaurant
        const bookings = await this.bookingRequestRepository.findByRestaurantId(restaurantId);
        
        // Get unique customers
        const customerMap = new Map();
        bookings.forEach(booking => {
            const customer = booking.customerId;
            if (customer && !customerMap.has(customer._id.toString())) {
                customerMap.set(customer._id.toString(), {
                    _id: customer._id,
                    name: customer.name || 'Unknown',
                    email: customer.email || '',
                    phone: customer.phone || '',
                    company: null, // Customer model doesn't have companyName field
                    bookingCount: 0,
                    totalSpent: 0,
                    lastBookingDate: null,
                    createdAt: customer.createdAt || booking.createdAt
                });
            }
            
            // Update stats
            if (customer) {
                const client = customerMap.get(customer._id.toString());
                if (client) {
                    client.bookingCount += 1;
                    const amount = booking.bidPrice || booking.acceptMinSpend || 0;
                    client.totalSpent += amount;
                    const bookingDate = new Date(booking.eventDate || booking.createdAt);
                    if (!client.lastBookingDate || bookingDate > new Date(client.lastBookingDate)) {
                        client.lastBookingDate = bookingDate;
                    }
                }
            }
        });

        return Array.from(customerMap.values()).sort((a, b) => {
            const dateA = new Date(a.lastBookingDate || a.createdAt);
            const dateB = new Date(b.lastBookingDate || b.createdAt);
            return dateB - dateA;
        });
    }

    /**
     * Get reviews/feedback for restaurant
     */
    async getFeedback(restaurantId) {
        // Get all reviews for events belonging to this restaurant
        const reviews = await this.reviewRepository.findByRestaurantId(restaurantId);
        
        // Filter out reviews where event doesn't belong to restaurant
        const validReviews = reviews.filter(review => {
            return review.eventId?.bookingRequestId?.restaurantId?.toString() === restaurantId.toString();
        });

        // Format reviews
        const formattedReviews = validReviews.map(review => {
            const event = review.eventId;
            const booking = event?.bookingRequestId;
            const customer = review.reviewerId;
            
            return {
                _id: review._id,
                name: customer?.name || 'Unknown',
                quote: review.reviewText,
                event: booking?.spaceId?.name || 'Unknown Event',
                date: review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                }) : '',
                rating: review.rating,
                status: review.status,
                createdAt: review.createdAt
            };
        }).filter(r => r !== null);

        // Calculate survey averages
        const publishedReviews = formattedReviews.filter(r => r.status === 'published');
        const surveys = {
            'Overall experience': this.calculateAverage(publishedReviews, 'rating'),
            'Food quality': this.calculateAverage(publishedReviews, 'rating'), // Can be enhanced with specific ratings
            'Service': this.calculateAverage(publishedReviews, 'rating'),
            'Value for money': this.calculateAverage(publishedReviews, 'rating'),
            'Would recommend': this.calculateAverage(publishedReviews, 'rating')
        };

        return {
            surveys: Object.entries(surveys).map(([category, rating]) => ({
                category,
                rating: rating || 0
            })),
            recent: formattedReviews
                .filter(r => r.status === 'published')
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10)
        };
    }

    /**
     * Calculate average rating
     */
    calculateAverage(reviews, field) {
        if (!reviews || reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + (review[field] || 0), 0);
        return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal
    }

    /**
     * Get CRM KPIs
     */
    async getKPIs(restaurantId) {
        // Get all events
        const events = await this.getEvents(restaurantId);
        
        // Calculate KPIs
        const totalEvents = events.length;
        const completedEvents = events.filter(e => e.status === 'completed');
        const revenue = events.reduce((sum, e) => sum + (e.revenue || 0), 0);
        const profit = events.reduce((sum, e) => sum + (e.profit || 0), 0);
        const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 100 * 10) / 10 : 0;

        // Get reviews for average rating
        const reviews = await this.reviewRepository.findByRestaurantId(restaurantId);
        const publishedReviews = reviews.filter(r => 
            r.status === 'published' && 
            r.eventId?.bookingRequestId?.restaurantId?.toString() === restaurantId.toString()
        );
        const avgRating = this.calculateAverage(
            publishedReviews.map(r => ({ rating: r.rating })),
            'rating'
        );
        const reviewsCount = publishedReviews.length;

        // Calculate quarter comparison (simplified - can be enhanced)
        const currentQuarter = this.getCurrentQuarter();
        const currentQuarterEvents = events.filter(e => {
            const eventDate = new Date(e.eventDate || e.createdAt);
            return this.isInQuarter(eventDate, currentQuarter);
        });
        const currentQuarterRevenue = currentQuarterEvents.reduce((sum, e) => sum + (e.revenue || 0), 0);

        return {
            totalEvents: completedEvents.length, // Only count completed events
            revenue: revenue,
            profitMargin: profitMargin,
            profit: profit,
            avgRating: avgRating || 0,
            reviews: reviewsCount,
            currentQuarterRevenue: currentQuarterRevenue
        };
    }

    /**
     * Get current quarter
     */
    getCurrentQuarter() {
        const now = new Date();
        const month = now.getMonth();
        return Math.floor(month / 3) + 1;
    }

    /**
     * Check if date is in quarter
     */
    isInQuarter(date, quarter) {
        const month = date.getMonth();
        const dateQuarter = Math.floor(month / 3) + 1;
        return dateQuarter === quarter;
    }
}

module.exports = CRMService;

