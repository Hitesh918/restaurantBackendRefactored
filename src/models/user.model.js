const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email cannot be empty'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password cannot be empty'],
    },
    role: {
        type: String,
        enum: ['Admin', 'Customer', 'Restaurant'],
        default: 'Customer',
    },
    fullName: {
        type: String,
        required: [true, 'Full name cannot be empty'],
    },
    phone: {
        type: String,
    },
    companyName: {
        type: String,
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
