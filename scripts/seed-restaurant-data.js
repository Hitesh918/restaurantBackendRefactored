require('dotenv').config();
const mongoose = require('mongoose');
const { ATLAS_DB_URL } = require('../src/config/server.config');
const UserRepository = require('../src/repositories/user.repository');
const RestaurantRepository = require('../src/repositories/restaurant.repository');
const { RestaurantSpace, RestaurantSubscription, AvailabilityBlock, Media, Cuisine, Plan, BookingRequest, Event, Review, Customer } = require('../src/models');
const { hashPassword } = require('../src/utils/bcrypt');

const PASSWORD = "Restro@123";

// Cuisines to seed
const cuisines = [
    { name: "French", status: "Publish" },
    { name: "Indian", status: "Publish" },
    { name: "Seafood", status: "Publish" },
    { name: "Italian", status: "Publish" },
    { name: "Japanese", status: "Publish" },
    { name: "American", status: "Publish" },
    { name: "Mexican", status: "Publish" },
    { name: "Vegan", status: "Publish" },
    { name: "Vegetarian", status: "Publish" },
    { name: "Asian", status: "Publish" },
    { name: "Mediterranean", status: "Publish" },
    { name: "European", status: "Publish" },
    { name: "Steakhouse", status: "Publish" },
    { name: "Grill", status: "Publish" },
    { name: "Latin", status: "Publish" },
    { name: "Street Food", status: "Publish" },
    { name: "Healthy", status: "Publish" },
    { name: "Fine Dining", status: "Publish" },
    { name: "Pizza", status: "Publish" },
    { name: "Sushi", status: "Publish" }
];

// Menu PDF URLs organized by restaurant type
function getMenuPdfUrl(restaurantData) {
    const name = restaurantData.restaurantName.toLowerCase();
    const cuisines = (restaurantData.cuisines || []).map(c => c.toLowerCase());
    
    // Indian restaurants
    if (name.includes('indian') || name.includes('spice') || cuisines.includes('indian')) {
        return "https://www.copperchimney.in/menu/Food%20menu%20-%20New%201.pdf";
    }
    
    // General/Fine Dining restaurants (default)
    return "https://oonatheone.in/wp-content/uploads/2023/07/FOOD-MENU.pdf";
}

// Mock restaurants data
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
        geo: { lat: 40.7128, lng: -74.0060 },
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
        listingStatus: "active",
        spaces: [
            { name: "Wine Cellar", minCapacity: 10, maxCapacity: 30, eventStyles: ["seated"], features: ["private_bar", "wine_cellar"] },
            { name: "Main Dining Room", minCapacity: 20, maxCapacity: 60, eventStyles: ["seated", "standing"], features: ["private_bar", "sound_system"] },
            { name: "Private Patio", minCapacity: 15, maxCapacity: 40, eventStyles: ["seated", "standing"], features: ["outdoor", "heating"] }
        ]
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
        geo: { lat: 37.7749, lng: -122.4194 },
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
        listingStatus: "active",
        spaces: [
            { name: "Private Dining Room", minCapacity: 8, maxCapacity: 25, eventStyles: ["seated"], features: ["private_bar"] },
            { name: "Mezzanine", minCapacity: 15, maxCapacity: 45, eventStyles: ["seated", "standing"], features: ["sound_system", "projector"] }
        ]
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
        geo: { lat: 25.7617, lng: -80.1918 },
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
        listingStatus: "active",
        spaces: [
            { name: "Ocean View Room", minCapacity: 12, maxCapacity: 35, eventStyles: ["seated"], features: ["ocean_view", "private_bar"] },
            { name: "Waterfront Terrace", minCapacity: 20, maxCapacity: 50, eventStyles: ["seated", "standing"], features: ["outdoor", "ocean_view", "heating"] }
        ]
    }
];

async function seedData() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(ATLAS_DB_URL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✓ Connected to database\n');

        const userRepository = new UserRepository();
        const restaurantRepository = new RestaurantRepository();
        const hashedPassword = await hashPassword(PASSWORD);

        let stats = {
            cuisines: 0,
            restaurants: 0,
            spaces: 0,
            subscriptions: 0,
            media: 0,
            availabilityBlocks: 0,
            customers: 0,
            bookingRequests: 0,
            events: 0,
            reviews: 0
        };

        // 1. Seed Cuisines
        console.log('📋 Seeding cuisines...');
        for (const cuisineData of cuisines) {
            try {
                const existing = await Cuisine.findOne({ name: cuisineData.name });
                if (!existing) {
                    await Cuisine.create(cuisineData);
                    stats.cuisines++;
                }
            } catch (error) {
                // Skip if already exists
            }
        }
        console.log(`✓ Created ${stats.cuisines} cuisines\n`);

        // 2. Get or create a plan for subscriptions
        console.log('📋 Checking for subscription plan...');
        let plan = await Plan.findOne({ name: "Premium Plan" });
        if (!plan) {
            plan = await Plan.create({
                name: "Premium Plan",
                description: "Premium subscription plan with all features",
                durationInDays: 365,
                price: 999,
                currency: "USD",
                features: {
                    priorityListing: true,
                    crmAccess: true,
                    messagingEnabled: true,
                    analyticsAccess: true
                },
                status: "active"
            });
            console.log('✓ Created Premium Plan\n');
        } else {
            console.log('✓ Using existing Premium Plan\n');
        }

        // 3. Seed Restaurants with Spaces, Subscriptions, and Media
        console.log('🍽️  Seeding restaurants...');
        for (const restaurantData of mockRestaurants) {
            try {
                // Check if restaurant exists
                const existingUser = await userRepository.findByEmail(restaurantData.businessEmail);
                if (existingUser) {
                    console.log(`⚠ Skipping ${restaurantData.restaurantName} - already exists`);
                    continue;
                }

                // Create user
                const user = await userRepository.createUser({
                    email: restaurantData.businessEmail.toLowerCase().trim(),
                    password: hashedPassword,
                    role: 'Restaurant',
                    fullName: restaurantData.ownerName,
                    phone: restaurantData.phone,
                    companyName: restaurantData.restaurantName
                });

                // Create restaurant
                const restaurant = await restaurantRepository.createRestaurant({
                    userId: user._id,
                    ...restaurantData
                });
                stats.restaurants++;

                // Create spaces
                if (restaurantData.spaces) {
                    for (const spaceData of restaurantData.spaces) {
                        await RestaurantSpace.create({
                            restaurantId: restaurant._id,
                            name: spaceData.name,
                            minCapacity: spaceData.minCapacity,
                            maxCapacity: spaceData.maxCapacity,
                            allowedEventStyles: spaceData.eventStyles,
                            features: spaceData.features || []
                        });
                        stats.spaces++;
                    }
                }

                // Create subscription
                const startDate = new Date();
                const endDate = new Date();
                endDate.setFullYear(endDate.getFullYear() + 1);
                await RestaurantSubscription.create({
                    restaurantId: restaurant._id,
                    planId: plan._id,
                    status: "active",
                    startDate: startDate,
                    endDate: endDate
                });
                stats.subscriptions++;

                // Create media (hero image, gallery, menu) with Unsplash URLs
                // Different images based on restaurant type
                let heroImage, galleryImages, foodImages, ambienceImages;
                
                if (restaurantData.restaurantName.includes("Grand Bistro") || restaurantData.restaurantName.includes("French")) {
                    // French/Fine Dining images
                    heroImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop";
                    galleryImages = [
                        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop"
                    ];
                    foodImages = [
                        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop"
                    ];
                    ambienceImages = [
                        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop"
                    ];
                } else if (restaurantData.restaurantName.includes("Spice Garden") || restaurantData.restaurantName.includes("Indian")) {
                    // Indian cuisine images
                    heroImage = "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=1200&h=800&fit=crop";
                    galleryImages = [
                        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop"
                    ];
                    foodImages = [
                        "https://images.unsplash.com/photo-1563379091339-03246963d29b?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop"
                    ];
                    ambienceImages = [
                        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop"
                    ];
                } else if (restaurantData.restaurantName.includes("Ocean") || restaurantData.restaurantName.includes("Seafood")) {
                    // Seafood restaurant images
                    heroImage = "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&h=800&fit=crop";
                    galleryImages = [
                        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop"
                    ];
                    foodImages = [
                        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop"
                    ];
                    ambienceImages = [
                        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop"
                    ];
                } else {
                    // Default restaurant images
                    heroImage = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop";
                    galleryImages = [
                        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
                        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop"
                    ];
                    foodImages = [
                        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop"
                    ];
                    ambienceImages = [
                        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop"
                    ];
                }

                const mediaItems = [
                    // Hero image
                    {
                        ownerType: "restaurant",
                        ownerId: restaurant._id,
                        mediaType: "photo",
                        category: "hero",
                        url: heroImage
                    },
                    // Gallery images - dining areas
                    ...galleryImages.map((url, index) => ({
                        ownerType: "restaurant",
                        ownerId: restaurant._id,
                        mediaType: "photo",
                        category: "gallery",
                        title: `Dining Area ${index + 1}`,
                        status: "Publish",
                        url: url
                    })),
                    // Food & Beverage images
                    ...foodImages.map((url, index) => ({
                        ownerType: "restaurant",
                        ownerId: restaurant._id,
                        mediaType: "photo",
                        category: "food_beverage",
                        title: `Signature Dish ${index + 1}`,
                        status: "Publish",
                        url: url
                    })),
                    // Ambience images
                    ...ambienceImages.map((url, index) => ({
                        ownerType: "restaurant",
                        ownerId: restaurant._id,
                        mediaType: "photo",
                        category: "ambience",
                        title: `Ambience ${index + 1}`,
                        status: "Publish",
                        url: url
                    })),
                    // Menu PDF - assign based on restaurant type
                    {
                        ownerType: "restaurant",
                        ownerId: restaurant._id,
                        mediaType: "pdf",
                        category: "menu",
                        url: getMenuPdfUrl(restaurantData)
                    }
                ];

                for (const mediaData of mediaItems) {
                    await Media.create(mediaData);
                    stats.media++;
                }

                // Create availability blocks (sample)
                const spaces = await RestaurantSpace.find({ restaurantId: restaurant._id });
                if (spaces.length > 0) {
                    const space = spaces[0];
                    const blockDate = new Date();
                    blockDate.setDate(blockDate.getDate() + 7); // Next week
                    await AvailabilityBlock.create({
                        restaurantId: restaurant._id,
                        spaceId: space._id,
                        eventDate: blockDate,
                        startTime: "18:00",
                        endTime: "22:00",
                        reason: "event"
                    });
                    stats.availabilityBlocks++;
                }

                console.log(`✓ Created ${restaurantData.restaurantName} with spaces, subscription, and media`);

            } catch (error) {
                console.error(`❌ Error creating ${restaurantData.restaurantName}:`, error.message);
            }
        }
        console.log(`\n✓ Created ${stats.restaurants} restaurants\n`);

        // 4. Create sample customers
        console.log('👥 Seeding customers...');
        const customerData = [
            {
                profilePhotoUrl: "https://i.pravatar.cc/150?img=1",
                profileDescription: "Food enthusiast and event organizer",
                name: "John Smith",
                email: "john.smith@example.com",
                phone: "+1-555-1001"
            },
            {
                profilePhotoUrl: "https://i.pravatar.cc/150?img=2",
                profileDescription: "Corporate event planner",
                name: "Emily Johnson",
                email: "emily.johnson@example.com",
                phone: "+1-555-1002"
            }
        ];

        for (const customerInfo of customerData) {
            try {
                // Check if user already exists
                const existingUser = await userRepository.findByEmail(customerInfo.email);
                if (existingUser) {
                    // Check if customer profile exists
                    const existingCustomer = await Customer.findOne({ userId: existingUser._id });
                    if (!existingCustomer) {
                        await Customer.create({
                            userId: existingUser._id,
                            profilePhotoUrl: customerInfo.profilePhotoUrl,
                            profileDescription: customerInfo.profileDescription,
                            name: customerInfo.name,
                            email: customerInfo.email,
                            phone: customerInfo.phone
                        });
                        stats.customers++;
                    }
                    continue;
                }

                // Create user first
                const customerUser = await userRepository.createUser({
                    email: customerInfo.email.toLowerCase().trim(),
                    password: hashedPassword,
                    role: 'Customer',
                    fullName: customerInfo.name,
                    phone: customerInfo.phone
                });

                // Create customer profile
                await Customer.create({
                    userId: customerUser._id,
                    profilePhotoUrl: customerInfo.profilePhotoUrl,
                    profileDescription: customerInfo.profileDescription,
                    name: customerInfo.name,
                    email: customerInfo.email.toLowerCase().trim(),
                    phone: customerInfo.phone
                });
                stats.customers++;
            } catch (error) {
                console.error(`Error creating customer ${customerInfo.name}:`, error.message);
                // Skip if exists
            }
        }
        console.log(`✓ Created ${stats.customers} customers\n`);

        // 5. Create booking requests and events
        console.log('📅 Seeding booking requests and events...');
        const restaurants = await restaurantRepository.getAll();
        const customers = await Customer.find().limit(2);

        if (restaurants.length > 0 && customers.length > 0) {
            const restaurant = restaurants[0];
            const customer = customers[0];
            const spaces = await RestaurantSpace.find({ restaurantId: restaurant._id });

            if (spaces.length > 0) {
                const space = spaces[0];
                
                // Create booking request
                const eventDate = new Date();
                eventDate.setDate(eventDate.getDate() + 14); // 2 weeks from now
                const expiresAt = new Date(eventDate);
                expiresAt.setDate(expiresAt.getDate() - 7); // Expires 1 week before event

                const bookingRequest = await BookingRequest.create({
                    customerId: customer._id,
                    restaurantId: restaurant._id,
                    spaceId: space._id,
                    eventDate: eventDate,
                    startTime: "19:00",
                    endTime: "23:00",
                    guestCount: 25,
                    eventStyle: "seated",
                    messageToHost: "Corporate dinner for our team. Looking forward to a great evening!",
                    bidPrice: 2500,
                    acceptMinSpend: 2000,
                    currency: "USD",
                    status: "approved",
                    decisionNotes: "Approved - looking forward to hosting your event!",
                    decisionAt: new Date(),
                    expiresAt: expiresAt
                });
                stats.bookingRequests++;

                // Create event
                const event = await Event.create({
                    bookingRequestId: bookingRequest._id,
                    finalGuestCount: 25,
                    menuSelection: {
                        selectedItems: ["Appetizer Platter", "Main Course", "Dessert Selection"]
                    },
                    setupNotes: "Round table setup preferred. Need AV equipment for presentation.",
                    timeline: {
                        guestArrival: "18:30",
                        foodService: "19:30",
                        teardown: "23:30"
                    },
                    productionRequirements: ["microphone", "projector", "wifi"],
                    fnbDetails: "3-course meal with wine pairing",
                    specsStatus: "final",
                    status: "final"
                });
                stats.events++;

                // Create review for completed event
                const pastEventDate = new Date();
                pastEventDate.setDate(pastEventDate.getDate() - 30); // 30 days ago
                const pastBookingRequest = await BookingRequest.create({
                    customerId: customer._id,
                    restaurantId: restaurant._id,
                    spaceId: space._id,
                    eventDate: pastEventDate,
                    startTime: "19:00",
                    endTime: "23:00",
                    guestCount: 20,
                    eventStyle: "seated",
                    status: "approved",
                    expiresAt: new Date(pastEventDate.getTime() - 7 * 24 * 60 * 60 * 1000)
                });

                const pastEvent = await Event.create({
                    bookingRequestId: pastBookingRequest._id,
                    finalGuestCount: 20,
                    status: "completed"
                });

                await Review.create({
                    eventId: pastEvent._id,
                    reviewerId: customer._id,
                    rating: 5,
                    reviewText: "Excellent experience! The food was outstanding and the service was impeccable. Highly recommend!",
                    eventType: "corporate",
                    status: "published"
                });
                stats.reviews++;

                console.log(`✓ Created booking requests, events, and reviews\n`);
            }
        }

        // Summary
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Seeding Summary:');
        console.log(`✓ Cuisines: ${stats.cuisines}`);
        console.log(`✓ Restaurants: ${stats.restaurants}`);
        console.log(`✓ Restaurant Spaces: ${stats.spaces}`);
        console.log(`✓ Subscriptions: ${stats.subscriptions}`);
        console.log(`✓ Media Items: ${stats.media}`);
        console.log(`✓ Availability Blocks: ${stats.availabilityBlocks}`);
        console.log(`✓ Customers: ${stats.customers}`);
        console.log(`✓ Booking Requests: ${stats.bookingRequests}`);
        console.log(`✓ Events: ${stats.events}`);
        console.log(`✓ Reviews: ${stats.reviews}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error seeding data:', error.message);
        console.error(error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

seedData();

