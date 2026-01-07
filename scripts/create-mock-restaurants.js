require('dotenv').config();
const mongoose = require('mongoose');
const { ATLAS_DB_URL } = require('../src/config/server.config');
const UserRepository = require('../src/repositories/user.repository');
const RestaurantRepository = require('../src/repositories/restaurant.repository');
const { hashPassword } = require('../src/utils/bcrypt');

// Mock restaurant data
const mockRestaurants = [
    {
        restaurantName: "The Grand Bistro",
        ownerName: "James Anderson",
        businessEmail: "james.anderson@grandbistro.com",
        phone: "+1-555-0101",
        shortDescription: "An elegant fine dining experience with French-inspired cuisine and an extensive wine collection.",
        address: {
            line1: "123 Main Street",
            area: "Downtown",
            city: "New York",
            state: "New York",
            country: "United States",
            zip: "10001"
        },
        geo: {
            lat: 40.7128,
            lng: -74.0060
        },
        cuisines: ["French", "European", "Fine Dining"],
        features: ["parking", "wifi", "ac", "outdoor_seating"],
        categoryTags: ["awarded", "iconic"],
        rating: 4.8,
        reviewCount: 245,
        pricePerPlate: 85,
        certificateCode: "NYC-FD-2024-001",
        showRadius: 5,
        popularDishes: "Coq au Vin\nBouillabaisse\nCrème Brûlée\nEscargot",
        monThuOffer: "Business Lunch Special",
        monThuOfferDescription: "3-course prix fixe menu for $45\nAvailable Monday-Thursday, 11:30 AM - 2:30 PM",
        friSunOffer: "Weekend Brunch",
        friSunOfferDescription: "Bottomless mimosas and brunch specials\nSaturdays & Sundays, 10:00 AM - 3:00 PM",
        tableBookingEnabled: true,
        openingHours: {
            monday: { open: "11:30", close: "22:00" },
            tuesday: { open: "11:30", close: "22:00" },
            wednesday: { open: "11:30", close: "22:00" },
            thursday: { open: "11:30", close: "22:00" },
            friday: { open: "11:30", close: "23:00" },
            saturday: { open: "10:00", close: "23:00" },
            sunday: { open: "10:00", close: "22:00" }
        },
        listingStatus: "active"
    },
    {
        restaurantName: "Spice Garden Indian Cuisine",
        ownerName: "Priya Sharma",
        businessEmail: "priya.sharma@spicegarden.com",
        phone: "+1-555-0102",
        shortDescription: "Authentic Indian flavors with modern presentation. Vegetarian and vegan options available.",
        address: {
            line1: "456 Oak Avenue",
            area: "Little India",
            city: "San Francisco",
            state: "California",
            country: "United States",
            zip: "94102"
        },
        geo: {
            lat: 37.7749,
            lng: -122.4194
        },
        cuisines: ["Indian", "Vegetarian", "Asian"],
        features: ["parking", "wifi", "ac", "delivery"],
        categoryTags: ["best_view", "awarded"],
        rating: 4.6,
        reviewCount: 189,
        pricePerPlate: 35,
        certificateCode: "SF-IND-2024-002",
        showRadius: 8,
        popularDishes: "Butter Chicken\nBiryani\nPaneer Tikka\nNaan Bread",
        monThuOffer: "Lunch Buffet",
        monThuOfferDescription: "All-you-can-eat lunch buffet for $18.99\nMonday-Thursday, 11:30 AM - 3:00 PM",
        friSunOffer: "Weekend Special",
        friSunOfferDescription: "Family platter deals and live music\nFridays-Sundays, 5:00 PM - 10:00 PM",
        tableBookingEnabled: true,
        openingHours: {
            monday: { open: "11:30", close: "22:00" },
            tuesday: { open: "11:30", close: "22:00" },
            wednesday: { open: "11:30", close: "22:00" },
            thursday: { open: "11:30", close: "22:00" },
            friday: { open: "11:30", close: "23:00" },
            saturday: { open: "12:00", close: "23:00" },
            sunday: { open: "12:00", close: "22:00" }
        },
        listingStatus: "active"
    },
    {
        restaurantName: "Ocean's Edge Seafood",
        ownerName: "Michael Chen",
        businessEmail: "michael.chen@oceansedge.com",
        phone: "+1-555-0103",
        shortDescription: "Fresh seafood with ocean views. Specializing in sustainable and locally sourced fish.",
        address: {
            line1: "789 Harbor Drive",
            area: "Waterfront",
            city: "Miami",
            state: "Florida",
            country: "United States",
            zip: "33139"
        },
        geo: {
            lat: 25.7617,
            lng: -80.1918
        },
        cuisines: ["Seafood", "American", "Mediterranean"],
        features: ["parking", "wifi", "ac", "outdoor_seating", "waterfront"],
        categoryTags: ["best_view", "iconic", "awarded"],
        rating: 4.7,
        reviewCount: 312,
        pricePerPlate: 65,
        certificateCode: "MIA-SF-2024-003",
        showRadius: 10,
        popularDishes: "Lobster Thermidor\nGrilled Sea Bass\nOysters Rockefeller\nCrab Cakes",
        monThuOffer: "Early Bird Special",
        monThuOfferDescription: "20% off on all entrees\nMonday-Thursday, 5:00 PM - 6:30 PM",
        friSunOffer: "Weekend Brunch",
        friSunOfferDescription: "Bottomless mimosas and seafood brunch\nSaturdays & Sundays, 10:00 AM - 3:00 PM",
        tableBookingEnabled: true,
        openingHours: {
            monday: { open: "17:00", close: "22:00" },
            tuesday: { open: "17:00", close: "22:00" },
            wednesday: { open: "17:00", close: "22:00" },
            thursday: { open: "17:00", close: "22:00" },
            friday: { open: "17:00", close: "23:00" },
            saturday: { open: "10:00", close: "23:00" },
            sunday: { open: "10:00", close: "22:00" }
        },
        listingStatus: "active"
    },
    {
        restaurantName: "Bella Italia",
        ownerName: "Marco Rossi",
        businessEmail: "marco.rossi@bellaitalia.com",
        phone: "+1-555-0104",
        shortDescription: "Traditional Italian cuisine with homemade pasta and wood-fired pizzas. Family-owned since 1995.",
        address: {
            line1: "321 Little Italy Street",
            area: "Little Italy",
            city: "Chicago",
            state: "Illinois",
            country: "United States",
            zip: "60614"
        },
        geo: {
            lat: 41.8781,
            lng: -87.6298
        },
        cuisines: ["Italian", "Pizza", "Mediterranean"],
        features: ["parking", "wifi", "ac", "outdoor_seating"],
        categoryTags: ["iconic", "awarded"],
        rating: 4.5,
        reviewCount: 278,
        pricePerPlate: 45,
        certificateCode: "CHI-IT-2024-004",
        showRadius: 6,
        popularDishes: "Margherita Pizza\nCarbonara\nOsso Buco\nTiramisu",
        monThuOffer: "Pasta Night",
        monThuOfferDescription: "All pasta dishes 20% off\nMonday-Thursday, 5:00 PM - 9:00 PM",
        friSunOffer: "Family Feast",
        friSunOfferDescription: "Family-style meals for 4+ people\nFridays-Sundays, all day",
        tableBookingEnabled: true,
        openingHours: {
            monday: { open: "17:00", close: "22:00" },
            tuesday: { open: "17:00", close: "22:00" },
            wednesday: { open: "17:00", close: "22:00" },
            thursday: { open: "17:00", close: "22:00" },
            friday: { open: "17:00", close: "23:00" },
            saturday: { open: "17:00", close: "23:00" },
            sunday: { open: "17:00", close: "22:00" }
        },
        listingStatus: "active"
    },
    {
        restaurantName: "Sakura Japanese Sushi",
        ownerName: "Yuki Tanaka",
        businessEmail: "yuki.tanaka@sakura.com",
        phone: "+1-555-0105",
        shortDescription: "Authentic Japanese sushi and sashimi. Omakase experience available with advance booking.",
        address: {
            line1: "654 Cherry Blossom Lane",
            area: "Japantown",
            city: "Los Angeles",
            state: "California",
            country: "United States",
            zip: "90012"
        },
        geo: {
            lat: 34.0522,
            lng: -118.2437
        },
        cuisines: ["Japanese", "Sushi", "Asian"],
        features: ["parking", "wifi", "ac"],
        categoryTags: ["awarded", "iconic"],
        rating: 4.9,
        reviewCount: 421,
        pricePerPlate: 95,
        certificateCode: "LA-JP-2024-005",
        showRadius: 7,
        popularDishes: "Omakase Set\nDragon Roll\nChirashi Bowl\nMiso Soup",
        monThuOffer: "Lunch Special",
        monThuOfferDescription: "Bento box lunch for $25\nMonday-Thursday, 11:30 AM - 2:30 PM",
        friSunOffer: "Weekend Omakase",
        friSunOfferDescription: "Chef's choice omakase experience\nFridays-Sundays, by reservation only",
        tableBookingEnabled: true,
        openingHours: {
            monday: { open: "11:30", close: "22:00" },
            tuesday: { open: "11:30", close: "22:00" },
            wednesday: { open: "11:30", close: "22:00" },
            thursday: { open: "11:30", close: "22:00" },
            friday: { open: "11:30", close: "23:00" },
            saturday: { open: "17:00", close: "23:00" },
            sunday: { open: "17:00", close: "22:00" }
        },
        listingStatus: "active"
    },
    {
        restaurantName: "The Steakhouse",
        ownerName: "Robert Johnson",
        businessEmail: "robert.johnson@steakhouse.com",
        phone: "+1-555-0106",
        shortDescription: "Premium steaks and grilled meats. Dry-aged beef and extensive wine selection.",
        address: {
            line1: "987 Meat Market Boulevard",
            area: "Financial District",
            city: "Boston",
            state: "Massachusetts",
            country: "United States",
            zip: "02108"
        },
        geo: {
            lat: 42.3601,
            lng: -71.0589
        },
        cuisines: ["American", "Steakhouse", "Grill"],
        features: ["parking", "wifi", "ac"],
        categoryTags: ["awarded", "iconic"],
        rating: 4.6,
        reviewCount: 356,
        pricePerPlate: 75,
        certificateCode: "BOS-ST-2024-006",
        showRadius: 5,
        popularDishes: "Ribeye Steak\nFilet Mignon\nPrime Rib\nLobster Tail",
        monThuOffer: "Steak Night",
        monThuOfferDescription: "Select steaks 15% off\nMonday-Thursday, 5:00 PM - 10:00 PM",
        friSunOffer: "Weekend Special",
        friSunOfferDescription: "Surf and turf combos\nFridays-Sundays, all day",
        tableBookingEnabled: true,
        openingHours: {
            monday: { open: "17:00", close: "22:00" },
            tuesday: { open: "17:00", close: "22:00" },
            wednesday: { open: "17:00", close: "22:00" },
            thursday: { open: "17:00", close: "22:00" },
            friday: { open: "17:00", close: "23:00" },
            saturday: { open: "17:00", close: "23:00" },
            sunday: { open: "17:00", close: "22:00" }
        },
        listingStatus: "active"
    },
    {
        restaurantName: "Mama's Mexican Kitchen",
        ownerName: "Maria Garcia",
        businessEmail: "maria.garcia@mamas.com",
        phone: "+1-555-0107",
        shortDescription: "Authentic Mexican street food and traditional dishes. Family recipes passed down for generations.",
        address: {
            line1: "147 Taco Street",
            area: "Mission District",
            city: "San Francisco",
            state: "California",
            country: "United States",
            zip: "94110"
        },
        geo: {
            lat: 37.7599,
            lng: -122.4148
        },
        cuisines: ["Mexican", "Latin", "Street Food"],
        features: ["parking", "wifi", "ac", "outdoor_seating"],
        categoryTags: ["iconic"],
        rating: 4.4,
        reviewCount: 198,
        pricePerPlate: 25,
        certificateCode: "SF-MX-2024-007",
        showRadius: 4,
        popularDishes: "Carnitas Tacos\nMole Poblano\nChiles Rellenos\nFlan",
        monThuOffer: "Taco Tuesday",
        monThuOfferDescription: "$2 tacos all day\nEvery Tuesday, 11:00 AM - 10:00 PM",
        friSunOffer: "Weekend Fiesta",
        friSunOfferDescription: "Live mariachi music and margarita specials\nFridays-Sundays, 5:00 PM - 11:00 PM",
        tableBookingEnabled: true,
        openingHours: {
            monday: { open: "11:00", close: "22:00" },
            tuesday: { open: "11:00", close: "22:00" },
            wednesday: { open: "11:00", close: "22:00" },
            thursday: { open: "11:00", close: "22:00" },
            friday: { open: "11:00", close: "23:00" },
            saturday: { open: "11:00", close: "23:00" },
            sunday: { open: "11:00", close: "22:00" }
        },
        listingStatus: "active"
    },
    {
        restaurantName: "Green Leaf Vegan Bistro",
        ownerName: "Sarah Green",
        businessEmail: "sarah.green@greenleaf.com",
        phone: "+1-555-0108",
        shortDescription: "100% plant-based cuisine with creative dishes. Organic and locally sourced ingredients.",
        address: {
            line1: "258 Organic Avenue",
            area: "Green District",
            city: "Portland",
            state: "Oregon",
            country: "United States",
            zip: "97201"
        },
        geo: {
            lat: 45.5152,
            lng: -122.6784
        },
        cuisines: ["Vegan", "Vegetarian", "Healthy"],
        features: ["parking", "wifi", "ac", "outdoor_seating"],
        categoryTags: ["awarded"],
        rating: 4.7,
        reviewCount: 167,
        pricePerPlate: 32,
        certificateCode: "PDX-VG-2024-008",
        showRadius: 6,
        popularDishes: "Vegan Burger\nCauliflower Wings\nQuinoa Bowl\nVegan Cheesecake",
        monThuOffer: "Lunch Combo",
        monThuOfferDescription: "Soup and salad combo for $15\nMonday-Thursday, 11:30 AM - 3:00 PM",
        friSunOffer: "Weekend Brunch",
        friSunOfferDescription: "Vegan brunch specials and fresh juices\nSaturdays & Sundays, 9:00 AM - 3:00 PM",
        tableBookingEnabled: true,
        openingHours: {
            monday: { open: "11:30", close: "21:00" },
            tuesday: { open: "11:30", close: "21:00" },
            wednesday: { open: "11:30", close: "21:00" },
            thursday: { open: "11:30", close: "21:00" },
            friday: { open: "11:30", close: "22:00" },
            saturday: { open: "09:00", close: "22:00" },
            sunday: { open: "09:00", close: "21:00" }
        },
        listingStatus: "active"
    }
];

const PASSWORD = "Restro@123";

async function createMockRestaurants() {
    try {
        // Connect to database
        console.log('Connecting to database...');
        await mongoose.connect(ATLAS_DB_URL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✓ Connected to database\n');

        const userRepository = new UserRepository();
        const restaurantRepository = new RestaurantRepository();

        // Hash password once
        console.log('Hashing password...');
        const hashedPassword = await hashPassword(PASSWORD);
        console.log('✓ Password hashed\n');

        let createdCount = 0;
        let skippedCount = 0;

        // Create each restaurant
        for (const restaurantData of mockRestaurants) {
            try {
                // Check if user already exists
                const existingUser = await userRepository.findByEmail(restaurantData.businessEmail);
                if (existingUser) {
                    console.log(`⚠ Skipping ${restaurantData.restaurantName} - User already exists (${restaurantData.businessEmail})`);
                    skippedCount++;
                    continue;
                }

                // Create user account
                console.log(`Creating user for ${restaurantData.restaurantName}...`);
                const user = await userRepository.createUser({
                    email: restaurantData.businessEmail.toLowerCase().trim(),
                    password: hashedPassword,
                    role: 'Restaurant',
                    fullName: restaurantData.ownerName,
                    phone: restaurantData.phone,
                    companyName: restaurantData.restaurantName
                });

                // Create restaurant profile
                console.log(`Creating restaurant profile for ${restaurantData.restaurantName}...`);
                const restaurant = await restaurantRepository.createRestaurant({
                    userId: user._id,
                    restaurantName: restaurantData.restaurantName,
                    ownerName: restaurantData.ownerName,
                    shortDescription: restaurantData.shortDescription,
                    businessEmail: restaurantData.businessEmail.toLowerCase().trim(),
                    phone: restaurantData.phone,
                    address: restaurantData.address,
                    geo: restaurantData.geo,
                    cuisines: restaurantData.cuisines,
                    features: restaurantData.features,
                    categoryTags: restaurantData.categoryTags,
                    rating: restaurantData.rating,
                    reviewCount: restaurantData.reviewCount,
                    pricePerPlate: restaurantData.pricePerPlate,
                    certificateCode: restaurantData.certificateCode,
                    showRadius: restaurantData.showRadius,
                    popularDishes: restaurantData.popularDishes,
                    monThuOffer: restaurantData.monThuOffer,
                    monThuOfferDescription: restaurantData.monThuOfferDescription,
                    friSunOffer: restaurantData.friSunOffer,
                    friSunOfferDescription: restaurantData.friSunOfferDescription,
                    tableBookingEnabled: restaurantData.tableBookingEnabled,
                    openingHours: restaurantData.openingHours,
                    listingStatus: restaurantData.listingStatus
                });

                console.log(`✓ Created: ${restaurantData.restaurantName}`);
                console.log(`  Email: ${restaurantData.businessEmail}`);
                console.log(`  Password: ${PASSWORD}`);
                console.log(`  Restaurant ID: ${restaurant._id}\n`);
                createdCount++;

            } catch (error) {
                console.error(`❌ Error creating ${restaurantData.restaurantName}:`, error.message);
                // Continue with next restaurant
            }
        }

        // Summary
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Summary:');
        console.log(`✓ Created: ${createdCount} restaurants`);
        console.log(`⚠ Skipped: ${skippedCount} restaurants (already exist)`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Close database connection
        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error creating mock restaurants:', error.message);
        console.error(error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

// Run the script
createMockRestaurants();

