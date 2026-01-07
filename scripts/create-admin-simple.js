/**
 * Simple script to create admin user with command line arguments
 * Usage: node scripts/create-admin-simple.js <email> <password> <fullName>
 * Example: node scripts/create-admin-simple.js admin@example.com password123 "Admin User"
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { ATLAS_DB_URL } = require('../src/config/server.config');
const UserRepository = require('../src/repositories/user.repository');
const { hashPassword } = require('../src/utils/bcrypt');

async function createAdminUser() {
    try {
        // Get command line arguments
        const email = process.argv[2];
        const password = process.argv[3];
        const fullName = process.argv[4];

        // Validate arguments
        if (!email || !password || !fullName) {
            console.error('❌ Error: Missing required arguments');
            console.log('\nUsage: node scripts/create-admin-simple.js <email> <password> <fullName>');
            console.log('Example: node scripts/create-admin-simple.js admin@example.com password123 "Admin User"\n');
            process.exit(1);
        }

        // Validate email format
        if (!email.includes('@')) {
            console.error('❌ Error: Invalid email format');
            process.exit(1);
        }

        // Validate password length
        if (password.length < 6) {
            console.error('❌ Error: Password must be at least 6 characters long');
            process.exit(1);
        }

        // Connect to database
        console.log('Connecting to database...');
        await mongoose.connect(ATLAS_DB_URL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✓ Connected to database\n');

        const userRepository = new UserRepository();

        // Check if user already exists
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            console.log('❌ Error: User with this email already exists!');
            console.log(`   Email: ${existingUser.email}`);
            console.log(`   Role: ${existingUser.role}\n`);
            await mongoose.connection.close();
            process.exit(1);
        }

        // Hash password
        console.log('Creating admin user...');
        const hashedPassword = await hashPassword(password);

        // Create admin user
        const adminUser = await userRepository.createUser({
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: 'Admin',
            fullName: fullName.trim(),
        });

        console.log('\n✓ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Email:     ${adminUser.email}`);
        console.log(`Full Name: ${adminUser.fullName}`);
        console.log(`Role:      ${adminUser.role}`);
        console.log(`ID:        ${adminUser._id}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Close database connection
        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error creating admin user:', error.message);
        if (error.code === 11000) {
            console.error('   Duplicate email - user already exists');
        }
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

// Run the script
createAdminUser();

