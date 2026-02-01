const BaseError = require('../errors/base.error');

class GalleryService {
    constructor(restaurantRoomRepository, restaurantProfileRepository) {
        this.restaurantRoomRepository = restaurantRoomRepository;
        this.restaurantProfileRepository = restaurantProfileRepository;
    }

    async getAllPhotosForProfile(profileId) {
        // Get all rooms for this profile
        const rooms = await this.restaurantRoomRepository.findByProfileId(profileId);
        
        const allPhotos = [];
        
        for (const room of rooms) {
            if (room.media && room.media.photos && room.media.photos.length > 0) {
                const roomPhotos = room.media.photos.map(photo => ({
                    id: photo._id.toString(),
                    url: photo.url,
                    filename: photo.filename,
                    caption: photo.caption,
                    isPrimary: photo.isPrimary || false,
                    uploadedAt: photo.uploadedAt,
                    roomId: room._id.toString(),
                    roomName: room.roomName,
                    roomType: room.roomType
                }));
                
                allPhotos.push(...roomPhotos);
            }
        }

        // Sort by upload date (newest first)
        allPhotos.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        
        return allPhotos;
    }

    async getGalleryStatsForProfile(profileId) {
        // Get all rooms for this profile
        const rooms = await this.restaurantRoomRepository.findByProfileId(profileId);
        
        let totalPhotos = 0;
        let roomsWithPhotos = 0;
        const photosByRoom = {};
        
        for (const room of rooms) {
            const roomPhotoCount = room.media?.photos?.length || 0;
            photosByRoom[room._id.toString()] = roomPhotoCount;
            totalPhotos += roomPhotoCount;
            
            if (roomPhotoCount > 0) {
                roomsWithPhotos++;
            }
        }

        return {
            totalPhotos,
            roomsWithPhotos,
            totalRooms: rooms.length,
            photosByRoom
        };
    }
}

module.exports = GalleryService;