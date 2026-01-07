const BaseError = require("../errors/base.error");
const { StatusCodes } = require('http-status-codes');
const { NODE_ENV } = require('../config/server.config');

function errorHandler(err, req, res, next) {
    if(err instanceof BaseError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: err.details || {},
            data: null
        });
    }

    // Log error in development
    if (NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    // Don't leak error details in production
    const errorMessage = NODE_ENV === 'production' 
        ? 'Something went wrong. Please try again later.'
        : err.message || 'Something went wrong!';

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: errorMessage,
        error: NODE_ENV === 'development' ? {
            message: err.message,
            stack: err.stack
        } : {},
        data: null
    });
}

module.exports = errorHandler;