const BaseError = require('../errors/base.error');

class PDRConsultationService {
    constructor(pdrConsultationRepository, customerRepository) {
        this.pdrConsultationRepository = pdrConsultationRepository;
        this.customerRepository = customerRepository;
    }

    async createConsultation(data) {
        // Validate required fields
        const requiredFields = ['eventType', 'guestCount', 'preferredDate', 'budgetRange', 'fullName', 'email', 'phone'];
        
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new BaseError(`${field} is required`, 400);
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            throw new BaseError('Invalid email format', 400);
        }

        // Validate phone format (basic validation)
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
            throw new BaseError('Invalid phone number format', 400);
        }

        // Validate guest count
        if (data.guestCount < 1 || data.guestCount > 1000) {
            throw new BaseError('Guest count must be between 1 and 1000', 400);
        }

        // Validate preferred date is in the future
        const preferredDate = new Date(data.preferredDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (preferredDate < today) {
            throw new BaseError('Preferred date must be in the future', 400);
        }

        // If customerId is provided, validate customer exists
        if (data.customerId) {
            const customer = await this.customerRepository.findById(data.customerId);
            if (!customer) {
                throw new BaseError('Customer not found', 404);
            }
        }

        // Create consultation request
        const consultation = await this.pdrConsultationRepository.create({
            eventType: data.eventType,
            guestCount: parseInt(data.guestCount),
            preferredDate: new Date(data.preferredDate),
            budgetRange: data.budgetRange,
            specialRequirements: data.specialRequirements || '',
            fullName: data.fullName.trim(),
            email: data.email.toLowerCase().trim(),
            phone: data.phone.trim(),
            customerId: data.customerId || null,
            status: 'pending',
            priority: this.calculatePriority(data),
            source: 'website'
        });

        // TODO: Send notification to PDR specialists
        // await this.notifySpecialists(consultation);

        return consultation;
    }

    calculatePriority(data) {
        // Calculate priority based on budget and guest count
        const budgetPriority = {
            'under-5k': 1,
            '5k-10k': 2,
            '10k-25k': 3,
            '25k-50k': 4,
            'over-50k': 5
        };

        const budget = budgetPriority[data.budgetRange] || 1;
        const guestCount = parseInt(data.guestCount);

        if (budget >= 4 || guestCount >= 100) {
            return 'high';
        } else if (budget >= 3 || guestCount >= 50) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    async getConsultationById(id) {
        const consultation = await this.pdrConsultationRepository.findById(id);
        if (!consultation) {
            throw new BaseError('Consultation not found', 404);
        }
        return consultation;
    }

    async getConsultationsByCustomer(customerId) {
        // Validate customer exists
        const customer = await this.customerRepository.findById(customerId);
        if (!customer) {
            throw new BaseError('Customer not found', 404);
        }

        return await this.pdrConsultationRepository.findByCustomerId(customerId);
    }

    async getAllConsultations(filters = {}) {
        return await this.pdrConsultationRepository.findAll(filters);
    }

    async updateConsultationStatus(id, status, notes = null) {
        const consultation = await this.pdrConsultationRepository.findById(id);
        if (!consultation) {
            throw new BaseError('Consultation not found', 404);
        }

        const validStatuses = ['pending', 'contacted', 'scheduled', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new BaseError('Invalid status', 400);
        }

        return await this.pdrConsultationRepository.updateStatus(id, status, notes);
    }

    async assignSpecialist(id, specialistId, specialistName) {
        const consultation = await this.pdrConsultationRepository.findById(id);
        if (!consultation) {
            throw new BaseError('Consultation not found', 404);
        }

        return await this.pdrConsultationRepository.assignSpecialist(id, specialistId, specialistName);
    }

    async getConsultationStats() {
        return await this.pdrConsultationRepository.getStats();
    }

    async getPendingCount() {
        return await this.pdrConsultationRepository.getPendingCount();
    }

    // TODO: Implement notification system
    async notifySpecialists(consultation) {
        // Send email/SMS notifications to available specialists
        console.log('New PDR consultation request:', consultation._id);
    }
}

module.exports = PDRConsultationService;