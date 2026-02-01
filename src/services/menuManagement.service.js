const BaseError = require('../errors/base.error');

class MenuManagementService {
    constructor(restaurantRoomRepository, restaurantProfileRepository) {
        this.restaurantRoomRepository = restaurantRoomRepository;
        this.restaurantProfileRepository = restaurantProfileRepository;
    }

    async getAllMenusForUser(userId) {
        // Get user's restaurant profile
        const profile = await this.restaurantProfileRepository.findByUserId(userId);
        if (!profile) {
            throw new BaseError('Restaurant profile not found', 404);
        }

        return await this.getAllMenusForProfile(profile._id);
    }

    async getAllMenusForProfile(profileId) {
        // Get all rooms for this profile
        const rooms = await this.restaurantRoomRepository.findByProfileId(profileId);
        
        const allMenus = [];
        
        for (const room of rooms) {
            if (room.media && room.media.menus && room.media.menus.length > 0) {
                const roomMenus = room.media.menus.map(menu => ({
                    id: menu._id.toString(),
                    url: menu.url,
                    filename: menu.filename,
                    title: menu.title,
                    description: menu.description,
                    uploadedAt: menu.uploadedAt,
                    roomId: room._id.toString(),
                    roomName: room.roomName,
                    roomType: room.roomType
                }));
                
                allMenus.push(...roomMenus);
            }
        }

        // Sort by upload date (newest first)
        allMenus.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        
        return allMenus;
    }

    async getMenuStatsForUser(userId) {
        // Get user's restaurant profile
        const profile = await this.restaurantProfileRepository.findByUserId(userId);
        if (!profile) {
            throw new BaseError('Restaurant profile not found', 404);
        }

        return await this.getMenuStatsForProfile(profile._id);
    }

    async getMenuStatsForProfile(profileId) {
        // Get all rooms for this profile
        const rooms = await this.restaurantRoomRepository.findByProfileId(profileId);
        
        let totalMenus = 0;
        let roomsWithMenus = 0;
        const menusByRoom = {};
        const menusByType = {};
        
        for (const room of rooms) {
            const roomMenuCount = room.media?.menus?.length || 0;
            menusByRoom[room._id.toString()] = roomMenuCount;
            totalMenus += roomMenuCount;
            
            if (roomMenuCount > 0) {
                roomsWithMenus++;
            }

            // Count by room type
            const roomType = room.roomType || 'unknown';
            menusByType[roomType] = (menusByType[roomType] || 0) + roomMenuCount;
        }

        return {
            totalMenus,
            roomsWithMenus,
            totalRooms: rooms.length,
            menusByRoom,
            menusByType
        };
    }
}

module.exports = MenuManagementService;