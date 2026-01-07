const BaseError = require('../errors/base.error');

class MenuService {
    constructor(mediaRepository, restaurantRepository) {
        this.mediaRepository = mediaRepository;
        this.restaurantRepository = restaurantRepository;
    }

    async getMenu(restaurantId) {
        // Verify restaurant exists
        const restaurant = await this.restaurantRepository.findById(restaurantId);
        if (!restaurant) {
            throw new BaseError('Restaurant not found', 404);
        }

        const menus = await this.mediaRepository.findByCategory('restaurant', restaurantId, 'menu');
        // Return the most recent menu
        return menus.length > 0 ? menus[0] : null;
    }

    async uploadMenu(restaurantId, menuUrl) {
        // Verify restaurant exists
        const restaurant = await this.restaurantRepository.findById(restaurantId);
        if (!restaurant) {
            throw new BaseError('Restaurant not found', 404);
        }

        if (!menuUrl) {
            throw new BaseError('Menu PDF URL is required', 400);
        }

        // Delete existing menu if any
        const existingMenus = await this.mediaRepository.findByCategory('restaurant', restaurantId, 'menu');
        for (const menu of existingMenus) {
            await this.mediaRepository.delete(menu._id);
        }

        // Create new menu entry
        const menu = await this.mediaRepository.create({
            ownerType: 'restaurant',
            ownerId: restaurantId,
            mediaType: 'pdf',
            category: 'menu',
            url: menuUrl,
        });

        return menu;
    }

    async deleteMenu(restaurantId) {
        // Verify restaurant exists
        const restaurant = await this.restaurantRepository.findById(restaurantId);
        if (!restaurant) {
            throw new BaseError('Restaurant not found', 404);
        }

        const menus = await this.mediaRepository.findByCategory('restaurant', restaurantId, 'menu');
        for (const menu of menus) {
            await this.mediaRepository.delete(menu._id);
        }

        return { success: true };
    }
}

module.exports = MenuService;

