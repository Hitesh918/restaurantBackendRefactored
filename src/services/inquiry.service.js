const BaseError = require('../errors/base.error');

class InquiryService {
    constructor(inquiryRepository, restaurantRepository) {
        this.inquiryRepository = inquiryRepository;
        this.restaurantRepository = restaurantRepository;
    }

    async createInquiry(data) {
        if (!data.restaurantId) {
            throw new BaseError('restaurantId is required', 400);
        }
        if (!data.name || !data.email || !data.subject || !data.message) {
            throw new BaseError('Name, email, subject, and message are required', 400);
        }

        // Validate restaurant exists
        const restaurant = await this.restaurantRepository.findById(data.restaurantId);
        if (!restaurant) {
            throw new BaseError('Restaurant not found', 404);
        }

        const inquiry = await this.inquiryRepository.create(data);
        return inquiry;
    }

    async getInquiriesByRestaurant(restaurantId, filters = {}) {
        const inquiries = await this.inquiryRepository.findByRestaurantId(restaurantId, filters);
        return inquiries;
    }

    async getInquiryById(id) {
        const inquiry = await this.inquiryRepository.findById(id);
        if (!inquiry) {
            throw new BaseError('Inquiry not found', 404);
        }
        return inquiry;
    }

    async updateInquiryStatus(id, status, responseMessage = null, respondedBy = null) {
        const inquiry = await this.inquiryRepository.findById(id);
        if (!inquiry) {
            throw new BaseError('Inquiry not found', 404);
        }

        const updated = await this.inquiryRepository.updateStatus(id, status, responseMessage, respondedBy);
        return updated;
    }

    async updateInquiry(id, updateData) {
        const inquiry = await this.inquiryRepository.findById(id);
        if (!inquiry) {
            throw new BaseError('Inquiry not found', 404);
        }

        const updated = await this.inquiryRepository.update(id, updateData);
        return updated;
    }

    async deleteInquiry(id) {
        const inquiry = await this.inquiryRepository.findById(id);
        if (!inquiry) {
            throw new BaseError('Inquiry not found', 404);
        }

        await this.inquiryRepository.delete(id);
        return { success: true };
    }

    async getStatusCounts(restaurantId) {
        return await this.inquiryRepository.getStatusCounts(restaurantId);
    }
}

module.exports = InquiryService;

