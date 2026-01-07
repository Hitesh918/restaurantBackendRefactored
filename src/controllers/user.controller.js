const { UserService } = require('../services');
const UserRepository = require('../repositories/user.repository');
const RestaurantRepository = require('../repositories/restaurant.repository');
const SubscriptionRepository = require('../repositories/subscription.repository');
const { StatusCodes } = require('http-status-codes');

const userService = new UserService(
    new UserRepository(),
    new RestaurantRepository(),
    new SubscriptionRepository()
);

/**
 * GET /users/restaurants
 * Get all restaurant users with subscription details
 */
async function getRestaurantUsers(req, res, next) {
    try {
        const users = await userService.getRestaurantUsers();
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully fetched restaurant users',
            error: {},
            data: users
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /users
 * Get all users
 */
async function getAllUsers(req, res, next) {
    try {
        const users = await userService.getAllUsers();
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully fetched all users',
            error: {},
            data: users
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /users/:id
 * Get user by ID
 */
async function getUserById(req, res, next) {
    try {
        const user = await userService.getUserById(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully fetched user',
            error: {},
            data: user
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /users/:id
 * Update user
 */
async function updateUser(req, res, next) {
    try {
        const updated = await userService.updateUser(req.params.id, req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully updated user',
            error: {},
            data: updated
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /users/:id
 * Delete user
 */
async function deleteUser(req, res, next) {
    try {
        await userService.deleteUser(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully deleted user',
            error: {},
            data: null
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getRestaurantUsers,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};

