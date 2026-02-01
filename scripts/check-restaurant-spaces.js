const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.ATLAS_DB_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-booking';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define Space schema (matching your backend model)
const spaceSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  minCapacity: { type: Number, default: 1 },
  maxCapacity: { type: Number, required: true },
  allowedEventStyles: [{ type: String }],
  features: [{ type: String }],
  pricing: { type: Object, default: {} },
  contracts: [{ type: Object }]
}, { timestamps: true });

const Space = mongoose.model('Space', spaceSchema);

// Define Restaurant schema for reference
const restaurantSchema = new mongoose.Schema({
  restaurantName: String,
  // Add other fields as needed
}, { timestamps: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

const checkRestaurantSpaces = async () => {
  const restaurantId = '697d876d4cd9aa8f3b1c5f2a';
  
  try {
    console.log(`\n=== Checking spaces for restaurant ID: ${restaurantId} ===\n`);
    
    // First, check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (restaurant) {
      console.log('✅ Restaurant found:', restaurant.restaurantName || 'Name not set');
    } else {
      console.log('❌ Restaurant not found in database');
      return;
    }
    
    // Find all spaces for this restaurant
    const spaces = await Space.find({ restaurantId: restaurantId });
    
    console.log(`\n📊 Found ${spaces.length} spaces for this restaurant:\n`);
    
    if (spaces.length === 0) {
      console.log('❌ No spaces found for this restaurant');
      console.log('\n💡 Suggestions:');
      console.log('1. Check if spaces are stored in a different collection');
      console.log('2. Verify the restaurantId is correct');
      console.log('3. Create spaces using the admin panel');
    } else {
      spaces.forEach((space, index) => {
        console.log(`--- Space ${index + 1} ---`);
        console.log(`ID: ${space._id}`);
        console.log(`Name: ${space.name}`);
        console.log(`Capacity: ${space.minCapacity}-${space.maxCapacity} guests`);
        console.log(`Event Styles: ${space.allowedEventStyles?.join(', ') || 'None'}`);
        console.log(`Features: ${space.features?.join(', ') || 'None'}`);
        console.log(`Created: ${space.createdAt}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error checking spaces:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the script
connectDB().then(() => {
  checkRestaurantSpaces();
});