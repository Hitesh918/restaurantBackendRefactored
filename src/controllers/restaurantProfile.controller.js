const { StatusCodes } = require('http-status-codes');
const BaseError = require('../errors/base.error');

class RestaurantProfileController {
    constructor(restaurantProfileService) {
        this.restaurantProfileService = restaurantProfileService;
    }

    async createProfile(req, res, next) {
        try {
            const result = await this.restaurantProfileService.createProfile(req.body);
            res.status(StatusCodes.CREATED).json({
                success: true,
                message: 'Restaurant profile created successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req, res, next) {
        try {
            const { id } = req.params;
            const profile = await this.restaurantProfileService.getProfile(id);
            res.status(StatusCodes.OK).json({
                success: true,
                data: profile
            });
        } catch (error) {
            next(error);
        }
    }

    async getMyProfile(req, res, next) {
        try {
            // Use userId if available, fallback to id
            const userId = req.user.userId || req.user.id;
            const profile = await this.restaurantProfileService.getProfileByUserId(userId);
            res.status(StatusCodes.OK).json({
                success: true,
                data: profile
            });
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await this.restaurantProfileService.updateProfile(id, req.body);
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Restaurant profile updated successfully',
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }

    async updateMyProfile(req, res, next) {
        try {
            // Use userId if available, fallback to id
            const userId = req.user.userId || req.user.id;
            const profile = await this.restaurantProfileService.getProfileByUserId(userId);
            const updated = await this.restaurantProfileService.updateProfile(profile._id, req.body);
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Restaurant profile updated successfully',
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }

    async createMyProfile(req, res, next) {
        try {
            // Use userId if available, fallback to id
            const userId = req.user.userId || req.user.id;
            const result = await this.restaurantProfileService.createProfileForExistingUser(userId, req.body);
            res.status(StatusCodes.CREATED).json({
                success: true,
                message: 'Restaurant profile created successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllProfiles(req, res, next) {
        try {
            const profiles = await this.restaurantProfileService.getAllProfiles();
            res.status(StatusCodes.OK).json({
                success: true,
                data: profiles
            });
        } catch (error) {
            next(error);
        }
    }

    async searchProfiles(req, res, next) {
        try {
            const profiles = await this.restaurantProfileService.searchProfiles(req.query);
            res.status(StatusCodes.OK).json({
                success: true,
                data: profiles
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteProfile(req, res, next) {
        try {
            const { id } = req.params;
            await this.restaurantProfileService.deleteProfile(id);
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Restaurant profile deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllPublicProfiles(req, res, next) {
        try {
            const profiles = await this.restaurantProfileService.getAllPublicProfiles();
            res.status(StatusCodes.OK).json({
                success: true,
                data: profiles
            });
        } catch (error) {
            next(error);
        }
    }

    async getPublicProfile(req, res, next) {
        try {
            const { id } = req.params;
            const profile = await this.restaurantProfileService.getPublicProfile(id);
            res.status(StatusCodes.OK).json({
                success: true,
                data: profile
            });
        } catch (error) {
            next(error);
        }
    }

    async getFeaturedProfiles(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 6;
            const profiles = await this.restaurantProfileService.getFeaturedProfiles(limit);
            res.status(StatusCodes.OK).json({
                success: true,
                data: profiles
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RestaurantProfileController;