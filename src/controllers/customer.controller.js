const {CustomerService} = require('../services');
const {CustomerRepository, BookingRequestRepository} = require('../repositories');
const { StatusCodes } = require('http-status-codes');

const customerService = new CustomerService(new CustomerRepository(), new BookingRequestRepository());

async function getProfile(req, res, next) {
    try {
        const profile = await customerService.getProfile(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully fetched customer profile',
            error: {},
            data: profile
        });
    } catch(error) {
        next(error);
    }
}

async function updateProfile(req, res, next) {
    try {
        const updatedCustomer = await customerService.updateProfile(req.params.id, req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully updated customer profile',
            error: {},
            data: updatedCustomer
        });
    } catch(error) {
        next(error);
    }
}

async function getAllCustomers(req, res, next) {
    try {
        const customers = await customerService.getAllCustomers();
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully fetched all customers',
            error: {},
            data: customers
        });
    } catch(error) {
        next(error);
    }
}

async function deleteCustomer(req, res, next) {
    try {
        const deletedCustomer = await customerService.deleteCustomer(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Successfully deleted the customer',
            error: {},
            data: deletedCustomer
        });
    } catch(error) {
        next(error);
    }
}

module.exports = {
    getProfile,
    updateProfile,
    getAllCustomers,
    deleteCustomer
};
