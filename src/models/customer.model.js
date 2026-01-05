const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true,
    },
    profilePhotoUrl: { 
        type: String, 
        required: [true, 'Profile photo URL is required'] 
    },
    profileDescription: { 
        type: String, 
        required: [true, 'Profile description is required'] 
    },
    name: {
        type: String,
        required: [true, 'Name cannot be empty'],
    },
    email: {
        type: String,
        required: [true, 'Email cannot be empty'],
        unique: true,
    },
    phone: {
        type: String,
        default: '',
    },
    joinedDate: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;
