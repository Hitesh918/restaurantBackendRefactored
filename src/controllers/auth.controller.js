const { AuthService } = require('../services');
const { UserRepository, CustomerRepository, RestaurantRepository, SubscriptionRepository } = require('../repositories');
const { StatusCodes } = require('http-status-codes');

const authService = new AuthService(
    new UserRepository(),
    new CustomerRepository(),
    new RestaurantRepository(),
    new SubscriptionRepository()
);

/**
 * POST /auth/signup
 * Unified signup for all roles
 */
async function signup(req, res, next) {
    try {
        const result = await authService.signup(req.body);
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Successfully registered',
            error: {},
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /auth/login
 */
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'email and password are required',
                error: { required: ['email', 'password'] },
                data: null
            });
        }
        const result = await authService.login(email, password);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully logged in',
            error: {},
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /auth/update-password
 */
async function updatePassword(req, res, next) {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'email and newPassword are required',
                error: {},
                data: null
            });
        }
        const result = await authService.updatePassword(email, newPassword);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully updated password',
            error: {},
            data: result
        });
    } catch (error) {
        next(error);
    }
}

// Legacy exports for backward compatibility
const registerUser = signup;
const loginUser = login;

module.exports = {
    signup,
    login,
    registerUser,
    loginUser,
    updatePassword
};
