const BaseError = require('../errors/base.error');
const { hashPassword } = require("../utils/bcrypt");

class RestaurantProfileService {
    constructor(restaurantProfileRepository, mediaRepository, userRepository, restaurantRoomRepository) {
        this.restaurantProfileRepository = restaurantProfileRepository;
        this.mediaRepository = mediaRepository;
        this.userRepository = userRepository;
        this.restaurantRoomRepository = restaurantRoomRepository;
    }

    async createProfile(data) {
        // Check if email already exists
        const existingUser = await this.userRepository.findByEmail(data.businessEmail);
        if (existingUser) {
            throw new BaseError('Email already registered', 409);
        }

        // Validate required fields
        const requiredFields = [
            'profileName', 'restaurantName', 'contactName', 'contactPosition', 
            'contactEmail', 'contactPhone', 'businessEmail', 'businessPhone',
            'addressLine1', 'city', 'country', 'cuisine', 'description'
        ];
        
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new BaseError(`${field} is required`, 400);
            }
        }

        // Validate geo coordinates (can be 0, but must be numbers)
        if (data.geoLat === undefined || data.geoLat === null || isNaN(data.geoLat)) {
            throw new BaseError('geoLat must be a valid number', 400);
        }
        if (data.geoLng === undefined || data.geoLng === null || isNaN(data.geoLng)) {
            throw new BaseError('geoLng must be a valid number', 400);
        }

        // Create user account for restaurant profile
        const hashedPassword = await hashPassword(data.password);
        const user = await this.userRepository.createUser({
            email: data.businessEmail,
            password: hashedPassword,
            role: 'Restaurant',
            fullName: data.contactName,
            phone: data.businessPhone,
            companyName: data.profileName
        });

        // Create restaurant profile
        const profile = await this.restaurantProfileRepository.create({
            userId: user._id,
            profileName: data.profileName,
            restaurantName: data.restaurantName,
            contactName: data.contactName,
            contactPosition: data.contactPosition,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            businessEmail: data.businessEmail,
            businessPhone: data.businessPhone,
            address: {
                line1: data.addressLine1,
                area: data.area,
                city: data.city,
                state: data.state,
                country: data.country,
                zip: data.zip
            },
            geo: {
                lat: data.geoLat,
                lng: data.geoLng
            },
            cuisine: data.cuisine,
            description: data.description,
            logoUrl: data.logoUrl || null,
            heroImageUrl: data.heroImageUrl || null,
            openingHours: data.openingHours || {},
            socialMedia: data.socialMedia || {},
            facilities: data.facilities || {},
            offers: data.offers || {},
            googleTourUrl: data.googleTourUrl,
            profileStatus: data.profileStatus || 'draft',
            rating: data.rating ? parseFloat(data.rating) : 0,
            pricePerPlate: data.pricePerPlate ? parseFloat(data.pricePerPlate) : undefined
        });

        // Handle logo upload
        if (data.logoUrl) {
            await this.mediaRepository.create({
                ownerType: 'restaurantProfile',
                ownerId: profile._id,
                mediaType: 'photo',
                category: 'logo',
                url: data.logoUrl
            });
            profile.logoUrl = data.logoUrl;
        }

        // Handle hero image upload
        if (data.heroImageUrl) {
            await this.mediaRepository.create({
                ownerType: 'restaurantProfile',
                ownerId: profile._id,
                mediaType: 'photo',
                category: 'hero',
                url: data.heroImageUrl
            });
            profile.heroImageUrl = data.heroImageUrl;
        }

        // Handle document uploads (event decks, etc.)
        if (data.documents && data.documents.length > 0) {
            for (const doc of data.documents) {
                await this.mediaRepository.create({
                    ownerType: 'restaurantProfile',
                    ownerId: profile._id,
                    mediaType: 'pdf',
                    category: doc.category || 'document',
                    url: doc.url,
                    title: doc.title || doc.name
                });
            }
        }

        return {
            id: profile._id,
            profileStatus: profile.profileStatus
        };
    }

    async getProfile(profileId) {
        const profile = await this.restaurantProfileRepository.findById(profileId);
        if (!profile) {
            throw new BaseError('Restaurant profile not found', 404);
        }

        const media = await this.mediaRepository.findByOwnerGrouped('restaurantProfile', profileId);
        const logo = media.photos?.find(p => p.category === 'logo');
        const heroImage = media.photos?.find(p => p.category === 'hero');

        // Calculate capacity from rooms
        const capacity = await this.calculateCapacityFromRooms(profileId);

        console.log('getProfile - profileId:', profileId);
        console.log('getProfile - media found:', media);
        console.log('getProfile - logo found:', logo);
        console.log('getProfile - heroImage found:', heroImage);
        console.log('getProfile - profile.logoUrl:', profile.logoUrl);
        console.log('getProfile - profile.heroImageUrl:', profile.heroImageUrl);
        console.log('getProfile - calculated capacity:', capacity);

        const result = {
            ...profile.toObject(),
            logo: logo,
            heroImage: heroImage,
            logoUrl: logo?.url || profile.logoUrl || null,
            heroImageUrl: heroImage?.url || profile.heroImageUrl || null,
            capacity: capacity,
            documents: media.pdfs || [],
            photos: media.photos?.filter(p => !['logo', 'hero'].includes(p.category)) || []
        };

        console.log('getProfile - final result logoUrl:', result.logoUrl);
        console.log('getProfile - final result heroImageUrl:', result.heroImageUrl);
        console.log('getProfile - final result capacity:', result.capacity);

        return result;
    }

    async updateProfile(profileId, updateData) {
        const allowedFields = [
            'profileName', 'restaurantName', 'contactName', 'contactPosition',
            'contactEmail', 'contactPhone', 'businessEmail', 'businessPhone',
            'address', 'geo', 'cuisine', 'description', 'openingHours',
            'socialMedia', 'facilities', 'offers', 'googleTourUrl',
            'profileStatus', 'rating', 'pricePerPlate', 'logoUrl', 'heroImageUrl'
        ];
        
        const filteredData = {};
        for (const key of allowedFields) {
            if (updateData[key] !== undefined) {
                filteredData[key] = updateData[key];
            }
        }

        // Handle password update if provided
        if (updateData.password && updateData.password.trim() !== '') {
            const profile = await this.restaurantProfileRepository.findById(profileId);
            if (!profile) {
                throw new BaseError('Restaurant profile not found', 404);
            }
            const hashedPassword = await hashPassword(updateData.password);
            await this.userRepository.updateUser(profile.userId, { password: hashedPassword });
        }

        // Handle logo and hero image updates
        if (updateData.logoUrl !== undefined) {
            if (updateData.logoUrl) {
                // Update or create logo media entry
                await this.mediaRepository.upsertByOwnerAndCategory(
                    'restaurantProfile', 
                    profileId, 
                    'logo', 
                    {
                        mediaType: 'photo',
                        url: updateData.logoUrl
                    }
                );
            } else {
                // Remove logo if empty string
                await this.mediaRepository.deleteByOwnerAndCategory('restaurantProfile', profileId, 'logo');
            }
        }

        if (updateData.heroImageUrl !== undefined) {
            if (updateData.heroImageUrl) {
                // Update or create hero image media entry
                await this.mediaRepository.upsertByOwnerAndCategory(
                    'restaurantProfile', 
                    profileId, 
                    'hero', 
                    {
                        mediaType: 'photo',
                        url: updateData.heroImageUrl
                    }
                );
            } else {
                // Remove hero image if empty string
                await this.mediaRepository.deleteByOwnerAndCategory('restaurantProfile', profileId, 'hero');
            }
        }

        const updated = await this.restaurantProfileRepository.updateById(profileId, filteredData);
        if (!updated) {
            throw new BaseError('Restaurant profile not found', 404);
        }
        
        // Return the full profile with media data
        return await this.getProfile(profileId);
    }

    async getAllProfiles() {
        const profiles = await this.restaurantProfileRepository.getAll();
        
        // Get hero images and logos for all profiles
        const profileIds = profiles.map(p => p._id);
        const [heroImages, logos] = await Promise.all([
            this.mediaRepository.getHeroImagesByRestaurantIds(profileIds),
            this.mediaRepository.getLogosByRestaurantIds(profileIds)
        ]);
        
        // Calculate capacity for all profiles
        const profilesWithCapacity = await Promise.all(profiles.map(async (profile) => {
            const capacity = await this.calculateCapacityFromRooms(profile._id);
            const profileObj = profile.toObject ? profile.toObject() : profile;
            
            return {
                ...profileObj,
                heroImageUrl: heroImages[profile._id.toString()] || profile.heroImageUrl || null,
                logoUrl: logos[profile._id.toString()] || profile.logoUrl || null,
                capacity: capacity
            };
        }));
        
        return profilesWithCapacity;
    }

    async deleteProfile(id) {
        return await this.restaurantProfileRepository.deleteById(id);
    }

    async searchProfiles(query) {
        const {
            location,
            cuisine,
            profileStatus,
            searchText
        } = query;

        return await this.restaurantProfileRepository.search({
            location,
            cuisine,
            profileStatus,
            searchText
        });
    }

    async getProfileByUserId(userId) {
        const profile = await this.restaurantProfileRepository.findByUserId(userId);
        if (!profile) {
            throw new BaseError('Restaurant profile not found. Please create your restaurant profile first.', 404);
        }
        return this.getProfile(profile._id);
    }

    async createProfileForExistingUser(userId, data) {
        // Check if user exists
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new BaseError('User not found', 404);
        }

        // Check if profile already exists for this user
        const existingProfile = await this.restaurantProfileRepository.findByUserId(userId);
        if (existingProfile) {
            throw new BaseError('Restaurant profile already exists for this user', 409);
        }

        // Validate required fields
        const requiredFields = [
            'profileName', 'restaurantName', 'contactName', 'contactPosition', 
            'contactEmail', 'contactPhone', 'businessEmail', 'businessPhone',
            'addressLine1', 'city', 'country', 'cuisine', 'description'
        ];
        
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new BaseError(`${field} is required`, 400);
            }
        }

        // Validate geo coordinates
        if (data.geoLat === undefined || data.geoLat === null || isNaN(data.geoLat)) {
            throw new BaseError('geoLat must be a valid number', 400);
        }
        if (data.geoLng === undefined || data.geoLng === null || isNaN(data.geoLng)) {
            throw new BaseError('geoLng must be a valid number', 400);
        }

        // Create restaurant profile for existing user
        const profile = await this.restaurantProfileRepository.create({
            userId: userId,
            profileName: data.profileName,
            restaurantName: data.restaurantName,
            contactName: data.contactName,
            contactPosition: data.contactPosition,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            businessEmail: data.businessEmail,
            businessPhone: data.businessPhone,
            address: {
                line1: data.addressLine1,
                area: data.area,
                city: data.city,
                state: data.state,
                country: data.country,
                zip: data.zip
            },
            geo: {
                lat: data.geoLat,
                lng: data.geoLng
            },
            cuisine: data.cuisine,
            description: data.description,
            logoUrl: data.logoUrl || null,
            heroImageUrl: data.heroImageUrl || null,
            openingHours: data.openingHours || {},
            socialMedia: data.socialMedia || {},
            facilities: data.facilities || {},
            offers: data.offers || {},
            googleTourUrl: data.googleTourUrl,
            profileStatus: data.profileStatus || 'draft',
            rating: data.rating ? parseFloat(data.rating) : 0,
            pricePerPlate: data.pricePerPlate ? parseFloat(data.pricePerPlate) : undefined
        });

        return {
            id: profile._id,
            profileStatus: profile.profileStatus
        };
    }

    async getAllPublicProfiles() {
        const profiles = await this.restaurantProfileRepository.findPublicProfiles();
        
        // Get hero images and logos for all profiles
        const profileIds = profiles.map(p => p._id);
        const [heroImages, logos] = await Promise.all([
            this.mediaRepository.getHeroImagesByRestaurantIds(profileIds),
            this.mediaRepository.getLogosByRestaurantIds(profileIds)
        ]);
        
        // Calculate capacity for all profiles
        const profilesWithCapacity = await Promise.all(profiles.map(async (profile) => {
            const capacity = await this.calculateCapacityFromRooms(profile._id);
            const profileObj = profile.toObject ? profile.toObject() : profile;
            
            return {
                ...profileObj,
                heroImageUrl: heroImages[profile._id.toString()] || profile.heroImageUrl || null,
                logoUrl: logos[profile._id.toString()] || profile.logoUrl || null,
                capacity: capacity
            };
        }));
        
        return profilesWithCapacity;
    }

    async getPublicProfile(profileId) {
        const profile = await this.restaurantProfileRepository.findPublicById(profileId);
        if (!profile) {
            throw new BaseError('Restaurant profile not found', 404);
        }

        const media = await this.mediaRepository.findByOwnerGrouped('restaurantProfile', profileId);
        const logo = media.photos?.find(p => p.category === 'logo');
        const heroImage = media.photos?.find(p => p.category === 'hero');

        // Calculate capacity from rooms
        const capacity = await this.calculateCapacityFromRooms(profileId);

        return {
            ...profile.toObject(),
            logo: logo,
            heroImage: heroImage,
            logoUrl: logo?.url || profile.logoUrl || null,
            heroImageUrl: heroImage?.url || profile.heroImageUrl || null,
            capacity: capacity,
            documents: media.pdfs || [],
            photos: media.photos?.filter(p => !['logo', 'hero'].includes(p.category)) || []
        };
    }

    async getFeaturedProfiles(limit = 6) {
        const profiles = await this.restaurantProfileRepository.findFeaturedProfiles(limit);
        
        // Get hero images and logos for all profiles
        const profileIds = profiles.map(p => p._id);
        const [heroImages, logos] = await Promise.all([
            this.mediaRepository.getHeroImagesByRestaurantIds(profileIds),
            this.mediaRepository.getLogosByRestaurantIds(profileIds)
        ]);
        
        // Calculate capacity for all profiles
        const profilesWithCapacity = await Promise.all(profiles.map(async (profile) => {
            const capacity = await this.calculateCapacityFromRooms(profile._id);
            const profileObj = profile.toObject ? profile.toObject() : profile;
            
            return {
                ...profileObj,
                heroImageUrl: heroImages[profile._id.toString()] || profile.heroImageUrl || null,
                logoUrl: logos[profile._id.toString()] || profile.logoUrl || null,
                capacity: capacity
            };
        }));
        
        return profilesWithCapacity;
    }

    // Helper method to calculate total capacity from rooms
    async calculateCapacityFromRooms(profileId) {
        try {
            const rooms = await this.restaurantRoomRepository.findByProfileId(profileId);
            
            if (!rooms || rooms.length === 0) {
                return { seated: null, standing: null };
            }

            // Calculate total capacity by summing the maximum capacity of all rooms
            const totalSeated = rooms.reduce((sum, room) => sum + (room.capacity?.seated?.max || 0), 0);
            const totalStanding = rooms.reduce((sum, room) => sum + (room.capacity?.standing?.max || 0), 0);

            return {
                seated: totalSeated > 0 ? totalSeated : null,
                standing: totalStanding > 0 ? totalStanding : null
            };
        } catch (error) {
            console.error('Error calculating capacity from rooms:', error);
            return { seated: null, standing: null };
        }
    }
}

module.exports = RestaurantProfileService;