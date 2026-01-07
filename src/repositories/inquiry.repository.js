const Inquiry = require('../models/inquiry.model');

class InquiryRepository {
    async create(data) {
        try {
            const inquiry = await Inquiry.create(data);
            return inquiry;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async findById(id) {
        try {
            return await Inquiry.findById(id)
                .populate('customerId', 'name email phone')
                .populate('respondedBy', 'fullName email')
                .lean();
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async findByRestaurantId(restaurantId, filters = {}) {
        try {
            const query = { restaurantId };
            
            // Filter by status
            if (filters.status && filters.status !== 'all') {
                query.status = filters.status;
            }
            
            // Filter by priority
            if (filters.priority) {
                query.priority = filters.priority;
            }
            
            // Search by subject or message
            if (filters.search) {
                query.$or = [
                    { subject: { $regex: filters.search, $options: 'i' } },
                    { message: { $regex: filters.search, $options: 'i' } },
                    { name: { $regex: filters.search, $options: 'i' } },
                    { email: { $regex: filters.search, $options: 'i' } },
                ];
            }
            
            const inquiries = await Inquiry.find(query)
                .populate('customerId', 'name email phone')
                .populate('respondedBy', 'fullName email')
                .sort({ createdAt: -1 })
                .lean();
            
            return inquiries;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updateStatus(id, status, responseMessage = null, respondedBy = null) {
        try {
            const updateData = { status };
            
            if (status === 'responded' && responseMessage) {
                updateData.responseMessage = responseMessage;
                updateData.respondedAt = new Date();
                if (respondedBy) {
                    updateData.respondedBy = respondedBy;
                }
            }
            
            return await Inquiry.findByIdAndUpdate(id, updateData, { new: true });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async update(id, updateData) {
        try {
            return await Inquiry.findByIdAndUpdate(id, updateData, { new: true });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async delete(id) {
        try {
            return await Inquiry.findByIdAndDelete(id);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async findByCustomerId(customerId) {
        try {
            return await Inquiry.find({ customerId })
                .populate('restaurantId', 'restaurantName address geo rating')
                .populate('respondedBy', 'fullName email')
                .sort({ createdAt: -1 })
                .lean();
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getStatusCounts(restaurantId) {
        try {
            const counts = await Inquiry.aggregate([
                { $match: { restaurantId: restaurantId } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]);
            
            const result = {
                new: 0,
                responded: 0,
                archived: 0,
            };
            
            counts.forEach(item => {
                if (result.hasOwnProperty(item._id)) {
                    result[item._id] = item.count;
                }
            });
            
            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}

module.exports = InquiryRepository;

