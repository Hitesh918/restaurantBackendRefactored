const BaseError = require('../errors/base.error');
const { deleteImageFile } = require('../utils/fileUtils');

class CuisineService {
    constructor(cuisineRepository) {
        this.cuisineRepository = cuisineRepository;
    }

    async createCuisine(cuisineData) {
        // Validate required fields
        if (!cuisineData.name) {
            throw new BaseError('Cuisine name is required', 400);
        }

        // Check if cuisine with same name already exists
        const existingCuisine = await this.cuisineRepository.findByName(cuisineData.name);
        if (existingCuisine) {
            throw new BaseError('Cuisine with this name already exists', 409);
        }

        // Normalize status
        if (cuisineData.status) {
            const status = cuisineData.status.charAt(0).toUpperCase() + cuisineData.status.slice(1).toLowerCase();
            if (!['Publish', 'Draft', 'Unpublish'].includes(status)) {
                throw new BaseError('Invalid status. Must be Publish, Draft, or Unpublish', 400);
            }
            cuisineData.status = status;
        }

        return await this.cuisineRepository.createCuisine({
            name: cuisineData.name.trim(),
            imageUrl: cuisineData.imageUrl || '',
            status: cuisineData.status || 'Draft',
        });
    }

    async getAllCuisines(filters = {}) {
        return await this.cuisineRepository.findAll(filters);
    }

    async getCuisineById(id) {
        return await this.cuisineRepository.findById(id);
    }

    async updateCuisine(id, cuisineData) {
        // Get existing cuisine to check for old image
        const existingCuisine = await this.cuisineRepository.findById(id);

        const updateData = {};

        if (cuisineData.name) {
            // Check if another cuisine with same name exists
            const existingCuisineByName = await this.cuisineRepository.findByName(cuisineData.name);
            if (existingCuisineByName && existingCuisineByName._id.toString() !== id) {
                throw new BaseError('Cuisine with this name already exists', 409);
            }
            updateData.name = cuisineData.name.trim();
        }

        if (cuisineData.imageUrl !== undefined) {
            // If new image URL is different from old one, delete old image file
            if (existingCuisine.imageUrl && 
                existingCuisine.imageUrl !== cuisineData.imageUrl && 
                cuisineData.imageUrl !== '') {
                // Delete old image file asynchronously (don't wait for it)
                deleteImageFile(existingCuisine.imageUrl).catch(err => {
                    console.error('Failed to delete old image file:', err);
                });
            }
            updateData.imageUrl = cuisineData.imageUrl;
        }

        if (cuisineData.status) {
            const status = cuisineData.status.charAt(0).toUpperCase() + cuisineData.status.slice(1).toLowerCase();
            if (!['Publish', 'Draft', 'Unpublish'].includes(status)) {
                throw new BaseError('Invalid status. Must be Publish, Draft, or Unpublish', 400);
            }
            updateData.status = status;
        }

        return await this.cuisineRepository.updateCuisine(id, updateData);
    }

    async deleteCuisine(id) {
        // Get cuisine before deleting to get image URL
        const cuisine = await this.cuisineRepository.findById(id);
        
        // Delete the cuisine from database
        const deletedCuisine = await this.cuisineRepository.deleteCuisine(id);
        
        // Delete associated image file if exists
        if (cuisine.imageUrl) {
            deleteImageFile(cuisine.imageUrl).catch(err => {
                console.error('Failed to delete image file when deleting cuisine:', err);
            });
        }
        
        return deletedCuisine;
    }
}

module.exports = CuisineService;

