const { StatusCodes } = require('http-status-codes');
const MenuService = require('../services/menu.service');
const MediaRepository = require('../repositories/media.repository');
const RestaurantRepository = require('../repositories/restaurant.repository');
const RestaurantProfileRepository = require('../repositories/restaurantProfile.repository');

const mediaRepository = new MediaRepository();
const restaurantRepository = new RestaurantRepository();
const restaurantProfileRepository = new RestaurantProfileRepository();
const menuService = new MenuService(mediaRepository, restaurantRepository);

/**
 * GET /restaurant/menu/my
 * Get menu for the logged-in restaurant
 */
async function getMyMenu(req, res, next) {
    try {
        // Use userId if available, fallback to id (same pattern as rooms)
        const userId = req.user.userId || req.user.id;
        console.log('Menu: Looking for restaurant profile with userId:', userId);
        
        // First find the restaurant profile for this user
        const profile = await restaurantProfileRepository.findByUserId(userId);
        console.log('Menu: Found profile:', profile ? profile._id : 'null');
        
        if (!profile) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Restaurant profile not found for this user',
                error: {},
                data: null
            });
        }

        // For now, we'll use the legacy restaurant system for menus
        // TODO: Update menu system to use RestaurantProfile directly
        let restaurant = await restaurantRepository.findOne({ restaurantProfileId: profile._id });
        console.log('Menu: Found restaurant by profileId:', restaurant ? restaurant._id : 'null');
        
        if (!restaurant) {
            // Fallback: try to find restaurant by userId
            restaurant = await restaurantRepository.findByUserId(userId);
            console.log('Menu: Found restaurant by userId:', restaurant ? restaurant._id : 'null');
        }
        
        if (!restaurant) {
            console.log('Menu: No restaurant record found for profile or userId');
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Restaurant record not found for this profile',
                error: {},
                data: null
            });
        }

        console.log('Menu: Using restaurant ID:', restaurant._id);

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
        // Use userId if available, fallback to id (same pattern as rooms)
        const userId = req.user.userId || req.user.id;
        console.log('Menu Upload: Looking for restaurant profile with userId:', userId);
        
        // First find the restaurant profile for this user
        const profile = await restaurantProfileRepository.findByUserId(userId);
        console.log('Menu Upload: Found profile:', profile ? profile._id : 'null');
        
        if (!profile) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Restaurant profile not found for this user',
                error: {},
                data: null
            });
        }

        // For now, we'll use the legacy restaurant system for menus
        let restaurant = await restaurantRepository.findOne({ restaurantProfileId: profile._id });
        
        if (!restaurant) {
            // Fallback: try to find restaurant by userId
            restaurant = await restaurantRepository.findByUserId(userId);
        }
        
        if (!restaurant) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Restaurant record not found for this profile',
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
        // Use userId if available, fallback to id (same pattern as rooms)
        const userId = req.user.userId || req.user.id;
        console.log('Menu Delete: Looking for restaurant profile with userId:', userId);
        
        // First find the restaurant profile for this user
        const profile = await restaurantProfileRepository.findByUserId(userId);
        console.log('Menu Delete: Found profile:', profile ? profile._id : 'null');
        
        if (!profile) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Restaurant profile not found for this user',
                error: {},
                data: null
            });
        }

        // For now, we'll use the legacy restaurant system for menus
        let restaurant = await restaurantRepository.findOne({ restaurantProfileId: profile._id });
        
        if (!restaurant) {
            // Fallback: try to find restaurant by userId
            restaurant = await restaurantRepository.findByUserId(userId);
        }
        
        if (!restaurant) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Restaurant record not found for this profile',
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

