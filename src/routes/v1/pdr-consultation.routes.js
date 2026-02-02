const express = require('express');
const router = express.Router();

const {
    PDRConsultationRepository,
    CustomerRepository
} = require('../../repositories');

const { PDRConsultationService } = require('../../services');
const { PDRConsultationController } = require('../../controllers');

const { authenticate, authorize } = require('../../middleware/auth.middleware');

// Initialize dependencies
const pdrConsultationRepository = new PDRConsultationRepository();
const customerRepository = new CustomerRepository();

const pdrConsultationService = new PDRConsultationService(
    pdrConsultationRepository,
    customerRepository
);

const pdrConsultationController = new PDRConsultationController(pdrConsultationService);

// Public routes
router.post('/', (req, res, next) => 
    pdrConsultationController.createConsultation(req, res, next)
);

// Customer routes (authenticated)
router.get('/customer/:customerId', authenticate, (req, res, next) => 
    pdrConsultationController.getConsultationsByCustomer(req, res, next)
);

// Admin routes (authenticated admin only)
router.get('/', authenticate, authorize('Admin'), (req, res, next) => 
    pdrConsultationController.getAllConsultations(req, res, next)
);

router.get('/stats', authenticate, authorize('Admin'), (req, res, next) => 
    pdrConsultationController.getConsultationStats(req, res, next)
);

router.get('/:id', authenticate, authorize('Admin'), (req, res, next) => 
    pdrConsultationController.getConsultationById(req, res, next)
);

router.put('/:id/status', authenticate, authorize('Admin'), (req, res, next) => 
    pdrConsultationController.updateConsultationStatus(req, res, next)
);

router.put('/:id/assign', authenticate, authorize('Admin'), (req, res, next) => 
    pdrConsultationController.assignSpecialist(req, res, next)
);

module.exports = router;