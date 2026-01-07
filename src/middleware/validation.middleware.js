const BaseError = require('../errors/base.error');
const { StatusCodes } = require('http-status-codes');

/**
 * Request validation middleware
 * Validates required fields in request body
 */
const validateRequest = (requiredFields = []) => {
    return (req, res, next) => {
        const missingFields = [];
        
        requiredFields.forEach(field => {
            if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`,
                error: { required: missingFields },
                data: null
            });
        }

        next();
    };
};

/**
 * Email validation
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Password validation
 * Minimum 6 characters
 */
const validatePassword = (password) => {
    return password && password.length >= 6;
};

/**
 * Login validation middleware
 */
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Email and password are required',
            error: { required: ['email', 'password'] },
            data: null
        });
    }

    if (!validateEmail(email)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Invalid email format',
            error: { field: 'email' },
            data: null
        });
    }

    if (!validatePassword(password)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Password must be at least 6 characters long',
            error: { field: 'password' },
            data: null
        });
    }

    next();
};

/**
 * Signup validation middleware
 */
const validateSignup = (req, res, next) => {
    const { email, password, role, fullName } = req.body;

    const missingFields = [];
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!role) missingFields.push('role');
    if (!fullName) missingFields.push('fullName');

    if (missingFields.length > 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: `Missing required fields: ${missingFields.join(', ')}`,
            error: { required: missingFields },
            data: null
        });
    }

    if (!validateEmail(email)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Invalid email format',
            error: { field: 'email' },
            data: null
        });
    }

    if (!validatePassword(password)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Password must be at least 6 characters long',
            error: { field: 'password' },
            data: null
        });
    }

    const validRoles = ['admin', 'restaurant', 'customer'];
    if (!validRoles.includes(role.toLowerCase())) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
            error: { field: 'role' },
            data: null
        });
    }

    next();
};

module.exports = {
    validateRequest,
    validateEmail,
    validatePassword,
    validateLogin,
    validateSignup
};

