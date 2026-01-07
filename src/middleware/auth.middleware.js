const jwt = require('jsonwebtoken');
const BaseError = require('../errors/base.error');
const { JWT_SECRET } = require('../config/server.config');

/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header
 */
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new BaseError('No token provided', 401, 'AUTH_NO_TOKEN');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        if (!token) {
            throw new BaseError('No token provided', 401, 'AUTH_NO_TOKEN');
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Attach user info to request
        req.user = {
            id: decoded.id,
            userId: decoded.userId || decoded.id, // userId for restaurant lookups, fallback to id
            email: decoded.email,
            role: decoded.role
        };
        
        next();
    } catch (error) {
        if (error instanceof BaseError) {
            return next(error);
        }
        
        if (error.name === 'JsonWebTokenError') {
            return next(new BaseError('Invalid token', 401, 'AUTH_INVALID_TOKEN'));
        }
        
        if (error.name === 'TokenExpiredError') {
            return next(new BaseError('Token expired', 401, 'AUTH_TOKEN_EXPIRED'));
        }
        
        return next(new BaseError('Authentication failed', 401, 'AUTH_FAILED'));
    }
};

/**
 * Role-based authorization middleware
 * @param {string[]} allowedRoles - Array of allowed roles (e.g., ['Admin', 'Restaurant'])
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new BaseError('Authentication required', 401, 'AUTH_REQUIRED'));
        }

        const userRole = req.user.role;
        const normalizedRoles = allowedRoles.map(role => 
            role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
        );

        if (!normalizedRoles.includes(userRole)) {
            return next(new BaseError(
                `Access denied. Required roles: ${allowedRoles.join(', ')}`,
                403,
                'AUTH_INSUFFICIENT_PERMISSIONS'
            ));
        }

        next();
    };
};

module.exports = {
    authenticate,
    authorize
};

