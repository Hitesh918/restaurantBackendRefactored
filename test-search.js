// Test script for the new search functionality
const { RestaurantService } = require('./src/services');
const { 
    RestaurantRepository, 
    RestaurantSpaceRepository, 
    MediaRepository, 
    UserRepository, 
    AvailabilityBlockRepository,
    ReviewRepository 
} = require('./src/repositories');

// Initialize service
const restaurantService = new RestaurantService(
    new RestaurantRepository(),
    new RestaurantSpaceRepository(),
    new MediaRepository(),
    new UserRepository(),
    new AvailabilityBlockRepository(),
    new ReviewRepository()
);

async function testSearch() {
    console.log('Testing new search functionality...');
    
    // Test 1: Search by city only
    console.log('\n1. Testing city search:');
    try {
        const results1 = await restaurantService.search({ location: 'Toronto' });
        console.log(`Found ${results1.length} restaurants in Toronto`);
    } catch (error) {
        console.error('Error in city search:', error.message);
    }
    
    // Test 2: Search by per-person budget
    console.log('\n2. Testing per-person budget search:');
    try {
        const results2 = await restaurantService.search({ perPersonBudget: '100-150' });
        console.log(`Found ${results2.length} restaurants with $100-150 per person budget`);
    } catch (error) {
        console.error('Error in budget search:', error.message);
    }
    
    // Test 3: Search by seating type
    console.log('\n3. Testing seating type search:');
    try {
        const results3 = await restaurantService.search({ seatingTypes: 'seated' });
        console.log(`Found ${results3.length} restaurants with seated dining`);
    } catch (error) {
        console.error('Error in seating search:', error.message);
    }
    
    // Test 4: Search by capacity
    console.log('\n4. Testing capacity search:');
    try {
        const results4 = await restaurantService.search({ guestCount: 25 });
        console.log(`Found ${results4.length} restaurants that can accommodate 25 guests`);
    } catch (error) {
        console.error('Error in capacity search:', error.message);
    }
    
    // Test 5: Combined search
    console.log('\n5. Testing combined search:');
    try {
        const results5 = await restaurantService.search({ 
            location: 'Toronto',
            guestCount: 20,
            seatingTypes: 'seated',
            perPersonBudget: '150-200'
        });
        console.log(`Found ${results5.length} restaurants matching all criteria`);
        if (results5.length > 0) {
            console.log('Sample result:', {
                name: results5[0].name,
                city: results5[0].city,
                price: results5[0].price,
                capacityRange: results5[0].capacityRange
            });
        }
    } catch (error) {
        console.error('Error in combined search:', error.message);
    }
    
    console.log('\nSearch tests completed!');
}

// Only run if this file is executed directly
if (require.main === module) {
    // Connect to database first
    const connectToDB = require('./src/config/db.config');
    connectToDB().then(() => {
        testSearch().then(() => {
            console.log('All tests completed');
            process.exit(0);
        }).catch(error => {
            console.error('Test failed:', error);
            process.exit(1);
        });
    }).catch(error => {
        console.error('Database connection failed:', error);
        process.exit(1);
    });
}

module.exports = { testSearch };