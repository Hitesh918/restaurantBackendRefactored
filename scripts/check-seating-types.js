require('dotenv').config();
const mongoose = require('mongoose');
const { ATLAS_DB_URL } = require('../src/config/server.config');
const { RestaurantSpace } = require('../src/models');

async function checkSeatingTypes() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(ATLAS_DB_URL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✓ Connected to database\n');

        // Get all spaces
        const spaces = await RestaurantSpace.find({}).populate('restaurantId', 'restaurantName').lean();
        console.log(`Found ${spaces.length} restaurant spaces\n`);

        if (spaces.length === 0) {
            console.log('⚠ No spaces found in database. Run the seed script first.');
            await mongoose.connection.close();
            process.exit(0);
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Restaurant Spaces with Seating Types:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        let stats = {
            withSeated: 0,
            withStanding: 0,
            withBoth: 0,
            missing: 0
        };

        spaces.forEach((space, index) => {
            const restaurantName = space.restaurantId?.restaurantName || 'Unknown';
            const seatingTypes = space.allowedEventStyles || [];
            
            console.log(`${index + 1}. ${space.name} (${restaurantName})`);
            console.log(`   Capacity: ${space.minCapacity} - ${space.maxCapacity}`);
            console.log(`   Seating Types: ${seatingTypes.length > 0 ? seatingTypes.join(', ') : 'MISSING!'}`);
            
            if (seatingTypes.length === 0) {
                stats.missing++;
            } else if (seatingTypes.includes('seated') && seatingTypes.includes('standing')) {
                stats.withBoth++;
            } else if (seatingTypes.includes('seated')) {
                stats.withSeated++;
            } else if (seatingTypes.includes('standing')) {
                stats.withStanding++;
            }
            console.log('');
        });

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Summary:');
        console.log(`✓ Total Spaces: ${spaces.length}`);
        console.log(`✓ With "seated" only: ${stats.withSeated}`);
        console.log(`✓ With "standing" only: ${stats.withStanding}`);
        console.log(`✓ With both: ${stats.withBoth}`);
        console.log(`⚠ Missing seating types: ${stats.missing}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (stats.missing > 0) {
            console.log('⚠ Some spaces are missing seating types. This will cause the filter to not work correctly.');
            console.log('   Run the seed script again or update these spaces manually.\n');
        }

        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error checking seating types:', error.message);
        console.error(error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

checkSeatingTypes();

