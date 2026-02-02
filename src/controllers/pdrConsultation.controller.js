const { StatusCodes } = require('http-status-codes');

class PDRConsultationController {
    constructor(pdrConsultationService) {
        this.pdrConsultationService = pdrConsultationService;
    }

    async createConsultation(req, res, next) {
        try {
            const consultation = await this.pdrConsultationService.createConsultation(req.body);
            
            res.status(StatusCodes.CREATED).json({
                success: true,
                message: 'PDR consultation request submitted successfully',
                error: {},
                data: consultation
            });
        } catch (error) {
            next(error);
        }
    }

    async getConsultationById(req, res, next) {
        try {
            const { id } = req.params;
            const consultation = await this.pdrConsultationService.getConsultationById(id);
            
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Consultation fetched successfully',
                error: {},
                data: consultation
            });
        } catch (error) {
            next(error);
        }
    }

    async getConsultationsByCustomer(req, res, next) {
        try {
            const { customerId } = req.params;
            const consultations = await this.pdrConsultationService.getConsultationsByCustomer(customerId);
            
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Customer consultations fetched successfully',
                error: {},
                data: consultations
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllConsultations(req, res, next) {
        try {
            const filters = {
                status: req.query.status,
                assignedSpecialistId: req.query.assignedSpecialistId,
                eventType: req.query.eventType,
                budgetRange: req.query.budgetRange,
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo
            };

            // Remove undefined filters
            Object.keys(filters).forEach(key => {
                if (filters[key] === undefined) {
                    delete filters[key];
                }
            });

            const consultations = await this.pdrConsultationService.getAllConsultations(filters);
            
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Consultations fetched successfully',
                error: {},
                data: consultations
            });
        } catch (error) {
            next(error);
        }
    }

    async updateConsultationStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;
            
            const consultation = await this.pdrConsultationService.updateConsultationStatus(id, status, notes);
            
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Consultation status updated successfully',
                error: {},
                data: consultation
            });
        } catch (error) {
            next(error);
        }
    }

    async assignSpecialist(req, res, next) {
        try {
            const { id } = req.params;
            const { specialistId, specialistName } = req.body;
            
            const consultation = await this.pdrConsultationService.assignSpecialist(id, specialistId, specialistName);
            
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Specialist assigned successfully',
                error: {},
                data: consultation
            });
        } catch (error) {
            next(error);
        }
    }

    async getConsultationStats(req, res, next) {
        try {
            const stats = await this.pdrConsultationService.getConsultationStats();
            
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Consultation stats fetched successfully',
                error: {},
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PDRConsultationController;