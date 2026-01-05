const {Customer} = require('../models');

class CustomerRepository {
    async createCustomer(data) {
        const customer = new Customer(data);
        return await customer.save();
    }

    async findById(id) {
        return await Customer.findById(id);
    }

    async findByUserId(userId) {
        return await Customer.findOne({ userId });
    }

    async updateCustomer(id, updateData) {
        return await Customer.findByIdAndUpdate(id, updateData, { new: true });
    }

    async findByEmail(email) {
        return await Customer.findOne({ email });
    }

    async getAllCustomers(){
        return await Customer.find({});
    }

    async deleteCustomer(id){
        return await Customer.findOneAndDelete({ _id: id });
    }



    async subscribePlan(id , planDetails){
        try {
            const customer = await Customer.findOneAndUpdate(
                { _id: id },
                { subscriptionDetails: planDetails  , isSubscribed: true },
                { new: true }
            );

            if (!customer) {
                throw new NotFoundError('Customer not found');
            }

            return { name: customer.name, email: customer.email, plan: customer.plan };
        } catch (err) {
            throw err;
        }
    }

    async unSubscribePlan(id){
        try {
            const customer = await Customer.findOneAndUpdate(
                { _id: id },
                { subscriptionDetails: null, isSubscribed: false },
                { new: true }
            );

            if (!customer) {
                throw new NotFoundError('Customer not found');
            }

            return { name: customer.name, email: customer.email, plan: customer.plan };
        } catch (err) {
            throw err;
        }
    }
}

module.exports = CustomerRepository;