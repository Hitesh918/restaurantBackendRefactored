const mongoose = require('mongoose');
require('dotenv').config();

const Review = require('../src/models/review.model');

async function fixReviewIndex() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Drop the old index
        try {
            await Review.collection.dropIndex('eventId_1');
            console.log('Dropped old eventId_1 index');
        } catch (err) {
            console.log('Old index not found or already dropped:', err.message);
        }

        // Create the new sparse unique index
        await Review.collection.createIndex({ eventId: 1 }, { sparse: true, unique: true });
        console.log('Created new sparse unique index on eventId');

        console.log('Index fix completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing index:', error);
        process.exit(1);
    }
}

fixReviewIndex();
