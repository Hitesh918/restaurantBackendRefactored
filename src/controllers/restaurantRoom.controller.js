const { StatusCodes } = require('http-status-codes');
const BaseError = require('../errors/base.error');

class RestaurantRoomController {
    constructor(restaurantRoomService) {
        this.restaurantRoomService = restaurantRoomService;
    }

    async createRoom(req, res, next) {
        try {
            const result = await this.restaurantRoomService.createRoom(req.body);
            res.status(StatusCodes.CREATED).json({
                success: true,
                message: 'Room created successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getRoom(req, res, next) {
        try {
            const { id } = req.params;
            const room = await this.restaurantRoomService.getRoom(id);
            res.status(StatusCodes.OK).json({
                success: true,
                data: room
            });
        } catch (error) {
            next(error);
        }
    }

    async getRoomsByProfile(req, res, next) {
        try {
            const { profileId } = req.params;
            const rooms = await this.restaurantRoomService.getRoomsByProfile(profileId);
            res.status(StatusCodes.OK).json({
                success: true,
                data: rooms
            });
        } catch (error) {
            next(error);
        }
    }

    async getMyRooms(req, res, next) {
        try {
            // Use userId if available, fallback to id
            const userId = req.user.userId || req.user.id;
            const rooms = await this.restaurantRoomService.getRoomsByOwner(userId);
            res.status(StatusCodes.OK).json({
                success: true,
                data: rooms
            });
        } catch (error) {
            next(error);
        }
    }

    async updateRoom(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await this.restaurantRoomService.updateRoom(id, req.body);
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Room updated successfully',
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteRoom(req, res, next) {
        try {
            const { id } = req.params;
            const result = await this.restaurantRoomService.deleteRoom(id);
            res.status(StatusCodes.OK).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllRooms(req, res, next) {
        try {
            const rooms = await this.restaurantRoomService.getAllRooms();
            res.status(StatusCodes.OK).json({
                success: true,
                data: rooms
            });
        } catch (error) {
            next(error);
        }
    }

    async searchRooms(req, res, next) {
        try {
            const rooms = await this.restaurantRoomService.searchRooms(req.query);
            res.status(StatusCodes.OK).json({
                success: true,
                data: rooms
            });
        } catch (error) {
            next(error);
        }
    }

    // Media Upload Methods
    async uploadPhoto(req, res, next) {
        try {
            const { id } = req.params;
            const { caption, isPrimary } = req.body;
            
            if (!req.file) {
                throw new BaseError('No photo file provided', StatusCodes.BAD_REQUEST);
            }

            const result = await this.restaurantRoomService.uploadPhoto(id, {
                file: req.file,
                caption,
                isPrimary: isPrimary === 'true'
            });

            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Photo uploaded successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async deletePhoto(req, res, next) {
        try {
            const { id, photoId } = req.params;
            const result = await this.restaurantRoomService.deletePhoto(id, photoId);
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Photo deleted successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async updatePhoto(req, res, next) {
        try {
            const { id, photoId } = req.params;
            const { caption } = req.body;
            
            const result = await this.restaurantRoomService.updatePhoto(id, photoId, { caption });
            
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Photo updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async setPrimaryPhoto(req, res, next) {
        try {
            const { id, photoId } = req.params;
            const result = await this.restaurantRoomService.setPrimaryPhoto(id, photoId);
            
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Primary photo set successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async uploadMenu(req, res, next) {
        try {
            const { id } = req.params;
            const { title, description } = req.body;
            
            if (!req.file) {
                throw new BaseError('No menu file provided', StatusCodes.BAD_REQUEST);
            }

            const result = await this.restaurantRoomService.uploadMenu(id, {
                file: req.file,
                title,
                description
            });

            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Menu uploaded successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteMenu(req, res, next) {
        try {
            const { id, menuId } = req.params;
            const result = await this.restaurantRoomService.deleteMenu(id, menuId);
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Menu deleted successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async updateMenu(req, res, next) {
        try {
            const { id, menuId } = req.params;
            const { title, description } = req.body;
            
            const result = await this.restaurantRoomService.updateMenu(id, menuId, { title, description });
            
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Menu updated successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async uploadFloorplan(req, res, next) {
        try {
            const { id } = req.params;
            
            if (!req.file) {
                throw new BaseError('No floorplan file provided', StatusCodes.BAD_REQUEST);
            }

            const result = await this.restaurantRoomService.uploadFloorplan(id, req.file);

            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Floorplan uploaded successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteFloorplan(req, res, next) {
        try {
            const { id } = req.params;
            const result = await this.restaurantRoomService.deleteFloorplan(id);
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Floorplan deleted successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async addTour(req, res, next) {
        try {
            const { id } = req.params;
            const { title, url, type, description } = req.body;
            
            const result = await this.restaurantRoomService.addTour(id, {
                title,
                url,
                type,
                description
            });
            
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Tour added successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteTour(req, res, next) {
        try {
            const { id, tourId } = req.params;
            const result = await this.restaurantRoomService.deleteTour(id, tourId);
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Tour deleted successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async uploadPastEvent(req, res, next) {
        try {
            const { id } = req.params;
            const { eventName, eventDate, caption } = req.body;
            
            if (!req.file) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'No photo file provided'
                });
            }

            const result = await this.restaurantRoomService.uploadPastEvent(id, {
                file: req.file,
                eventName,
                eventDate,
                caption
            });

            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Past event photo uploaded successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async deletePastEvent(req, res, next) {
        try {
            const { id, eventId } = req.params;
            const result = await this.restaurantRoomService.deletePastEvent(id, eventId);
            res.status(StatusCodes.OK).json({
                success: true,
                message: 'Past event deleted successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RestaurantRoomController;