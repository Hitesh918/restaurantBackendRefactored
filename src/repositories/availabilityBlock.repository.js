const { AvailabilityBlock } = require('../models');

class AvailabilityBlockRepository {
    async create(data) {
        const block = new AvailabilityBlock(data);
        return await block.save();
    }

    async findById(id) {
        return await AvailabilityBlock.findById(id);
    }

    /**
     * Check for overlapping blocks on a specific space and date
     * Overlap condition: requestedStart < blockEnd AND requestedEnd > blockStart
     */
    async findOverlappingBlocks(spaceId, eventDate, startTime, endTime) {
        // Normalize date to start of day for comparison
        const dateStart = new Date(eventDate);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(eventDate);
        dateEnd.setHours(23, 59, 59, 999);

        return await AvailabilityBlock.find({
            spaceId,
            eventDate: { $gte: dateStart, $lte: dateEnd },
            // Overlap: requestedStart < blockEnd AND requestedEnd > blockStart
            startTime: { $lt: endTime },
            endTime: { $gt: startTime }
        });
    }

    /**
     * Check if a block already exists for a specific booking (idempotency check)
     */
    async existsForBooking(spaceId, eventDate, startTime, endTime, reason) {
        const dateStart = new Date(eventDate);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(eventDate);
        dateEnd.setHours(23, 59, 59, 999);

        const count = await AvailabilityBlock.countDocuments({
            spaceId,
            eventDate: { $gte: dateStart, $lte: dateEnd },
            startTime,
            endTime,
            reason
        });
        return count > 0;
    }

    async findByRestaurantId(restaurantId) {
        return await AvailabilityBlock.find({ restaurantId })
            .populate('spaceId', 'name')
            .sort({ eventDate: 1, startTime: 1 });
    }

    async findBySpaceId(spaceId) {
        return await AvailabilityBlock.find({ spaceId })
            .sort({ eventDate: 1, startTime: 1 });
    }

    async findByDateRange(restaurantId, dateFrom, dateTo) {
        return await AvailabilityBlock.find({
            restaurantId,
            eventDate: { $gte: dateFrom, $lte: dateTo }
        }).populate('spaceId', 'name');
    }

    async getBlockedSpaceIds(eventDate, startTime, endTime, bufferMinutes = 30) {
        const bufferedStart = this.subtractMinutes(startTime, bufferMinutes);
        const bufferedEnd = this.addMinutes(endTime, bufferMinutes);

        const dateStart = new Date(eventDate);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(eventDate);
        dateEnd.setHours(23, 59, 59, 999);

        const blocks = await AvailabilityBlock.find({
            eventDate: { $gte: dateStart, $lte: dateEnd },
            startTime: { $lt: bufferedEnd },
            endTime: { $gt: bufferedStart }
        }).select('spaceId');

        return blocks.map(b => b.spaceId.toString());
    }

    async delete(id) {
        return await AvailabilityBlock.findByIdAndDelete(id);
    }

    addMinutes(time, minutes) {
        const [h, m] = time.split(':').map(Number);
        const totalMinutes = h * 60 + m + minutes;
        const newH = Math.floor(totalMinutes / 60) % 24;
        const newM = totalMinutes % 60;
        return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    }

    subtractMinutes(time, minutes) {
        const [h, m] = time.split(':').map(Number);
        let totalMinutes = h * 60 + m - minutes;
        if (totalMinutes < 0) totalMinutes += 24 * 60;
        const newH = Math.floor(totalMinutes / 60);
        const newM = totalMinutes % 60;
        return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    }
}

module.exports = AvailabilityBlockRepository;
