const express = require('express');

const authRouter = require('./auth.routes');
const planRouter = require('./plan.routes');
const customerRouter = require('./customer.routes');
const restaurantRouter = require('./restaurant.routes');
const bookingRouter = require('./booking.routes');
const eventRouter = require('./event.routes');

const v1Router = express.Router();

v1Router.use('/auth', authRouter);
v1Router.use('/plans', planRouter);
v1Router.use('/customers', customerRouter);
v1Router.use('/restaurants', restaurantRouter);
v1Router.use('/bookings', bookingRouter);
v1Router.use('/events', eventRouter);

module.exports = v1Router;
