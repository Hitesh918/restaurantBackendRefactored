require('dotenv').config();
const mongoose = require('mongoose');
const { ATLAS_DB_URL } = require('../src/config/server.config');
const { Restaurant, Media } = require('../src/models');

// Menu PDF URLs organized by restaurant type
const menuPdfUrls = {
    indian: "https://www.copperchimney.in/menu/Food%20menu%20-%20New%201.pdf",
    general: "https://oonatheone.in/wp-content/uploads/2023/07/FOOD-MENU.pdf",
    seafood: "https://oonatheone.in/wp-content/uploads/2023/07/FOOD-MENU.pdf",
    french: "https://oonatheone.in/wp-content/uploads/2023/07/FOOD-MENU.pdf"
};

function getMenuPdfUrl(restaurant) {
    const name = restaurant.restaurantName.toLowerCase();
    const cuisines = (restaurant.cuisines || []).map(c => c.toLowerCase());
    
    // Indian restaurants
    if (name.includes('indian') || name.includes('spice') || cuisines.includes('indian')) {
        return menuPdfUrls.indian;
    }
    
    // Seafood restaurants
    if (name.includes('seafood') || name.includes('ocean') || cuisines.includes('seafood')) {
        return menuPdfUrls.seafood;
    }
    
    // French/Fine Dining restaurants
    if (name.includes('bistro') || name.includes('grand') || name.includes('fine dining') || cuisines.includes('french')) {
        return menuPdfUrls.french;
    }
    
    // Default menu for other restaurants
    return menuPdfUrls.general;
}

async function addMenuPdfs() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(ATLAS_DB_URL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✓ Connected to database\n');

        // Get all active restaurants
        const restaurants = await Restaurant.find({ listingStatus: 'active' });
        console.log(`Found ${restaurants.length} active restaurants\n`);

        let stats = {
            restaurantsUpdated: 0,
            menusAdded: 0,
            skipped: 0,
            errors: 0
        };

        for (const restaurant of restaurants) {
            try {
                // Check if restaurant already has a menu PDF
                const existingMenu = await Media.findOne({
                    ownerType: 'restaurant',
                    ownerId: restaurant._id,
                    category: 'menu',
                    mediaType: 'pdf'
                });

                if (existingMenu) {
                    console.log(`⚠ Skipping ${restaurant.restaurantName} - already has menu PDF`);
                    stats.skipped++;
                    continue;
                }

                // Get appropriate menu PDF URL
                const menuPdfUrl = getMenuPdfUrl(restaurant);

                // Create menu PDF media entry
                await Media.create({
                    ownerType: "restaurant",
                    ownerId: restaurant._id,
                    mediaType: "pdf",
                    category: "menu",
                    url: menuPdfUrl
                });

                stats.menusAdded++;
                stats.restaurantsUpdated++;
                console.log(`✓ Added menu PDF to ${restaurant.restaurantName}`);

            } catch (error) {
                console.error(`❌ Error adding menu to ${restaurant.restaurantName}:`, error.message);
                stats.errors++;
            }
        }

        // Summary
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Menu PDF Addition Summary:');
        console.log(`✓ Restaurants Updated: ${stats.restaurantsUpdated}`);
        console.log(`✓ Menu PDFs Added: ${stats.menusAdded}`);
        console.log(`⚠ Skipped (already have menu): ${stats.skipped}`);
        if (stats.errors > 0) {
            console.log(`❌ Errors: ${stats.errors}`);
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error adding menu PDFs:', error.message);
        console.error(error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

addMenuPdfs();

