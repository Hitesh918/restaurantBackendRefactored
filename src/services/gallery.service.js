const BaseError = require('../errors/base.error');

class GalleryService {
    constructor(mediaRepository, restaurantRepository) {
        this.mediaRepository = mediaRepository;
        this.restaurantRepository = restaurantRepository;
    }

    async getGalleryItems(restaurantId, filters = {}) {
        // Verify restaurant exists
        const restaurant = await this.restaurantRepository.findById(restaurantId);
        if (!restaurant) {
            throw new BaseError('Restaurant not found', 404);
        }

        const items = await this.mediaRepository.findByCategory('restaurant', restaurantId, 'gallery');
        
        // Apply filters
        let filtered = items;
        if (filters.status) {
            filtered = filtered.filter(item => item.status === filters.status);
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(item => 
                item.title?.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }

    async getGalleryItemById(id) {
        const item = await this.mediaRepository.findById(id);
        if (!item) {
            throw new BaseError('Gallery item not found', 404);
        }
        if (item.category !== 'gallery') {
            throw new BaseError('Item is not a gallery item', 400);
        }
        return item;
    }

    async createGalleryItem(restaurantId, data) {
        // Verify restaurant exists
        const restaurant = await this.restaurantRepository.findById(restaurantId);
        if (!restaurant) {
            throw new BaseError('Restaurant not found', 404);
        }

        if (!data.url) {
            throw new BaseError('Image URL is required', 400);
        }

        const galleryItem = await this.mediaRepository.create({
            ownerType: 'restaurant',
            ownerId: restaurantId,
            mediaType: 'photo',
            category: 'gallery',
            url: data.url,
            title: data.title || '',
            status: data.status || 'Draft',
        });

        return galleryItem;
    }

    async updateGalleryItem(id, restaurantId, updateData) {
        const item = await this.getGalleryItemById(id);
        
        // Verify ownership
        if (item.ownerId.toString() !== restaurantId.toString()) {
            throw new BaseError('You do not have permission to update this gallery item', 403);
        }

        const updated = await this.mediaRepository.update(id, updateData);
        return updated;
    }

    async deleteGalleryItem(id, restaurantId) {
        const item = await this.getGalleryItemById(id);
        
        // Verify ownership
        if (item.ownerId.toString() !== restaurantId.toString()) {
            throw new BaseError('You do not have permission to delete this gallery item', 403);
        }

        await this.mediaRepository.delete(id);
        return { success: true };
    }
}

module.exports = GalleryService;

