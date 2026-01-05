const express = require('express');
const { AuthController } = require('../../controllers');

const authRouter = express.Router();

// Unified signup for all roles
authRouter.post('/signup', AuthController.signup);

// Login
authRouter.post('/login', AuthController.login);

// Password management
authRouter.post('/update-password', AuthController.updatePassword);

module.exports = authRouter;
