const Media = require('../models/media.model');

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
            pdfs: media.filter(m => m.mediaType === 'pdf'),
            menus: media.filter(m => m.category === 'menu'),
            floorplans: media.filter(m => m.category === 'floorplan')
        };
    }

    async getHeroImagesByRestaurantIds(restaurantIds) {
        const heroImages = await Media.find({
            ownerType: 'restaurantProfile',
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

    async getLogosByRestaurantIds(restaurantIds) {
        const logos = await Media.find({
            ownerType: 'restaurantProfile',
            ownerId: { $in: restaurantIds },
            category: 'logo',
            mediaType: 'photo'
        }).lean();

        const logoMap = {};
        for (const logo of logos) {
            if (!logoMap[logo.ownerId.toString()]) {
                logoMap[logo.ownerId.toString()] = logo.url;
            }
        }
        return logoMap;
    }

    async deleteByOwner(ownerType, ownerId) {
        return await Media.deleteMany({ ownerType, ownerId });
    }

    async findById(id) {
        return await Media.findById(id);
    }

    async findByCategory(ownerType, ownerId, category) {
        return await Media.find({ ownerType, ownerId, category }).sort({ createdAt: -1 });
    }

    async update(id, updateData) {
        return await Media.findByIdAndUpdate(id, updateData, { new: true });
    }

    async delete(id) {
        return await Media.findByIdAndDelete(id);
    }

    async upsertByOwnerAndCategory(ownerType, ownerId, category, data) {
        const existingMedia = await Media.findOne({ ownerType, ownerId, category });
        
        if (existingMedia) {
            // Update existing media
            return await Media.findByIdAndUpdate(existingMedia._id, data, { new: true });
        } else {
            // Create new media
            const mediaData = {
                ownerType,
                ownerId,
                category,
                ...data
            };
            const media = new Media(mediaData);
            return await media.save();
        }
    }

    async deleteByOwnerAndCategory(ownerType, ownerId, category) {
        return await Media.deleteMany({ ownerType, ownerId, category });
    }
}

module.exports = MediaRepository;
