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

const checkAllSpaces = async () => {
  const targetRestaurantId = '697d876d4cd9aa8f3b1c5f2a';
  
  try {
    console.log(`\n=== Checking all spaces and restaurants ===\n`);
    
    // Get all restaurant profiles
    const restaurantProfiles = await mongoose.connection.db.collection('restaurantprofiles').find().toArray();
    console.log(`📊 Found ${restaurantProfiles.length} restaurant profiles:`);
    restaurantProfiles.forEach(restaurant => {
      const isTarget = restaurant._id.toString() === targetRestaurantId;
      console.log(`${isTarget ? '🎯' : '  '} ${restaurant._id} - ${restaurant.restaurantName} (${restaurant.profileName})`);
    });
    console.log('');
    
    // Get all spaces
    const spaces = await mongoose.connection.db.collection('restaurantspaces').find().toArray();
    console.log(`🏠 Found ${spaces.length} spaces total:`);
    
    if (spaces.length === 0) {
      console.log('❌ No spaces found in the database');
      console.log('\n💡 This means:');
      console.log('1. No restaurants have created any spaces yet');
      console.log('2. You need to create spaces using the admin panel');
      console.log('3. The spaces page will show "No Spaces Available" message');
    } else {
      spaces.forEach((space, index) => {
        const belongsToTarget = space.restaurantId.toString() === targetRestaurantId;
        console.log(`${belongsToTarget ? '🎯' : '  '} Space ${index + 1}:`);
        console.log(`     ID: ${space._id}`);
        console.log(`     Name: ${space.name}`);
        console.log(`     Restaurant ID: ${space.restaurantId}`);
        console.log(`     Capacity: ${space.minCapacity}-${space.maxCapacity} guests`);
        console.log(`     Event Styles: ${space.allowedEventStyles?.join(', ') || 'None'}`);
        console.log(`     Features: ${space.features?.join(', ') || 'None'}`);
        console.log('');
      });
      
      // Check if any spaces belong to our target restaurant
      const targetSpaces = spaces.filter(space => space.restaurantId.toString() === targetRestaurantId);
      if (targetSpaces.length === 0) {
        console.log(`❌ No spaces found for restaurant ${targetRestaurantId}`);
        console.log('\n💡 To fix this:');
        console.log('1. Go to the admin panel: http://localhost:3001/restaurant-profiles/697d876d4cd9aa8f3b1c5f2a');
        console.log('2. Click "Add Room" to create spaces for this restaurant');
        console.log('3. Fill in the space details (name, capacity, features, etc.)');
        console.log('4. Save the space');
        console.log('5. The customer page will then show the spaces');
      } else {
        console.log(`✅ Found ${targetSpaces.length} spaces for restaurant ${targetRestaurantId}`);
      }
    }
    
  } catch (error) {
    console.error('Error checking spaces:', error);
  } finally {
    mongoose.connection.close();
  }
};

connectDB().then(() => {
  checkAllSpaces();
});