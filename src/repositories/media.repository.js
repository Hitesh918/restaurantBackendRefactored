const { Media } = require('../models');

class MediaRepository {
    async create(data) {
        const media = new Media(data);
        return await media.save();
    }

    async findByOwner(ownerType, ownerId) {
        return await Media.find({ ownerType, ownerId });
    }

    async findByOwnerGrouped(ownerType, ownerId) {
        const media = await Media.find({ ownerType, ownerId }).lean();
        
        return {
            photos: media.filter(m => m.mediaType === 'photo'),
            videos: media.filter(m => m.mediaType === 'video'),
            menus: media.filter(m => m.category === 'menu'),
            floorplans: media.filter(m => m.category === 'floorplan')
        };
    }

    async getHeroImagesByRestaurantIds(restaurantIds) {
        const heroImages = await Media.find({
            ownerType: 'restaurant',
            ownerId: { $in: restaurantIds },
            category: 'hero',
            mediaType: 'photo'
        }).lean();

        const imageMap = {};
        for (const img of heroImages) {
            if (!imageMap[img.ownerId.toString()]) {
                imageMap[img.ownerId.toString()] = img.url;
            }
        }
        return imageMap;
    }

    async deleteByOwner(ownerType, ownerId) {
        return await Media.deleteMany({ ownerType, ownerId });
    }
}

module.exports = MediaRepository;
