const mongoose = require('mongoose');
const { ATLAS_DB_URL, NODE_ENV } = require('./server.config');

async function connectToDB() {
    if (!ATLAS_DB_URL) {
        throw new Error('ATLAS_DB_URL is not defined in environment variables');
    }

    try {
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(ATLAS_DB_URL, options);
        
        if (NODE_ENV !== 'test') {
            console.log('MongoDB connection established');
        }
    } catch(error) {
        console.error('Unable to connect to the database:', error.message);
        throw error;
    }
}

// Handle connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
});

module.exports = connectToDB;