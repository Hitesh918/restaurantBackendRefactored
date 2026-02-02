const PDRConsultation = require('../models/pdrConsultation.model');

class PDRConsultationRepository {
    async create(consultationData) {
        const consultation = new PDRConsultation(consultationData);
        return await consultation.save();
    }

    async findById(id) {
        return await PDRConsultation.findById(id)
            .populate('customerId', 'name email phone')
            .populate('assignedSpecialistId', 'name email');
    }

    async findByCustomerId(customerId) {
        return await PDRConsultation.find({ customerId })
            .populate('assignedSpecialistId', 'name email')
            .sort({ createdAt: -1 });
    }

    async findByEmail(email) {
        return await PDRConsultation.find({ email })
            .populate('assignedSpecialistId', 'name email')
            .sort({ createdAt: -1 });
    }

    async findAll(filters = {}) {
        const query = {};
        
        if (filters.status) {
            query.status = filters.status;
        }
        
        if (filters.assignedSpecialistId) {
            query.assignedSpecialistId = filters.assignedSpecialistId;
        }
        
        if (filters.eventType) {
            query.eventType = filters.eventType;
        }
        
        if (filters.budgetRange) {
            query.budgetRange = filters.budgetRange;
        }
        
        if (filters.dateFrom || filters.dateTo) {
            query.preferredDate = {};
            if (filters.dateFrom) {
                query.preferredDate.$gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
                query.preferredDate.$lte = new Date(filters.dateTo);
            }
        }

        return await PDRConsultation.find(query)
            .populate('customerId', 'name email phone')
            .populate('assignedSpecialistId', 'name email')
            .sort({ createdAt: -1 });
    }

    async updateById(id, updateData) {
        return await PDRConsultation.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('customerId', 'name email phone')
         .populate('assignedSpecialistId', 'name email');
    }

    async updateStatus(id, status, notes = null) {
        const updateData = { status };
        
        if (notes) {
            updateData.notes = notes;
        }
        
        // Set timestamp based on status
        switch (status) {
            case 'contacted':
                updateData.contactedAt = new Date();
                break;
            case 'scheduled':
                updateData.scheduledAt = new Date();
                break;
            case 'completed':
                updateData.completedAt = new Date();
                break;
        }
        
        return await this.updateById(id, updateData);
    }

    async assignSpecialist(id, specialistId, specialistName) {
        return await this.updateById(id, {
            assignedSpecialistId: specialistId,
            assignedSpecialistName: specialistName
        });
    }

    async deleteById(id) {
        return await PDRConsultation.findByIdAndDelete(id);
    }

    async getStats() {
        const stats = await PDRConsultation.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalCount = await PDRConsultation.countDocuments();
        
        return {
            total: totalCount,
            byStatus: stats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {})
        };
    }

    async getPendingCount() {
        return await PDRConsultation.countDocuments({ status: 'pending' });
    }
}

module.exports = PDRConsultationRepository;