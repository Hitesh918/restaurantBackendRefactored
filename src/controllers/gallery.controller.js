const { StatusCodes } = require('http-status-codes');
const GalleryService = require('../services/gallery.service');
const MediaRepository = require('../repositories/media.repository');
const RestaurantRepository = require('../repositories/restaurant.repository');

const mediaRepository = new MediaRepository();
const restaurantRepository = new RestaurantRepository();
const galleryService = new GalleryService(mediaRepository, restaurantRepository);

/**
 * GET /restaurant/gallery/my
 * Get all gallery items for the logged-in restaurant
 */
async function getMyGalleryItems(req, res, next) {
    try {
        // Get restaurant - try userId first (for new tokens), then try id as restaurant._id (for old tokens)
        let restaurant = null;
        if (req.user.userId) {
            restaurant = await restaurantRepository.findByUserId(req.user.userId);
        }
        
        // Fallback: if not found and we have id, try finding restaurant by _id (for backward compatibility)
        if (!restaurant && req.user.id) {
            restaurant = await restaurantRepository.findById(req.user.id);
        }
        
        if (!restaurant) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Restaurant not found for this user',
                error: {},
                data: null
            });
        }

        const filters = {
            status: req.query.status,
            search: req.query.search,
        };

        const items = await galleryService.getGalleryItems(restaurant._id, filters);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Gallery items fetched successfully',
            error: {},
            data: items
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /restaurant/gallery/:id
 * Get single gallery item by ID
 */
async function getGalleryItemById(req, res, next) {
    try {
        const item = await galleryService.getGalleryItemById(req.params.id);
        
        // Verify ownership if user is restaurant
        if (req.user.role === 'Restaurant') {
            let restaurant = null;
            if (req.user.userId) {
                restaurant = await restaurantRepository.findByUserId(req.user.userId);
            }
            
            if (!restaurant && req.user.id) {
                restaurant = await restaurantRepository.findById(req.user.id);
            }
            
            if (!restaurant || item.ownerId.toString() !== restaurant._id.toString()) {
                return res.status(StatusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'You do not have permission to view this gallery item',
                    error: {},
                    data: null
                });
            }
        }
        
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Gallery item fetched successfully',
            error: {},
            data: item
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /restaurant/gallery
 * Create a new gallery item
 */
async function createGalleryItem(req, res, next) {
    try {
        // Get restaurant - try userId first (for new tokens), then try id as restaurant._id (for old tokens)
        let restaurant = null;
        if (req.user.userId) {
            restaurant = await restaurantRepository.findByUserId(req.user.userId);
        }
        
        // Fallback: if not found and we have id, try finding restaurant by _id (for backward compatibility)
        if (!restaurant && req.user.id) {
            restaurant = await restaurantRepository.findById(req.user.id);
        }
        
        if (!restaurant) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Restaurant not found for this user',
                error: {},
                data: null
            });
        }

        const item = await galleryService.createGalleryItem(restaurant._id, req.body);
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Gallery item created successfully',
            error: {},
            data: item
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /restaurant/gallery/:id
 * Update gallery item
 */
async function updateGalleryItem(req, res, next) {
    try {
        // Get restaurant - try userId first (for new tokens), then try id as restaurant._id (for old tokens)
        let restaurant = null;
        if (req.user.userId) {
            restaurant = await restaurantRepository.findByUserId(req.user.userId);
        }
        
        // Fallback: if not found and we have id, try finding restaurant by _id (for backward compatibility)
        if (!restaurant && req.user.id) {
            restaurant = await restaurantRepository.findById(req.user.id);
        }
        
        if (!restaurant) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Restaurant not found for this user',
                error: {},
                data: null
            });
        }

        const updated = await galleryService.updateGalleryItem(req.params.id, restaurant._id, req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Gallery item updated successfully',
            error: {},
            data: updated
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /restaurant/gallery/:id
 * Delete gallery item
 */
async function deleteGalleryItem(req, res, next) {
    try {
        // Get restaurant - try userId first (for new tokens), then try id as restaurant._id (for old tokens)
        let restaurant = null;
        if (req.user.userId) {
            restaurant = await restaurantRepository.findByUserId(req.user.userId);
        }
        
        // Fallback: if not found and we have id, try finding restaurant by _id (for backward compatibility)
        if (!restaurant && req.user.id) {
            restaurant = await restaurantRepository.findById(req.user.id);
        }
        
        if (!restaurant) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Restaurant not found for this user',
                error: {},
                data: null
            });
        }

        await galleryService.deleteGalleryItem(req.params.id, restaurant._id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Gallery item deleted successfully',
            error: {},
            data: null
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getMyGalleryItems,
    getGalleryItemById,
    createGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
};

