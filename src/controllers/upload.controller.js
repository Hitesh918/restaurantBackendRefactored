const { StatusCodes } = require('http-status-codes');
const path = require('path');
const { BACKEND_BASE_URL } = require('../config/server.config');
const BaseError = require('../errors/base.error');

/**
 * POST /upload/cuisine-image
 * Upload cuisine image
 */
async function uploadCuisineImage(req, res, next) {
    try {
        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'No image file provided',
                error: {},
                data: null
            });
        }

        // Generate full URL
        const imagePath = `/uploads/cuisines/${req.file.filename}`;
        const imageUrl = `${BACKEND_BASE_URL}${imagePath}`;

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Image uploaded successfully',
            error: {},
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: imagePath,
                url: imageUrl,
                size: req.file.size
            }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /upload/gallery-image
 * Upload gallery image
 */
async function uploadGalleryImage(req, res, next) {
    try {
        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'No image file provided',
                error: {},
                data: null
            });
        }

        // Generate full URL
        const imagePath = `/uploads/gallery/${req.file.filename}`;
        const imageUrl = `${BACKEND_BASE_URL}${imagePath}`;

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Gallery image uploaded successfully',
            error: {},
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: imagePath,
                url: imageUrl,
                size: req.file.size
            }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /upload/menu-pdf
 * Upload menu PDF
 */
async function uploadMenuPdf(req, res, next) {
    try {
        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'No PDF file provided',
                error: {},
                data: null
            });
        }

        // Generate full URL
        const pdfPath = `/uploads/menus/${req.file.filename}`;
        const pdfUrl = `${BACKEND_BASE_URL}${pdfPath}`;

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Menu PDF uploaded successfully',
            error: {},
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: pdfPath,
                url: pdfUrl,
                size: req.file.size
            }
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /upload/image
 * Upload general image (for restaurant profiles, etc.)
 */
async function uploadImage(req, res, next) {
    try {
        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'No image file provided',
                error: {},
                data: null
            });
        }

        // Generate full URL
        const imagePath = `/uploads/images/${req.file.filename}`;
        const imageUrl = `${BACKEND_BASE_URL}${imagePath}`;

        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Image uploaded successfully',
            error: {},
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: imagePath,
                url: imageUrl,
                size: req.file.size
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    uploadCuisineImage,
    uploadGalleryImage,
    uploadMenuPdf,
    uploadImage
};

