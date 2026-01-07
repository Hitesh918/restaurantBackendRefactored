const { StatusCodes } = require('http-status-codes');
const MenuService = require('../services/menu.service');
const MediaRepository = require('../repositories/media.repository');
const RestaurantRepository = require('../repositories/restaurant.repository');

const mediaRepository = new MediaRepository();
const restaurantRepository = new RestaurantRepository();
const menuService = new MenuService(mediaRepository, restaurantRepository);

/**
 * GET /restaurant/menu/my
 * Get menu for the logged-in restaurant
 */
async function getMyMenu(req, res, next) {
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

        const menu = await menuService.getMenu(restaurant._id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Menu fetched successfully',
            error: {},
            data: menu
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /restaurant/menu/upload
 * Upload menu PDF
 */
async function uploadMenu(req, res, next) {
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

        if (!req.body.menuUrl) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Menu PDF URL is required',
                error: {},
                data: null
            });
        }

        const menu = await menuService.uploadMenu(restaurant._id, req.body.menuUrl);
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Menu uploaded successfully',
            error: {},
            data: menu
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /restaurant/menu/my
 * Delete menu
 */
async function deleteMenu(req, res, next) {
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

        await menuService.deleteMenu(restaurant._id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Menu deleted successfully',
            error: {},
            data: null
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getMyMenu,
    uploadMenu,
    deleteMenu,
};

