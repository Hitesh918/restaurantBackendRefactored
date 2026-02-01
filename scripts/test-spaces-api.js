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

const testSpacesAPI = async () => {
  const restaurantId = '697d876d4cd9aa8f3b1c5f2a';
  
  try {
    console.log(`\n=== Testing Spaces API for restaurant ID: ${restaurantId} ===\n`);
    
    // Get restaurant rooms directly from database
    const rooms = await mongoose.connection.db.collection('restaurantrooms').find({ 
      restaurantProfileId: new mongoose.Types.ObjectId(restaurantId) 
    }).toArray();
    
    console.log(`📊 Found ${rooms.length} rooms for this restaurant:\n`);
    
    if (rooms.length === 0) {
      console.log('❌ No rooms found for this restaurant');
    } else {
      rooms.forEach((room, index) => {
        console.log(`--- Room ${index + 1} ---`);
        console.log(`ID: ${room._id}`);
        console.log(`Name: ${room.roomName}`);
        console.log(`Description: ${room.description || 'No description'}`);
        console.log(`Seated Capacity: ${room.capacity?.seated?.min}-${room.capacity?.seated?.max}`);
        console.log(`Standing Capacity: ${room.capacity?.standing?.min}-${room.capacity?.standing?.max}`);
        console.log(`Features: ${room.features?.join(', ') || 'None'}`);
        console.log(`Room Type: ${room.roomType}`);
        console.log(`Active: ${room.isActive}`);
        console.log(`Photos: ${room.media?.photos?.length || 0}`);
        if (room.media?.photos?.length > 0) {
          const primaryPhoto = room.media.photos.find(p => p.isPrimary);
          console.log(`Primary Photo: ${primaryPhoto?.url || room.media.photos[0]?.url || 'None'}`);
        }
        console.log('');
      });
      
      // Transform to spaces format (like the API will do)
      console.log('=== Transformed to Spaces Format ===\n');
      
      const transformedSpaces = rooms.map(room => ({
        _id: room._id,
        name: room.roomName,
        restaurantId: room.restaurantProfileId,
        minCapacity: room.capacity?.seated?.min || 1,
        maxCapacity: room.capacity?.seated?.max || 50,
        allowedEventStyles: room.roomType === 'private_dining' ? ['seated', 'standing'] : ['seated'],
        features: room.features || [],
        heroImageUrl: room.media?.photos?.find(photo => photo.isPrimary)?.url || 
                     room.media?.photos?.[0]?.url || null,
        status: room.isActive ? 'active' : 'inactive',
        description: room.description,
        minimumSpend: room.minimumSpend,
        capacity: {
          seated: room.capacity?.seated || { min: 1, max: 50 },
          standing: room.capacity?.standing || { min: 1, max: 50 }
        }
      }));
      
      transformedSpaces.forEach((space, index) => {
        console.log(`--- Transformed Space ${index + 1} ---`);
        console.log(`ID: ${space._id}`);
        console.log(`Name: ${space.name}`);
        console.log(`Min Capacity: ${space.minCapacity}`);
        console.log(`Max Capacity: ${space.maxCapacity}`);
        console.log(`Event Styles: ${space.allowedEventStyles.join(', ')}`);
        console.log(`Features: ${space.features.join(', ') || 'None'}`);
        console.log(`Hero Image: ${space.heroImageUrl || 'None'}`);
        console.log(`Status: ${space.status}`);
        console.log('');
      });
      
      // Test the full URL transformation
      console.log('=== Testing Full URL Transformation ===\n');
      const baseUrl = 'http://localhost:8000';
      transformedSpaces.forEach((space, index) => {
        const heroImageUrl = rooms[index].media?.photos?.find(photo => photo.isPrimary)?.url || 
                           rooms[index].media?.photos?.[0]?.url;
        const fullHeroImageUrl = heroImageUrl ? `${baseUrl}${heroImageUrl}` : null;
        console.log(`Space ${index + 1} - ${space.name}:`);
        console.log(`  Original URL: ${heroImageUrl || 'None'}`);
        console.log(`  Full URL: ${fullHeroImageUrl || 'None'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error testing spaces API:', error);
  } finally {
    mongoose.connection.close();
  }
};

connectDB().then(() => {
  testSpacesAPI();
});