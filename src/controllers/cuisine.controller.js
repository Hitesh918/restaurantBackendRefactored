const { CuisineService } = require('../services');
const CuisineRepository = require('../repositories/cuisine.repository');
const { StatusCodes } = require('http-status-codes');

const cuisineService = new CuisineService(new CuisineRepository());

/**
 * POST /cuisines
 * Create a new cuisine
 */
async function createCuisine(req, res, next) {
    try {
        const result = await cuisineService.createCuisine(req.body);
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Cuisine created successfully',
            error: {},
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /cuisines
 * Get all cuisines with optional filters
 */
async function getAllCuisines(req, res, next) {
    try {
        const filters = {
            status: req.query.status,
            search: req.query.search,
        };
        
        const cuisines = await cuisineService.getAllCuisines(filters);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Cuisines retrieved successfully',
            error: {},
            data: cuisines
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /cuisines/:id
 * Get cuisine by ID
 */
async function getCuisineById(req, res, next) {
    try {
        const cuisine = await cuisineService.getCuisineById(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Cuisine retrieved successfully',
            error: {},
            data: cuisine
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /cuisines/:id
 * Update cuisine
 */
async function updateCuisine(req, res, next) {
    try {
        const result = await cuisineService.updateCuisine(req.params.id, req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Cuisine updated successfully',
            error: {},
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /cuisines/:id
 * Delete cuisine
 */
async function deleteCuisine(req, res, next) {
    try {
        await cuisineService.deleteCuisine(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Cuisine deleted successfully',
            error: {},
            data: null
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createCuisine,
    getAllCuisines,
    getCuisineById,
    updateCuisine,
    deleteCuisine
};

