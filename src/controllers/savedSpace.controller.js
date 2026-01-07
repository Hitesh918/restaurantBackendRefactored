const { StatusCodes } = require('http-status-codes');
const SavedSpaceService = require('../services/savedSpace.service');
const SavedSpaceRepository = require('../repositories/savedSpace.repository');
const RestaurantRepository = require('../repositories/restaurant.repository');

const savedSpaceRepository = new SavedSpaceRepository();
const restaurantRepository = new RestaurantRepository();
const savedSpaceService = new SavedSpaceService(savedSpaceRepository, restaurantRepository);

/**
 * POST /customers/:customerId/saved-spaces
 * Save a restaurant/space
 */
async function saveSpace(req, res, next) {
    try {
        const { customerId } = req.params;
        const { restaurantId } = req.body;

        if (!restaurantId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'restaurantId is required',
                error: {},
                data: null
            });
        }

        const result = await savedSpaceService.saveSpace(customerId, restaurantId);
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Space saved successfully',
            error: {},
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /customers/:customerId/saved-spaces/:restaurantId
 * Unsave a restaurant/space
 */
async function unsaveSpace(req, res, next) {
    try {
        const { customerId, restaurantId } = req.params;
        const result = await savedSpaceService.unsaveSpace(customerId, restaurantId);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Space unsaved successfully',
            error: {},
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /customers/:customerId/saved-spaces
 * Get all saved spaces for a customer
 */
async function getSavedSpaces(req, res, next) {
    try {
        const { customerId } = req.params;
        const savedSpaces = await savedSpaceService.getSavedSpaces(customerId);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Saved spaces fetched successfully',
            error: {},
            data: savedSpaces
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /customers/:customerId/saved-spaces/check/:restaurantId
 * Check if a space is saved
 */
async function checkIfSaved(req, res, next) {
    try {
        const { customerId, restaurantId } = req.params;
        const isSaved = await savedSpaceService.isSpaceSaved(customerId, restaurantId);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Check completed',
            error: {},
            data: { isSaved }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    saveSpace,
    unsaveSpace,
    getSavedSpaces,
    checkIfSaved
};

