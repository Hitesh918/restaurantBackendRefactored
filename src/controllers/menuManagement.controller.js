const { StatusCodes } = require('http-status-codes');

class MenuManagementController {
    constructor(menuManagementService) {
        this.menuManagementService = menuManagementService;
    }

    async getAllMenus(req, res, next) {
        try {
            const userId = req.user.id;
            const menus = await this.menuManagementService.getAllMenusForUser(userId);
            
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
            const userId = req.user.id;
            const stats = await this.menuManagementService.getMenuStatsForUser(userId);
            
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