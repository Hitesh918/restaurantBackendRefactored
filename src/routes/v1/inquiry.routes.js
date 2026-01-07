const express = require('express');
const { InquiryController } = require('../../controllers');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/server.config');

const router = express.Router();

// Optional authentication middleware - doesn't fail if no token
const optionalAuthenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.substring(7);
        
        if (!token) {
            req.user = null;
            return next();
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = {
                id: decoded.id,
                userId: decoded.userId || decoded.id,
                email: decoded.email,
                role: decoded.role
            };
        } catch (error) {
            // Invalid token, but continue as public inquiry
            req.user = null;
        }
        
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

// Create inquiry - public endpoint but can accept optional auth
router.post('/', optionalAuthenticate, InquiryController.createInquiry);

module.exports = router;

