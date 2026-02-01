const multer = require('multer');
const path = require('path');
const fs = require('fs');
const BaseError = require('../errors/base.error');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const cuisineImagesDir = path.join(uploadsDir, 'cuisines');
const galleryImagesDir = path.join(uploadsDir, 'gallery');
const menuPdfsDir = path.join(uploadsDir, 'menus');
const generalImagesDir = path.join(uploadsDir, 'images');

[uploadsDir, cuisineImagesDir, galleryImagesDir, menuPdfsDir, generalImagesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Storage for cuisine images
const cuisineStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, cuisineImagesDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// Storage for gallery images
const galleryStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, galleryImagesDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// Storage for menu PDFs
const menuStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, menuPdfsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// Storage for general images (restaurant profiles, etc.)
const generalImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, generalImagesDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

// File filter - only images
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new BaseError('Only image files (jpeg, jpg, png, gif, webp) are allowed', 400));
    }
};

// File filter - only PDFs
const pdfFilter = (req, file, cb) => {
    const allowedTypes = /pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new BaseError('Only PDF files are allowed', 400));
    }
};

// Configure multer for cuisine images
const cuisineUpload = multer({
    storage: cuisineStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: imageFilter
});

// Configure multer for gallery images
const galleryUpload = multer({
    storage: galleryStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: imageFilter
});

// Configure multer for menu PDFs
const menuUpload = multer({
    storage: menuStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: pdfFilter
});

// Configure multer for general images
const generalImageUpload = multer({
    storage: generalImageStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: imageFilter
});

module.exports = {
    uploadSingle: cuisineUpload.single('image'),
    uploadMultiple: cuisineUpload.array('images', 10),
    uploadGalleryImage: galleryUpload.single('image'),
    uploadMenuPdf: menuUpload.single('pdf'),
    uploadGeneralImage: generalImageUpload.single('image')
};

