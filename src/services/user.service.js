const BaseError = require('../errors/base.error');

class UserService {
    constructor(userRepository, restaurantRepository, subscriptionRepository) {
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    async getRestaurantUsers() {
        // Get all users with Restaurant role
        const users = await this.userRepository.getUsersByRole('Restaurant');
        
        // Get restaurant info and subscriptions for each user
        const usersWithDetails = await Promise.all(
            users.map(async (user) => {
                // Find restaurant by userId
                const restaurant = await this.restaurantRepository.findByUserId(user._id);
                
                // Get subscription if restaurant exists
                let subscription = null;
                if (restaurant) {
                    subscription = await this.subscriptionRepository.findByRestaurantId(restaurant._id);
                }

                return {
                    _id: user._id,
                    name: user.fullName,
                    email: user.email,
                    mobile: user.phone || '',
                    joinDate: user.createdAt,
                    status: 'Active', // Can be enhanced based on user status
                    restaurantId: restaurant?._id || null,
                    restaurantName: restaurant?.restaurantName || user.companyName || '',
                    isSubscribe: subscription && subscription.status === 'active' && new Date() <= subscription.endDate ? 'Subscribe' : 'Not Subscribe',
                    packageName: subscription?.planId?.name || 'Not Subscribe',
                    startDate: subscription?.startDate ? new Date(subscription.startDate).toISOString().split('T')[0] : 'Not Subscribe',
                    expiredDate: subscription?.endDate ? new Date(subscription.endDate).toISOString().split('T')[0] : 'Not Subscribe',
                };
            })
        );

        return usersWithDetails;
    }

    async getAllUsers() {
        return await this.userRepository.getAllUsers();
    }

    async getUserById(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new BaseError('User not found', 404);
        }
        return user;
    }

    async updateUser(id, updateData) {
        return await this.userRepository.updateUser(id, updateData);
    }

    async deleteUser(id) {
        return await this.userRepository.deleteUser(id);
    }
}

module.exports = UserService;

