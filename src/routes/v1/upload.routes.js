const express = require('express');
const { UploadController } = require('../../controllers');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { uploadSingle, uploadGalleryImage, uploadMenuPdf } = require('../../middleware/upload.middleware');

const router = express.Router();

// Upload cuisine image (Admin only)
router.post('/cuisine-image', authenticate, authorize('Admin'), uploadSingle, UploadController.uploadCuisineImage);

// Upload gallery image (Restaurant only)
router.post('/gallery-image', authenticate, authorize('Restaurant'), uploadGalleryImage, UploadController.uploadGalleryImage);

// Upload menu PDF (Restaurant only)
router.post('/menu-pdf', authenticate, authorize('Restaurant'), uploadMenuPdf, UploadController.uploadMenuPdf);

module.exports = router;

