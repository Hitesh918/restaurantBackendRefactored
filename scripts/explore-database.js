const mongoose = require('mongoose');
require('dotenv').config();

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

const exploreDatabase = async () => {
  const restaurantId = '697d876d4cd9aa8f3b1c5f2a';
  
  try {
    console.log(`\n=== Exploring database for restaurant ID: ${restaurantId} ===\n`);
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available collections:');
    collections.forEach(col => console.log(`  - ${col.name}`));
    console.log('');
    
    // Check different possible restaurant collections
    const possibleRestaurantCollections = ['restaurants', 'restaurantprofiles', 'restaurant_profiles'];
    
    for (const collectionName of possibleRestaurantCollections) {
      try {
        const collection = mongoose.connection.db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`🔍 Collection "${collectionName}": ${count} documents`);
        
        if (count > 0) {
          // Try to find our specific restaurant
          const restaurant = await collection.findOne({ _id: new mongoose.Types.ObjectId(restaurantId) });
          if (restaurant) {
            console.log(`✅ Found restaurant in "${collectionName}":`, restaurant.restaurantName || restaurant.name || 'Name not set');
          } else {
            console.log(`❌ Restaurant ${restaurantId} not found in "${collectionName}"`);
          }
          
          // Show a sample document structure
          const sample = await collection.findOne();
          if (sample) {
            console.log(`📄 Sample document structure in "${collectionName}":`, Object.keys(sample));
          }
        }
        console.log('');
      } catch (err) {
        console.log(`❌ Collection "${collectionName}" doesn't exist or error: ${err.message}`);
      }
    }
    
    // Check for spaces collections
    const possibleSpaceCollections = ['spaces', 'restaurantspaces', 'restaurant_spaces'];
    
    for (const collectionName of possibleSpaceCollections) {
      try {
        const collection = mongoose.connection.db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`🏠 Collection "${collectionName}": ${count} documents`);
        
        if (count > 0) {
          // Try to find spaces for our restaurant
          const spaces = await collection.find({ restaurantId: new mongoose.Types.ObjectId(restaurantId) }).toArray();
          console.log(`   - Spaces for restaurant ${restaurantId}: ${spaces.length}`);
          
          if (spaces.length > 0) {
            spaces.forEach((space, index) => {
              console.log(`     Space ${index + 1}: ${space.name} (${space.minCapacity}-${space.maxCapacity} guests)`);
            });
          }
          
          // Show sample space structure
          const sampleSpace = await collection.findOne();
          if (sampleSpace) {
            console.log(`📄 Sample space structure:`, Object.keys(sampleSpace));
          }
        }
        console.log('');
      } catch (err) {
        console.log(`❌ Collection "${collectionName}" doesn't exist or error: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error exploring database:', error);
  } finally {
    mongoose.connection.close();
  }
};

connectDB().then(() => {
  exploreDatabase();
});