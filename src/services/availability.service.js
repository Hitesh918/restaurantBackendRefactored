const BaseError = require('../errors/base.error');

class AvailabilityService {
    constructor(availabilityBlockRepository, restaurantSpaceRepository, restaurantRepository) {
        this.availabilityBlockRepository = availabilityBlockRepository;
        this.restaurantSpaceRepository = restaurantSpaceRepository;
        this.restaurantRepository = restaurantRepository;
    }

    /**
     * Check availability for a specific space and time
     * ONLY checks AvailabilityBlock - NOT BookingRequest
     */
    async checkAvailability(restaurantId, spaceId, eventDate, startTime, endTime, guestCount) {
        // 1. Validate space belongs to restaurant
        const space = await this.restaurantSpaceRepository.findById(spaceId);
        if (!space) {
            throw new BaseError('Space not found', 404);
        }
        if (space.restaurantId.toString() !== restaurantId) {
            throw new BaseError('Space does not belong to this restaurant', 400);
        }

        // 2. Validate guest count within space capacity
        const capacityValid = guestCount >= space.minCapacity && guestCount <= space.maxCapacity;
        if (!capacityValid) {
            return {
                available: false,
                reason: 'capacity',
                message: `Guest count ${guestCount} is outside space capacity (${space.minCapacity}-${space.maxCapacity})`,
                space: {
                    id: space._id,
                    name: space.name,
                    minCapacity: space.minCapacity,
                    maxCapacity: space.maxCapacity
                }
            };
        }

        // 3. Check AvailabilityBlock for overlapping time
        // Overlap: requestedStart < blockEnd AND requestedEnd > blockStart
        const overlappingBlocks = await this.availabilityBlockRepository.findOverlappingBlocks(
            spaceId,
            eventDate,
            startTime,
            endTime
        );

        if (overlappingBlocks.length > 0) {
            return {
                available: false,
                reason: 'time_conflict',
                message: 'Time slot conflicts with existing blocks',
                conflicts: overlappingBlocks.map(block => ({
                    id: block._id,
                    date: block.eventDate,
                    startTime: block.startTime,
                    endTime: block.endTime,
                    reason: block.reason
                })),
                space: {
                    id: space._id,
                    name: space.name
                }
            };
        }

        // 4. Available!
        return {
            available: true,
            space: {
                id: space._id,
                name: space.name,
                minCapacity: space.minCapacity,
                maxCapacity: space.maxCapacity,
                allowedEventStyles: space.allowedEventStyles
            }
        };
    }

    /**
     * Get all availability blocks for a restaurant (for calendar view)
     */
    async getBlocksByRestaurant(restaurantId, dateFrom, dateTo) {
        if (dateFrom && dateTo) {
            return await this.availabilityBlockRepository.findByDateRange(restaurantId, new Date(dateFrom), new Date(dateTo));
        }
        return await this.availabilityBlockRepository.findByRestaurantId(restaurantId);
    }

    /**
     * Create a manual availability block (maintenance, hold)
     */
    async createBlock(data) {
        // Validate space belongs to restaurant
        const space = await this.restaurantSpaceRepository.findById(data.spaceId);
        if (!space) {
            throw new BaseError('Space not found', 404);
        }
        if (space.restaurantId.toString() !== data.restaurantId) {
            throw new BaseError('Space does not belong to this restaurant', 400);
        }

        // Check for existing overlapping blocks
        const overlapping = await this.availabilityBlockRepository.findOverlappingBlocks(
            data.spaceId,
            data.eventDate,
            data.startTime,
            data.endTime
        );

        if (overlapping.length > 0) {
            throw new BaseError('Time slot conflicts with existing blocks', 409);
        }

        return await this.availabilityBlockRepository.create({
            restaurantId: data.restaurantId,
            spaceId: data.spaceId,
            eventDate: new Date(data.eventDate),
            startTime: data.startTime,
            endTime: data.endTime,
            reason: data.reason || 'hold'
        });
    }

    /**
     * Delete an availability block
     */
    async deleteBlock(blockId, restaurantId) {
        const block = await this.availabilityBlockRepository.findById(blockId);
        if (!block) {
            throw new BaseError('Block not found', 404);
        }
        if (block.restaurantId.toString() !== restaurantId) {
            throw new BaseError('Unauthorized', 403);
        }

        // Don't allow deleting event blocks directly
        if (block.reason === 'event') {
            throw new BaseError('Cannot delete event blocks directly. Cancel the booking instead.', 400);
        }

        return await this.availabilityBlockRepository.delete(blockId);
    }
}

module.exports = AvailabilityService;
