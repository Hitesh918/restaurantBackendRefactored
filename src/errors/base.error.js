class BaseError extends Error {
    constructor(messageOrName, statusCode, description, details) {
        // Handle two common patterns:
        // 1. new BaseError('message', statusCode) - most common
        // 2. new BaseError('name', statusCode, 'description', details) - legacy
        if (description === undefined && details === undefined) {
            // Pattern 1: message and statusCode only
            super(messageOrName);
            this.name = 'BaseError';
            this.statusCode = statusCode;
            this.details = details || {};
        } else {
            // Pattern 2: name, statusCode, description, details
            super(description || messageOrName);
            this.name = messageOrName;
            this.statusCode = statusCode;
            this.details = details || {};
        }
    }
}

module.exports = BaseError;