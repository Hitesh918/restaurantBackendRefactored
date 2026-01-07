const express = require('express');
const { AuthController } = require('../../controllers');
const { validateLogin, validateSignup } = require('../../middleware/validation.middleware');
const { authenticate } = require('../../middleware/auth.middleware');

const authRouter = express.Router();

// Unified signup for all roles
authRouter.post('/signup', validateSignup, AuthController.signup);

// Login
authRouter.post('/login', validateLogin, AuthController.login);

// Password management (requires authentication)
authRouter.post('/update-password', authenticate, AuthController.updatePassword);

module.exports = authRouter;
