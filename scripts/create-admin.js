require('dotenv').config();
const mongoose = require('mongoose');
const { ATLAS_DB_URL } = require('../src/config/server.config');
const UserRepository = require('../src/repositories/user.repository');
const { hashPassword } = require('../src/utils/bcrypt');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to get user input
function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// Helper function to get password input (simple version - shows input for compatibility)
function questionPassword(query) {
    return new Promise(resolve => {
        // For better cross-platform compatibility, we'll just use regular input
        // In production, consider using a library like 'readline-sync' or 'inquirer'
        rl.question(query, (answer) => {
            resolve(answer);
        });
    });
}

async function createAdminUser() {
    try {
        // Connect to database
        console.log('Connecting to database...');
        await mongoose.connect(ATLAS_DB_URL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✓ Connected to database\n');

        const userRepository = new UserRepository();

        // Get user input
        let email = process.argv[2];
        let password = process.argv[3];
        let fullName = process.argv[4];

        // If not provided via command line, prompt for input
        if (!email) {
            email = await question('Enter admin email: ');
        }
        if (!password) {
            password = await questionPassword('Enter admin password: ');
        }
        if (!fullName) {
            fullName = await question('Enter admin full name: ');
        }

        // Validate inputs
        if (!email || !email.includes('@')) {
            throw new Error('Valid email is required');
        }
        if (!password || password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        if (!fullName || fullName.trim().length === 0) {
            throw new Error('Full name is required');
        }

        // Check if user already exists
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            console.log('\n❌ Error: User with this email already exists!');
            console.log(`   Email: ${existingUser.email}`);
            console.log(`   Role: ${existingUser.role}`);
            process.exit(1);
        }

        // Hash password
        console.log('\nCreating admin user...');
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
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    } finally {
        rl.close();
    }
}

// Run the script
createAdminUser();

