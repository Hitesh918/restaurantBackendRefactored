const { SpaceService } = require('../services');
const RestaurantRoomService = require('../services/restaurantRoom.service');
const SpaceRepository = require('../repositories/restaurantSpace.repository');
const RestaurantRepository = require('../repositories/restaurant.repository');
const RestaurantProfileRepository = require('../repositories/restaurantProfile.repository');
const RestaurantRoomRepository = require('../repositories/restaurantRoom.repository');
const MediaRepository = require('../repositories/media.repository');
const { StatusCodes } = require('http-status-codes');

const spaceService = new SpaceService(
    new SpaceRepository(),
    new RestaurantRepository(),
    new MediaRepository()
);

const restaurantRoomService = new RestaurantRoomService(
    new RestaurantRoomRepository(),
    new RestaurantProfileRepository()
);

const restaurantRepository = new RestaurantRepository();

/**
 * GET /spaces
 * Get all spaces (listings) with restaurant info
 * Query params: restaurantId (optional) - filter by restaurant
 */
async function getAllSpaces(req, res, next) {
    try {
        const { restaurantId } = req.query;
        
        let spaces;
        if (restaurantId) {
            // Filter by restaurant ID - fetch from restaurant rooms
            const rooms = await restaurantRoomService.getRoomsByProfile(restaurantId);
            
            // Transform restaurant rooms to spaces format
            spaces = rooms.map(room => {
                // Convert relative image URLs to full URLs
                const baseUrl = process.env.BACKEND_BASE_URL || 'http://localhost:8000';
                const heroImageUrl = room.media?.photos?.find(photo => photo.isPrimary)?.url || 
                                   room.media?.photos?.[0]?.url;
                const fullHeroImageUrl = heroImageUrl ? `${baseUrl}${heroImageUrl}` : null;
                
                return {
                    _id: room._id,
                    name: room.roomName,
                    restaurantId: room.restaurantProfileId,
                    restaurantName: 'Restaurant', // Will be populated if needed
                    minCapacity: room.capacity?.seated?.min || 1,
                    maxCapacity: room.capacity?.seated?.max || 50,
                    allowedEventStyles: room.roomType === 'private_dining' ? ['seated', 'standing'] : ['seated'],
                    features: room.features || [],
                    heroImageUrl: fullHeroImageUrl,
                    status: room.isActive ? 'active' : 'inactive',
                    createdAt: room.createdAt,
                    updatedAt: room.updatedAt,
                    // Additional room-specific data
                    description: room.description,
                    minimumSpend: room.minimumSpend,
                    capacity: {
                        seated: room.capacity?.seated || { min: 1, max: 50 },
                        standing: room.capacity?.standing || { min: 1, max: 50 }
                    }
                };
            });
        } else {
            // Get all spaces from the original spaces collection
            spaces = await spaceService.getAllSpaces();
        }
        
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Spaces retrieved successfully',
            error: {},
            data: spaces
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /spaces/:id
 * Get space by ID
 */
async function getSpaceById(req, res, next) {
    try {
        const space = await spaceService.getSpaceById(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Space retrieved successfully',
            error: {},
            data: space
        });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /spaces
 * Create a new space (listing)
 * For restaurant role, restaurantId is set from logged-in user
 */
async function createSpace(req, res, next) {
    try {
        // If user is restaurant, get restaurantId from user
        if (req.user.role === 'Restaurant') {
            // Get restaurant - try userId first (for new tokens), then try id as restaurant._id (for old tokens)
            let restaurant = null;
            if (req.user.userId) {
                restaurant = await restaurantRepository.findByUserId(req.user.userId);
            }
            
            // Fallback: if not found and we have id, try finding restaurant by _id (for backward compatibility)
            if (!restaurant && req.user.id) {
                restaurant = await restaurantRepository.findById(req.user.id);
            }
            
            if (!restaurant) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: 'Restaurant not found for this user',
                    error: {},
                    data: null
                });
            }
            
            // Set restaurantId from logged-in user
            req.body.restaurantId = restaurant._id.toString();
        }

        const result = await spaceService.createSpace(req.body);
        return res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Space created successfully',
            error: {},
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /spaces/:id
 * Update space
 * For restaurant role, verify space belongs to restaurant
 */
async function updateSpace(req, res, next) {
    try {
        // If user is restaurant, verify space belongs to them
        if (req.user.role === 'Restaurant') {
            // Get restaurant - try userId first (for new tokens), then try id as restaurant._id (for old tokens)
            let restaurant = null;
            if (req.user.userId) {
                restaurant = await restaurantRepository.findByUserId(req.user.userId);
            }
            
            // Fallback: if not found and we have id, try finding restaurant by _id (for backward compatibility)
            if (!restaurant && req.user.id) {
                restaurant = await restaurantRepository.findById(req.user.id);
            }
            
            if (!restaurant) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: 'Restaurant not found for this user',
                    error: {},
                    data: null
                });
            }

            const space = await spaceService.getSpaceById(req.params.id);
            if (space.restaurantId.toString() !== restaurant._id.toString()) {
                return res.status(StatusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'You do not have permission to update this space',
                    error: {},
                    data: null
                });
            }
        }

        const result = await spaceService.updateSpace(req.params.id, req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Space updated successfully',
            error: {},
            data: result
        });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /spaces/:id
 * Delete space
 * For restaurant role, verify space belongs to restaurant
 */
async function deleteSpace(req, res, next) {
    try {
        // If user is restaurant, verify space belongs to them
        if (req.user.role === 'Restaurant') {
            // Get restaurant - try userId first (for new tokens), then try id as restaurant._id (for old tokens)
            let restaurant = null;
            if (req.user.userId) {
                restaurant = await restaurantRepository.findByUserId(req.user.userId);
            }
            
            // Fallback: if not found and we have id, try finding restaurant by _id (for backward compatibility)
            if (!restaurant && req.user.id) {
                restaurant = await restaurantRepository.findById(req.user.id);
            }
            
            if (!restaurant) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: 'Restaurant not found for this user',
                    error: {},
                    data: null
                });
            }

            const space = await spaceService.getSpaceById(req.params.id);
            if (space.restaurantId.toString() !== restaurant._id.toString()) {
                return res.status(StatusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'You do not have permission to delete this space',
                    error: {},
                    data: null
                });
            }
        }

        await spaceService.deleteSpace(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Space deleted successfully',
            error: {},
            data: null
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /spaces/restaurant/my
 * Get spaces for the logged-in restaurant
 */
async function getMySpaces(req, res, next) {
    try {
        // Get restaurant - try userId first (for new tokens), then try id as restaurant._id (for old tokens)
        let restaurant = null;
        if (req.user.userId) {
            restaurant = await restaurantRepository.findByUserId(req.user.userId);
        }
        
        // Fallback: if not found and we have id, try finding restaurant by _id (for backward compatibility)
        if (!restaurant && req.user.id) {
            restaurant = await restaurantRepository.findById(req.user.id);
        }
        
        if (!restaurant) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Restaurant not found for this user',
                error: {},
                data: null
            });
        }

        const spaces = await spaceService.getSpacesByRestaurantId(restaurant._id);
        return res.status(StatusCodes.OK).json({
            success: true,
            message: 'Spaces retrieved successfully',
            error: {},
            data: spaces
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllSpaces,
    getSpaceById,
    createSpace,
    updateSpace,
    deleteSpace,
    getMySpaces
};

