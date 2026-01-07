require('dotenv').config();
const mongoose = require('mongoose');
const { ATLAS_DB_URL } = require('../src/config/server.config');
const { Restaurant, Media } = require('../src/models');

// Unsplash image URLs organized by restaurant type
const imageSets = {
    french: {
        hero: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop"
        ],
        food: [
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop"
        ],
        ambience: [
            "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop"
        ]
    },
    indian: {
        hero: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&h=800&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop"
        ],
        food: [
            "https://images.unsplash.com/photo-1563379091339-03246963d29b?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop"
        ],
        ambience: [
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop"
        ]
    },
    seafood: {
        hero: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&h=800&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop"
        ],
        food: [
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop"
        ],
        ambience: [
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop"
        ]
    },
    default: {
        hero: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop",
        gallery: [
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop"
        ],
        food: [
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop"
        ],
        ambience: [
            "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop"
        ]
    }
};

function getImageSet(restaurant) {
    const name = restaurant.restaurantName.toLowerCase();
    const cuisines = restaurant.cuisines.map(c => c.toLowerCase());
    
    if (name.includes('french') || name.includes('bistro') || name.includes('grand') || cuisines.includes('french')) {
        return imageSets.french;
    } else if (name.includes('indian') || name.includes('spice') || cuisines.includes('indian')) {
        return imageSets.indian;
    } else if (name.includes('seafood') || name.includes('ocean') || cuisines.includes('seafood')) {
        return imageSets.seafood;
    }
    return imageSets.default;
}

async function addImagesToRestaurants() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(ATLAS_DB_URL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✓ Connected to database\n');

        // Get all restaurants
        const restaurants = await Restaurant.find({ listingStatus: 'active' });
        console.log(`Found ${restaurants.length} restaurants\n`);

        let stats = {
            restaurantsUpdated: 0,
            imagesAdded: 0,
            skipped: 0
        };

        for (const restaurant of restaurants) {
            try {
                // Check if restaurant already has a hero image
                const existingHero = await Media.findOne({
                    ownerType: 'restaurant',
                    ownerId: restaurant._id,
                    category: 'hero'
                });

                if (existingHero) {
                    console.log(`⚠ Skipping ${restaurant.restaurantName} - already has images`);
                    stats.skipped++;
                    continue;
                }

                // Get appropriate image set
                const imageSet = getImageSet(restaurant);
                const mediaItems = [];

                // Add hero image
                mediaItems.push({
                    ownerType: "restaurant",
                    ownerId: restaurant._id,
                    mediaType: "photo",
                    category: "hero",
                    url: imageSet.hero
                });

                // Add gallery images
                imageSet.gallery.forEach((url, index) => {
                    mediaItems.push({
                        ownerType: "restaurant",
                        ownerId: restaurant._id,
                        mediaType: "photo",
                        category: "gallery",
                        title: `Dining Area ${index + 1}`,
                        status: "Publish",
                        url: url
                    });
                });

                // Add food & beverage images
                imageSet.food.forEach((url, index) => {
                    mediaItems.push({
                        ownerType: "restaurant",
                        ownerId: restaurant._id,
                        mediaType: "photo",
                        category: "food_beverage",
                        title: `Signature Dish ${index + 1}`,
                        status: "Publish",
                        url: url
                    });
                });

                // Add ambience images
                imageSet.ambience.forEach((url, index) => {
                    mediaItems.push({
                        ownerType: "restaurant",
                        ownerId: restaurant._id,
                        mediaType: "photo",
                        category: "ambience",
                        title: `Ambience ${index + 1}`,
                        status: "Publish",
                        url: url
                    });
                });

                // Create all media items
                for (const mediaData of mediaItems) {
                    await Media.create(mediaData);
                    stats.imagesAdded++;
                }

                stats.restaurantsUpdated++;
                console.log(`✓ Added ${mediaItems.length} images to ${restaurant.restaurantName}`);

            } catch (error) {
                console.error(`❌ Error adding images to ${restaurant.restaurantName}:`, error.message);
            }
        }

        // Summary
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Image Addition Summary:');
        console.log(`✓ Restaurants Updated: ${stats.restaurantsUpdated}`);
        console.log(`✓ Images Added: ${stats.imagesAdded}`);
        console.log(`⚠ Skipped (already have images): ${stats.skipped}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error adding images:', error.message);
        console.error(error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

addImagesToRestaurants();

