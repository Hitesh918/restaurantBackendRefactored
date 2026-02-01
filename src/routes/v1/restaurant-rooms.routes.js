const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const {
    RestaurantRoomRepository,
    RestaurantProfileRepository
} = require('../../repositories');

const { RestaurantRoomService } = require('../../services');
const { RestaurantRoomController } = require('../../controllers');

const { authenticate, authorize } = require('../../middleware/auth.middleware');

// Multer configuration for file uploads
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { id } = req.params;
        let uploadPath = path.join(__dirname, '../../../uploads/rooms', id);
        
        if (file.fieldname === 'photo') {
            uploadPath = path.join(uploadPath, 'photos');
        } else if (file.fieldname === 'menu') {
            uploadPath = path.join(uploadPath, 'menus');
        } else if (file.fieldname === 'floorplan') {
            uploadPath = path.join(uploadPath, 'floorplan');
        }
        
        // Create directory if it doesn't exist
        fs.mkdirSync(uploadPath, { recursive: true });
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'photo') {
        // Accept images only (for both regular photos and past event photos)
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for photos'), false);
        }
    } else if (file.fieldname === 'menu' || file.fieldname === 'floorplan') {
        // Accept PDFs only
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed for menus and floorplans'), false);
        }
    } else {
        cb(new Error('Invalid field name'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Initialize dependencies
const restaurantRoomRepository = new RestaurantRoomRepository();
const restaurantProfileRepository = new RestaurantProfileRepository();

const restaurantRoomService = new RestaurantRoomService(
    restaurantRoomRepository,
    restaurantProfileRepository
);

const restaurantRoomController = new RestaurantRoomController(restaurantRoomService);

// Public routes
router.get('/search', (req, res, next) => restaurantRoomController.searchRooms(req, res, next));
router.get('/:id', (req, res, next) => restaurantRoomController.getRoom(req, res, next));
router.get('/profile/:profileId', (req, res, next) => restaurantRoomController.getRoomsByProfile(req, res, next));

// Admin routes
router.get('/', authenticate, authorize('Admin'), (req, res, next) => 
    restaurantRoomController.getAllRooms(req, res, next)
);
router.post('/', authenticate, authorize('Admin', 'Restaurant'), (req, res, next) => 
    restaurantRoomController.createRoom(req, res, next)
);
router.put('/:id', authenticate, authorize('Admin', 'Restaurant'), (req, res, next) => 
    restaurantRoomController.updateRoom(req, res, next)
);
router.delete('/:id', authenticate, authorize('Admin', 'Restaurant'), (req, res, next) => 
    restaurantRoomController.deleteRoom(req, res, next)
);

// Restaurant owner routes
router.get('/my/rooms', authenticate, authorize('Restaurant'), (req, res, next) => 
    restaurantRoomController.getMyRooms(req, res, next)
);

// Media upload routes
router.post('/:id/photos', authenticate, authorize('Admin', 'Restaurant'), upload.single('photo'), (req, res, next) => 
    restaurantRoomController.uploadPhoto(req, res, next)
);
router.put('/:id/photos/:photoId', authenticate, authorize('Admin', 'Restaurant'), (req, res, next) => 
    restaurantRoomController.updatePhoto(req, res, next)
);
router.put('/:id/photos/:photoId/primary', authenticate, authorize('Admin', 'Restaurant'), (req, res, next) => 
    restaurantRoomController.setPrimaryPhoto(req, res, next)
);
router.delete('/:id/photos/:photoId', authenticate, authorize('Admin', 'Restaurant'), (req, res, next) => 
    restaurantRoomController.deletePhoto(req, res, next)
);

router.post('/:id/menus', authenticate, authorize('Admin', 'Restaurant'), upload.single('menu'), (req, res, next) => 
    restaurantRoomController.uploadMenu(req, res, next)
);
router.put('/:id/menus/:menuId', authenticate, authorize('Admin', 'Restaurant'), (req, res, next) => 
    restaurantRoomController.updateMenu(req, res, next)
);
router.delete('/:id/menus/:menuId', authenticate, authorize('Admin', 'Restaurant'), (req, res, next) => 
    restaurantRoomController.deleteMenu(req, res, next)
);

router.post('/:id/floorplan', authenticate, authorize('Admin', 'Restaurant'), upload.single('floorplan'), (req, res, next) => 
    restaurantRoomController.uploadFloorplan(req, res, next)
);
router.delete('/:id/floorplan', authenticate, authorize('Admin', 'Restaurant'), (req, res, next) => 
    restaurantRoomController.deleteFloorplan(req, res, next)
);

// Tours routes
router.post('/:id/tours', authenticate, authorize('Admin', 'Restaurant'), (req, res, next) => 
    restaurantRoomController.addTour(req, res, next)
);
router.delete('/:id/tours/:tourId', authenticate, authorize('Admin', 'Restaurant'), (req, res, next) => 
    restaurantRoomController.deleteTour(req, res, next)
);

// Past events routes
router.post('/:id/past-events', authenticate, authorize('Admin', 'Restaurant'), upload.single('photo'), (req, res, next) => 
    restaurantRoomController.uploadPastEvent(req, res, next)
);
router.delete('/:id/past-events/:eventId', authenticate, authorize('Admin', 'Restaurant'), (req, res, next) => 
    restaurantRoomController.deletePastEvent(req, res, next)
);

module.exports = router;