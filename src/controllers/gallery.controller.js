const { StatusCodes } = require('http-status-codes');
const { RestaurantProfileRepository } = require('../repositories');

class GalleryController {
    constructor(galleryService) {
        this.galleryService = galleryService;
        this.restaurantProfileRepository = new RestaurantProfileRepository();
    }

    async getAllPhotos(req, res, next) {
        try {
            // Use userId if available, fallback to id (same pattern as rooms)
            const userId = req.user.userId || req.user.id;
            console.log('Gallery: Looking for restaurant profile with userId:', userId);
            
            // First find the restaurant profile for this user
            const profile = await this.restaurantProfileRepository.findByUserId(userId);
            console.log('Gallery: Found profile:', profile ? profile._id : 'null');
            
            if (!profile) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: 'Restaurant profile not found for this user',
                    error: {},
                    data: null
                });
            }

            const photos = await this.galleryService.getAllPhotosForProfile(profile._id);
            
            res.status(StatusCodes.OK).json({
                success: true,
                data: photos
            });
        } catch (error) {
            next(error);
        }
    }

    async getGalleryStats(req, res, next) {
        try {
            // Use userId if available, fallback to id (same pattern as rooms)
            const userId = req.user.userId || req.user.id;
            console.log('Gallery Stats: Looking for restaurant profile with userId:', userId);
            
            // First find the restaurant profile for this user
            const profile = await this.restaurantProfileRepository.findByUserId(userId);
            console.log('Gallery Stats: Found profile:', profile ? profile._id : 'null');
            
            if (!profile) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: 'Restaurant profile not found for this user',
                    error: {},
                    data: null
                });
            }

            const stats = await this.galleryService.getGalleryStatsForProfile(profile._id);
            
            res.status(StatusCodes.OK).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }

    async getProfilePhotos(req, res, next) {
        try {
            const { profileId } = req.params;
            const photos = await this.galleryService.getAllPhotosForProfile(profileId);
            
            res.status(StatusCodes.OK).json({
                success: true,
                data: photos
            });
        } catch (error) {
            next(error);
        }
    }

    async getProfileStats(req, res, next) {
        try {
            const { profileId } = req.params;
            const stats = await this.galleryService.getGalleryStatsForProfile(profileId);
            
            res.status(StatusCodes.OK).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = GalleryController;