const express = require('express');
const { CRMController } = require('../../controllers');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication and restaurant role
router.use(authenticate);
router.use(authorize('Restaurant'));

// Get CRM KPIs
router.get('/kpis', CRMController.getKPIs);

// Get events
router.get('/events', CRMController.getEvents);

// Get clients
router.get('/clients', CRMController.getClients);

// Get feedback
router.get('/feedback', CRMController.getFeedback);

module.exports = router;

