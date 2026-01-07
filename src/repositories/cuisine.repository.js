const NotFound = require('../errors/notfound.error');
const { Cuisine } = require('../models');

class CuisineRepository {
    async createCuisine(data) {
        const cuisine = new Cuisine(data);
        return await cuisine.save();
    }

    async findAll(filters = {}) {
        const query = {};
        
        if (filters.status) {
            query.status = filters.status;
        }
        
        if (filters.search) {
            query.name = { $regex: filters.search, $options: 'i' };
        }

        return await Cuisine.find(query).sort({ createdAt: -1 });
    }

    async findById(id) {
        const cuisine = await Cuisine.findById(id);
        if (!cuisine) {
            throw new NotFound('Cuisine not found');
        }
        return cuisine;
    }

    async findByName(name) {
        return await Cuisine.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    }

    async updateCuisine(id, data) {
        const cuisine = await Cuisine.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );
        
        if (!cuisine) {
            throw new NotFound('Cuisine not found');
        }
        
        return cuisine;
    }

    async deleteCuisine(id) {
        const cuisine = await Cuisine.findByIdAndDelete(id);
        if (!cuisine) {
            throw new NotFound('Cuisine not found');
        }
        return cuisine;
    }
}

module.exports = CuisineRepository;

