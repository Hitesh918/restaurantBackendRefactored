const { AvailabilityService } = require('../services');
const { AvailabilityBlockRepository, RestaurantSpaceRepository, RestaurantRepository } = require('../repositories');
const { StatusCodes } = require('http-status-codes');

const availabilityService = new AvailabilityService(
    new AvailabilityBlockRepository(),
    new RestaurantSpaceRepository(),
    new RestaurantRepository()
);

/**
 * GET /restaurants/:restaurantId/availability
 * Check availability for a specific space and time
 */
async function checkAvailability(req, res, next) {
    try {
        const { restaurantId } = req.params;
        const { event_date, start_time, end_time, guest_count, space_id } = req.query;

        if (!event_date || !start_time || !end_time || !guest_count || !space_id) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Missing required query params: event_date, start_time, end_time, guest_count, space_id',
                error: { required: ['event_date', 'start_time', 'end_time', 'guest_count', 'space_id'] },
                data: null
            });
        }

        const result = await availabilityService.checkAvailability(
            restaurantId,
            space_id,
            event_date,
            start_time,
            end_time,
            parseInt(guest_count)
        );

        return res.status(StatusCodes.OK).json({
            success: true,
            message: result.available ? 'Slot is available' : 'Slot is not available',
            error: {},
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /restaurants/:restaurantId/availability/blocks
 * Get all availability blocks for calendar view
 */
async function getBlocks(req, res, next) {
    try {
        const { restaurantId } = req.params;
        const { date_from, date_to } = req.query;

        const blocks = await availabilityService.getBlocksByRestaurant(restaurantId, date_from, date_to);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Blocks fetched successfully',
            error: {},
            data: blocks
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /restaurants/:restaurantId/availability/blocks
 * Create a manual block (maintenance, hold)
 */
async function createBlock(req, res, next) {
    try {
        const { restaurantId } = req.params;
        const block = await availabilityService.createBlock({
            restaurantId,
            ...req.body
        });

        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Block created successfully',
            error: {},
            data: block
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /restaurants/:restaurantId/availability/blocks/:blockId
 * Delete a manual block (not event blocks)
 */
async function deleteBlock(req, res, next) {
    try {
        const { restaurantId, blockId } = req.params;
        await availabilityService.deleteBlock(blockId, restaurantId);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Block deleted successfully',
            error: {},
            data: null
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    checkAvailability,
    getBlocks,
    createBlock,
    deleteBlock
};
