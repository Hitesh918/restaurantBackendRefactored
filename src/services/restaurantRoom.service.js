const BaseError = require('../errors/base.error');
const mongoose = require('mongoose');

class RestaurantRoomService {
    constructor(restaurantRoomRepository, restaurantProfileRepository) {
        this.restaurantRoomRepository = restaurantRoomRepository;
        this.restaurantProfileRepository = restaurantProfileRepository;
    }

    async createRoom(data) {
        // Validate required fields
        const requiredFields = [
            'restaurantProfileId', 'roomName', 'capacity'
        ];
        
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new BaseError(`${field} is required`, 400);
            }
        }

        // Validate capacity structure
        if (!data.capacity.seated || !data.capacity.standing) {
            throw new BaseError('Both seated and standing capacity are required', 400);
        }

        // Check if restaurant profile exists
        const profile = await this.restaurantProfileRepository.findById(data.restaurantProfileId);
        if (!profile) {
            throw new BaseError('Restaurant profile not found', 404);
        }

        // Create room
        const room = await this.restaurantRoomRepository.create({
            restaurantProfileId: data.restaurantProfileId,
            roomName: data.roomName,
            description: data.description,
            capacity: data.capacity,
            minimumSpend: data.minimumSpend || {},
            features: data.features || [],
            furniture: data.furniture || [],
            roomType: data.roomType || 'private_dining',
            bookingSettings: data.bookingSettings || {},
            availability: data.availability || {},
            media: {
                photos: [],
                menus: [],
                floorplan: null,
                tours: [],
                pastEvents: []
            }
        });

        return room;
    }

    async getRoom(roomId) {
        const room = await this.restaurantRoomRepository.findById(roomId);
        if (!room) {
            throw new BaseError('Room not found', 404);
        }

        return room;
    }

    async getRoomsByProfile(profileId) {
        const rooms = await this.restaurantRoomRepository.findByProfileId(profileId);
        return rooms;
    }

    async updateRoom(roomId, updateData) {
        const allowedFields = [
            'roomName', 'description', 'capacity', 'minimumSpend', 'features', 'furniture',
            'roomType', 'bookingSettings', 'availability', 'isActive'
        ];
        
        const filteredData = {};
        for (const key of allowedFields) {
            if (updateData[key] !== undefined) {
                filteredData[key] = updateData[key];
            }
        }

        const updated = await this.restaurantRoomRepository.updateById(roomId, filteredData);
        if (!updated) {
            throw new BaseError('Room not found', 404);
        }
        return updated;
    }

    async deleteRoom(roomId) {
        const deleted = await this.restaurantRoomRepository.deleteById(roomId);
        if (!deleted) {
            throw new BaseError('Room not found', 404);
        }
        return { message: 'Room deleted successfully' };
    }

    async getAllRooms() {
        return await this.restaurantRoomRepository.getAll();
    }

    async searchRooms(query) {
        return await this.restaurantRoomRepository.search(query);
    }

    async getRoomsByOwner(userId) {
        // First find the restaurant profile for this user
        const profile = await this.restaurantProfileRepository.findByUserId(userId);
        if (!profile) {
            throw new BaseError('Restaurant profile not found', 404);
        }

        return await this.getRoomsByProfile(profile._id);
    }

    // Media Upload Methods
    async uploadPhoto(roomId, photoData) {
        const room = await this.restaurantRoomRepository.findById(roomId);
        if (!room) {
            throw new BaseError('Room not found', 404);
        }

        // If this is set as primary, unset other primary photos
        if (photoData.isPrimary && room.media?.photos?.length > 0) {
            await this.restaurantRoomRepository.updateById(roomId, {
                $set: { 'media.photos.$[].isPrimary': false }
            });
        }

        const photoUrl = `/uploads/rooms/${roomId}/photos/${photoData.file.filename}`;
        
        const newPhoto = {
            url: photoUrl,
            filename: photoData.file.filename,
            caption: photoData.caption || '',
            isPrimary: photoData.isPrimary || false,
            uploadedAt: new Date()
        };

        await this.restaurantRoomRepository.updateById(roomId, {
            $push: { 'media.photos': newPhoto }
        });

        // Fetch the updated room to get the photo with generated _id
        const updatedRoom = await this.restaurantRoomRepository.findById(roomId);
        const addedPhoto = updatedRoom.media.photos[updatedRoom.media.photos.length - 1];

        return addedPhoto;
    }

    async deletePhoto(roomId, photoId) {
        const room = await this.restaurantRoomRepository.findById(roomId);
        if (!room) {
            throw new BaseError('Room not found', 404);
        }

        // Convert string ID to ObjectId if needed
        const objectId = mongoose.Types.ObjectId.isValid(photoId) 
            ? new mongoose.Types.ObjectId(photoId) 
            : photoId;

        await this.restaurantRoomRepository.updateById(roomId, {
            $pull: { 'media.photos': { _id: objectId } }
        });

        return { message: 'Photo deleted successfully' };
    }

    async updatePhoto(roomId, photoId, updateData) {
        const room = await this.restaurantRoomRepository.findById(roomId);
        if (!room) {
            throw new BaseError('Room not found', 404);
        }

        // Convert string ID to ObjectId if needed
        const objectId = mongoose.Types.ObjectId.isValid(photoId) 
            ? new mongoose.Types.ObjectId(photoId) 
            : photoId;

        await this.restaurantRoomRepository.updateById(roomId, {
            $set: { 'media.photos.$[elem].caption': updateData.caption }
        }, {
            arrayFilters: [{ 'elem._id': objectId }]
        });

        return { message: 'Photo updated successfully' };
    }

    async setPrimaryPhoto(roomId, photoId) {
        const room = await this.restaurantRoomRepository.findById(roomId);
        if (!room) {
            throw new BaseError('Room not found', 404);
        }

        // Convert string ID to ObjectId if needed
        const objectId = mongoose.Types.ObjectId.isValid(photoId) 
            ? new mongoose.Types.ObjectId(photoId) 
            : photoId;

        // First, set all photos in this room to not primary
        await this.restaurantRoomRepository.updateById(roomId, {
            $set: { 'media.photos.$[].isPrimary': false }
        });

        // Then set the selected photo as primary
        await this.restaurantRoomRepository.updateById(roomId, {
            $set: { 'media.photos.$[elem].isPrimary': true }
        }, {
            arrayFilters: [{ 'elem._id': objectId }]
        });

        return { message: 'Primary photo set successfully' };
    }

    async uploadMenu(roomId, menuData) {
        const room = await this.restaurantRoomRepository.findById(roomId);
        if (!room) {
            throw new BaseError('Room not found', 404);
        }

        const menuUrl = `/uploads/rooms/${roomId}/menus/${menuData.file.filename}`;
        
        const newMenu = {
            url: menuUrl,
            filename: menuData.file.filename,
            title: menuData.title || menuData.file.originalname,
            description: menuData.description || '',
            uploadedAt: new Date()
        };

        await this.restaurantRoomRepository.updateById(roomId, {
            $push: { 'media.menus': newMenu }
        });

        // Fetch the updated room to get the menu with generated _id
        const updatedRoom = await this.restaurantRoomRepository.findById(roomId);
        const addedMenu = updatedRoom.media.menus[updatedRoom.media.menus.length - 1];

        return addedMenu;
    }

    async deleteMenu(roomId, menuId) {
        const room = await this.restaurantRoomRepository.findById(roomId);
        if (!room) {
            throw new BaseError('Room not found', 404);
        }

        // Convert string ID to ObjectId if needed
        const objectId = mongoose.Types.ObjectId.isValid(menuId) 
            ? new mongoose.Types.ObjectId(menuId) 
            : menuId;

        await this.restaurantRoomRepository.updateById(roomId, {
            $pull: { 'media.menus': { _id: objectId } }
        });

        return { message: 'Menu deleted successfully' };
    }

    async updateMenu(roomId, menuId, updateData) {
        const room = await this.restaurantRoomRepository.findById(roomId);
        if (!room) {
            throw new BaseError('Room not found', 404);
        }

        // Convert string ID to ObjectId if needed
        const objectId = mongoose.Types.ObjectId.isValid(menuId) 
            ? new mongoose.Types.ObjectId(menuId) 
            : menuId;

        const updateFields = {};
        if (updateData.title !== undefined) {
            updateFields['media.menus.$[elem].title'] = updateData.title;
        }
        if (updateData.description !== undefined) {
            updateFields['media.menus.$[elem].description'] = updateData.description;
        }

        await this.restaurantRoomRepository.updateById(roomId, {
            $set: updateFields
        }, {
            arrayFilters: [{ 'elem._id': objectId }]
        });

        return { message: 'Menu updated successfully' };
    }

    async uploadFloorplan(roomId, file) {
        const room = await this.restaurantRoomRepository.findById(roomId);
        if (!room) {
            throw new BaseError('Room not found', 404);
        }

        const floorplanUrl = `/uploads/rooms/${roomId}/floorplan/${file.filename}`;
        
        const floorplan = {
            url: floorplanUrl,
            filename: file.filename,
            uploadedAt: new Date()
        };

        await this.restaurantRoomRepository.updateById(roomId, {
            $set: { 'media.floorplan': floorplan }
        });

        return floorplan;
    }

    async deleteFloorplan(roomId) {
        const room = await this.restaurantRoomRepository.findById(roomId);
        if (!room) {
            throw new BaseError('Room not found', 404);
        }

        await this.restaurantRoomRepository.updateById(roomId, {
            $unset: { 'media.floorplan': 1 }
        });

        return { message: 'Floorplan deleted successfully' };
    }

    async addTour(roomId, tourData) {
        const room = await this.restaurantRoomRepository.findById(roomId);
        if (!room) {
            throw new BaseError('Room not found', 404);
        }

        const tour = {
            _id: new mongoose.Types.ObjectId(),
            title: tourData.title,
            url: tourData.url,
            type: tourData.type || 'video',
            description: tourData.description,
            uploadedAt: new Date()
        };

        await this.restaurantRoomRepository.updateById(roomId, {
            $push: { 'media.tours': tour }
        });

        return tour;
    }

    async deleteTour(roomId, tourId) {
        const room = await this.restaurantRoomRepository.findById(roomId);
        if (!room) {
            throw new BaseError('Room not found', 404);
        }

        // Convert string ID to ObjectId if needed
        const objectId = mongoose.Types.ObjectId.isValid(tourId) 
            ? new mongoose.Types.ObjectId(tourId) 
            : tourId;

        await this.restaurantRoomRepository.updateById(roomId, {
            $pull: { 'media.tours': { _id: objectId } }
        });

        return { message: 'Tour deleted successfully' };
    }

    async uploadPastEvent(roomId, eventData) {
        const room = await this.restaurantRoomRepository.findById(roomId);
        if (!room) {
            throw new BaseError('Room not found', 404);
        }

        const eventPhotoUrl = `/uploads/rooms/${roomId}/photos/${eventData.file.filename}`;
        
        const pastEvent = {
            _id: new mongoose.Types.ObjectId(),
            url: eventPhotoUrl,
            filename: eventData.file.filename,
            eventName: eventData.eventName,
            eventDate: new Date(eventData.eventDate),
            caption: eventData.caption,
            uploadedAt: new Date()
        };

        await this.restaurantRoomRepository.updateById(roomId, {
            $push: { 'media.pastEvents': pastEvent }
        });

        return pastEvent;
    }

    async deletePastEvent(roomId, eventId) {
        const room = await this.restaurantRoomRepository.findById(roomId);
        if (!room) {
            throw new BaseError('Room not found', 404);
        }

        // Convert string ID to ObjectId if needed
        const objectId = mongoose.Types.ObjectId.isValid(eventId) 
            ? new mongoose.Types.ObjectId(eventId) 
            : eventId;

        await this.restaurantRoomRepository.updateById(roomId, {
            $pull: { 'media.pastEvents': { _id: objectId } }
        });

        return { message: 'Past event deleted successfully' };
    }
}

module.exports = RestaurantRoomService;