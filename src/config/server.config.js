const dotenv = require('dotenv');

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['ATLAS_DB_URL', 'JWT_SECRET'];

if (process.env.NODE_ENV !== 'test') {
    requiredEnvVars.forEach(envVar => {
        if (!process.env[envVar]) {
            console.error(`ERROR: Missing required environment variable: ${envVar}`);
            if (envVar === 'JWT_SECRET') {
                console.error('Please set JWT_SECRET in your .env file (minimum 32 characters recommended)');
            }
            if (envVar === 'ATLAS_DB_URL') {
                console.error('Please set ATLAS_DB_URL in your .env file');
            }
        }
    });
}

module.exports = {
    PORT: process.env.PORT || 3000,
    ATLAS_DB_URL: process.env.ATLAS_DB_URL,
    JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-in-production-min-32-characters',
    NODE_ENV: process.env.NODE_ENV || "development",
    BACKEND_BASE_URL: process.env.BACKEND_BASE_URL || `http://localhost:${process.env.PORT || 3000}`
}