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
        console.log('[saveSpace] Request received - customerId:', customerId, 'restaurantId:', restaurantId);
        console.log('[saveSpace] req.params:', req.params);
        console.log('[saveSpace] req.body:', req.body);

        if (!restaurantId) {
            console.log('[saveSpace] Missing restaurantId in request body');
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'restaurantId is required',
                error: {},
                data: null
            });
        }

        const result = await savedSpaceService.saveSpace(customerId, restaurantId);
        console.log('[saveSpace] Space saved successfully:', result);
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Space saved successfully',
            error: {},
            data: result
        });
    } catch (error) {
        console.log('[saveSpace] Error:', error.message);
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
        console.log('[unsaveSpace] Request received - customerId:', customerId, 'restaurantId:', restaurantId);
        const result = await savedSpaceService.unsaveSpace(customerId, restaurantId);
        console.log('[unsaveSpace] Space unsaved successfully');
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Space unsaved successfully',
            error: {},
            data: result
        });
    } catch (error) {
        console.log('[unsaveSpace] Error:', error.message);
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
        console.log('[getSavedSpaces] Request received - customerId:', customerId);
        const savedSpaces = await savedSpaceService.getSavedSpaces(customerId);
        console.log('[getSavedSpaces] Found', savedSpaces.length, 'saved spaces');
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Saved spaces fetched successfully',
            error: {},
            data: savedSpaces
        });
    } catch (error) {
        console.log('[getSavedSpaces] Error:', error.message);
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
        console.log('[checkIfSaved] Request received - customerId:', customerId, 'restaurantId:', restaurantId);
        const isSaved = await savedSpaceService.isSpaceSaved(customerId, restaurantId);
        console.log('[checkIfSaved] Result:', isSaved);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Check completed',
            error: {},
            data: { isSaved }
        });
    } catch (error) {
        console.log('[checkIfSaved] Error:', error.message);
        next(error);
    }
}

module.exports = {
    saveSpace,
    unsaveSpace,
    getSavedSpaces,
    checkIfSaved
};

