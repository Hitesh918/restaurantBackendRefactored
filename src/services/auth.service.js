const { hashPassword, comparePassword } = require("../utils/bcrypt");
const { generateToken } = require("../utils/jwt");
const BaseError = require("../errors/base.error");

class AuthService {
    constructor(userRepository, customerRepository, restaurantRepository, subscriptionRepository) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.restaurantRepository = restaurantRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    /**
     * POST /auth/signup
     * Unified signup for all roles
     */
    async signup(userData) {
        // Validate required fields
        if (!userData.email || !userData.password || !userData.role || !userData.fullName) {
            throw new BaseError('email, password, role, and fullName are required', 400);
        }

        const role = userData.role.toLowerCase();
        if (!['customer', 'restaurant', 'admin'].includes(role)) {
            throw new BaseError('role must be customer, restaurant, or admin', 400);
        }

        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new BaseError('User with this email already exists', 409);
        }

        // Role-specific validation
        if (role === 'customer') {
            if (!userData.profilePhotoUrl) {
                throw new BaseError('profilePhotoUrl is required for customer signup', 400);
            }
            if (!userData.profileDescription) {
                throw new BaseError('profileDescription is required for customer signup', 400);
            }
        }

        // Create user
        const hashedPassword = await hashPassword(userData.password);
        const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1); // Customer, Restaurant, Admin

        const createdUser = await this.userRepository.createUser({
            email: userData.email,
            password: hashedPassword,
            role: normalizedRole,
            fullName: userData.fullName,
            phone: userData.phone,
            companyName: userData.companyName
        });

        let profileId = null;
        let profileData = {};

        // Create role-specific profile
        if (role === 'customer') {
            const customer = await this.customerRepository.createCustomer({
                userId: createdUser._id,
                name: userData.fullName,
                email: userData.email,
                phone: userData.phone || '',
                profilePhotoUrl: userData.profilePhotoUrl,
                profileDescription: userData.profileDescription
            });
            profileId = customer._id;
            profileData = {
                customerId: customer._id,
                name: customer.name
            };
        } else if (role === 'restaurant') {
            // For restaurant, profile is created later via POST /restaurants
            // Just return the userId for now
            profileId = createdUser._id;
            profileData = {
                message: 'Restaurant profile pending. Complete setup via POST /restaurants'
            };
        } else if (role === 'admin') {
            profileId = createdUser._id;
        }

        const token = generateToken({
            id: profileId,
            email: createdUser.email,
            role: createdUser.role
        });

        return {
            token,
            id: profileId,
            email: createdUser.email,
            role: createdUser.role,
            fullName: createdUser.fullName,
            ...profileData
        };
    }

    /**
     * POST /auth/login
     * Login with subscription info for restaurants
     */
    async login(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new BaseError('User not found', 404);
        }

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            throw new BaseError('Invalid password', 401, 'AUTH_INVALID_PASSWORD', { email });
        }

        let id = null;
        let subscription = null;
        let profileComplete = true;

        if (user.role === 'Customer') {
            const customer = await this.customerRepository.findByUserId(user._id);
            id = customer?._id;
            if (!id) {
                throw new BaseError('Customer profile not found', 404);
            }
        } else if (user.role === 'Restaurant') {
            const restaurant = await this.restaurantRepository.findByUserId(user._id);
            if (restaurant) {
                id = restaurant._id;
                // Get subscription info
                const sub = await this.subscriptionRepository.findByRestaurantId(restaurant._id);
                if (sub) {
                    // Check if expired
                    const isExpired = new Date() > sub.endDate;
                    subscription = {
                        planId: sub.planId?._id,
                        planName: sub.planId?.name,
                        status: isExpired ? 'expired' : sub.status,
                        startDate: sub.startDate,
                        endDate: sub.endDate,
                        features: sub.planId?.features
                    };
                }
            } else {
                // Restaurant user exists but profile not created yet
                id = user._id;
                profileComplete = false;
            }
        } else if (user.role === 'Admin') {
            id = user._id;
        }

        if (!id) {
            throw new BaseError('Profile not found', 404);
        }

        const token = generateToken({
            id,
            email: user.email,
            role: user.role
        });

        const response = {
            token,
            id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            profileComplete
        };

        // Include subscription for restaurant
        if (user.role === 'Restaurant') {
            response.subscription = subscription;
        }

        return response;
    }

    /**
     * Legacy method - kept for backward compatibility
     */
    async registerUser(userData) {
        return this.signup(userData);
    }

    async loginUser(email, password) {
        return this.login(email, password);
    }

    async updatePassword(email, newPassword) {
        const hashedPassword = await hashPassword(newPassword);
        const updatedUser = await this.userRepository.updatePassword(email, hashedPassword);
        return updatedUser;
    }
}

module.exports = AuthService;
