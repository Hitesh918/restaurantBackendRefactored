const { StatusCodes } = require('http-status-codes');
const { RestaurantProfileRepository } = require('../repositories');

class MenuManagementController {
    constructor(menuManagementService) {
        this.menuManagementService = menuManagementService;
        this.restaurantProfileRepository = new RestaurantProfileRepository();
    }

    async getAllMenus(req, res, next) {
        try {
            // Use userId if available, fallback to id (same pattern as rooms and gallery)
            const userId = req.user.userId || req.user.id;
            console.log('Menu Management: Looking for restaurant profile with userId:', userId);
            
            // First find the restaurant profile for this user
            const profile = await this.restaurantProfileRepository.findByUserId(userId);
            console.log('Menu Management: Found profile:', profile ? profile._id : 'null');
            
            if (!profile) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: 'Restaurant profile not found for this user',
                    error: {},
                    data: null
                });
            }

            const menus = await this.menuManagementService.getAllMenusForProfile(profile._id);
            
            res.status(StatusCodes.OK).json({
                success: true,
                data: menus
            });
        } catch (error) {
            next(error);
        }
    }

    async getMenuStats(req, res, next) {
        try {
            // Use userId if available, fallback to id (same pattern as rooms and gallery)
            const userId = req.user.userId || req.user.id;
            console.log('Menu Stats: Looking for restaurant profile with userId:', userId);
            
            // First find the restaurant profile for this user
            const profile = await this.restaurantProfileRepository.findByUserId(userId);
            console.log('Menu Stats: Found profile:', profile ? profile._id : 'null');
            
            if (!profile) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: 'Restaurant profile not found for this user',
                    error: {},
                    data: null
                });
            }

            const stats = await this.menuManagementService.getMenuStatsForProfile(profile._id);
            
            res.status(StatusCodes.OK).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    async getProfileMenus(req, res, next) {
        try {
            const { profileId } = req.params;
            const menus = await this.menuManagementService.getAllMenusForProfile(profileId);
            
            res.status(StatusCodes.OK).json({
                success: true,
                data: menus
            });
        } catch (error) {
            next(error);
        }
    }

    async getProfileMenuStats(req, res, next) {
        try {
            const { profileId } = req.params;
            const stats = await this.menuManagementService.getMenuStatsForProfile(profileId);
            
            res.status(StatusCodes.OK).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = MenuManagementController;