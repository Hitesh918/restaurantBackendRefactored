require('dotenv').config();
const mongoose = require('mongoose');
const { ATLAS_DB_URL } = require('../src/config/server.config');
const { Restaurant } = require('../src/models');

async function checkAndFixPrices() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(ATLAS_DB_URL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✓ Connected to database\n');

        // Get all restaurants
        const restaurants = await Restaurant.find({});
        console.log(`Found ${restaurants.length} restaurants\n`);

        if (restaurants.length === 0) {
            console.log('⚠ No restaurants found in database.');
            await mongoose.connection.close();
            process.exit(0);
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Restaurant Price Check:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        let stats = {
            withPrice: 0,
            missingPrice: 0,
            updated: 0,
            errors: 0
        };

        // Default prices based on restaurant type
        function getDefaultPrice(restaurant) {
            const name = restaurant.restaurantName.toLowerCase();
            const cuisines = (restaurant.cuisines || []).map(c => c.toLowerCase());
            
            // Fine dining / French
            if (name.includes('grand') || name.includes('bistro') || name.includes('fine dining') || cuisines.includes('french')) {
                return 85;
            }
            
            // Seafood
            if (name.includes('seafood') || name.includes('ocean') || cuisines.includes('seafood')) {
                return 65;
            }
            
            // Indian
            if (name.includes('indian') || name.includes('spice') || cuisines.includes('indian')) {
                return 35;
            }
            
            // Default
            return 50;
        }

        for (const restaurant of restaurants) {
            try {
                const hasPrice = restaurant.pricePerPlate && restaurant.pricePerPlate > 0;
                
                console.log(`${restaurant.restaurantName}`);
                console.log(`  Current pricePerPlate: ${restaurant.pricePerPlate || 'MISSING'}`);
                
                if (hasPrice) {
                    stats.withPrice++;
                    console.log(`  ✓ Has price: $${restaurant.pricePerPlate}`);
                } else {
                    stats.missingPrice++;
                    const defaultPrice = getDefaultPrice(restaurant);
                    
                    // Update restaurant with default price
                    await Restaurant.findByIdAndUpdate(restaurant._id, {
                        pricePerPlate: defaultPrice
                    });
                    
                    stats.updated++;
                    console.log(`  ⚠ Missing price - Updated to: $${defaultPrice}`);
                }
                console.log('');
                
            } catch (error) {
                console.error(`❌ Error processing ${restaurant.restaurantName}:`, error.message);
                stats.errors++;
            }
        }

        // Summary
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Price Check Summary:');
        console.log(`✓ Restaurants with price: ${stats.withPrice}`);
        console.log(`⚠ Restaurants missing price: ${stats.missingPrice}`);
        console.log(`✓ Restaurants updated: ${stats.updated}`);
        if (stats.errors > 0) {
            console.log(`❌ Errors: ${stats.errors}`);
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error checking prices:', error.message);
        console.error(error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

checkAndFixPrices();

