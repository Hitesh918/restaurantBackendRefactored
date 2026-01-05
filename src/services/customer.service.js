class CustomerService {
    constructor(customerRepository, bookingRequestRepository) {
        this.customerRepository = customerRepository;
        this.bookingRequestRepository = bookingRequestRepository;
    }

    async getProfile(customerId) {
        const customer = await this.customerRepository.findById(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        // Use customerId directly (not userId) since BookingRequest references Customer
        const bookingHistory = await this.bookingRequestRepository.getGroupedBookingHistory(customerId);

        return {
            _id: customer._id,
            userId: customer.userId,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            profilePhotoUrl: customer.profilePhotoUrl,
            profileDescription: customer.profileDescription,
            joinedDate: customer.joinedDate,
            bookingHistory
        };
    }

    async updateProfile(customerId, updateData) {
        const allowedFields = ['name', 'phone', 'profilePhotoUrl', 'profileDescription'];
        const filteredData = {};
        for (const key of allowedFields) {
            if (updateData[key] !== undefined) {
                filteredData[key] = updateData[key];
            }
        }
        
        const updatedCustomer = await this.customerRepository.updateCustomer(customerId, filteredData);
        if (!updatedCustomer) {
            throw new Error('Customer not found');
        }
        return updatedCustomer;
    }

    async getAllCustomers() {
        return await this.customerRepository.getAllCustomers();
    }

    async deleteCustomer(id) {
        return await this.customerRepository.deleteCustomer(id);
    }
}

module.exports = CustomerService;
