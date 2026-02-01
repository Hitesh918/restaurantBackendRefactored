const mongoose = require('mongoose');

const restaurantRoomSchema = new mongoose.Schema({
    restaurantProfileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RestaurantProfile",
        required: true,
    },
    
    // Basic Room Information
    roomName: { type: String, required: true }, // e.g., "Attico"
    description: { type: String },
    
    // Capacity
    capacity: {
        seated: {
            min: { type: Number, required: true },
            max: { type: Number, required: true }
        },
        standing: {
            min: { type: Number, required: true },
            max: { type: Number, required: true }
        }
    },
    
    // Pricing (can vary by day/time)
    minimumSpend: {
        weekday: {
            lunch: { type: Number },
            dinner: { type: Number },
            allDay: { type: Number }
        },
        weekend: {
            lunch: { type: Number },
            dinner: { type: Number },
            allDay: { type: Number }
        },
        holiday: {
            lunch: { type: Number },
            dinner: { type: Number },
            allDay: { type: Number }
        }
    },
    
    // Special Features (for advanced filtering) - Standardized dropdown options
    features: [{
        type: String,
        enum: [
            'separate_entrance',
            'audio_visual', 
            'wet_bar',
            'private_washrooms',
            'wifi',
            'outdoor_seating', // Standardized from "patio"
            'natural_light',
            'fireplace',
            'dance_floor',
            'stage',
            'projector',
            'sound_system',
            'microphone',
            'piano',
            'parking',
            'wheelchair_accessible',
            'air_conditioning',
            'heating',
            'kitchen_access',
            'bar_service',
            'coat_check',
            'valet_parking',
            'elevator_access',
            'balcony',
            'terrace',
            'garden_view',
            'city_view',
            'water_view',
            'private_entrance',
            'catering_kitchen',
            'bridal_suite',
            'green_room',
            'loading_dock'
        ]
    }],
    
    // In-house furniture list
    furniture: [{
        item: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        description: { type: String },
        category: { 
            type: String, 
            enum: ['seating', 'tables', 'decor', 'lighting', 'audio_visual', 'bar', 'other'],
            default: 'other'
        }
    }],
    
    // Media Management
    media: {
        photos: [{
            url: { type: String },
            filename: { type: String },
            caption: { type: String },
            isPrimary: { type: Boolean, default: false },
            uploadedAt: { type: Date, default: Date.now }
        }],
        menus: [{
            url: { type: String },
            filename: { type: String },
            title: { type: String },
            description: { type: String },
            uploadedAt: { type: Date, default: Date.now }
        }],
        floorplan: {
            url: { type: String },
            filename: { type: String },
            uploadedAt: { type: Date, default: Date.now }
        },
        // New media types
        tours: [{
            url: { type: String },
            title: { type: String },
            description: { type: String },
            type: { type: String, enum: ['video', 'virtual_tour', '360_tour'], default: 'video' },
            uploadedAt: { type: Date, default: Date.now }
        }],
        pastEvents: [{
            url: { type: String },
            filename: { type: String },
            eventName: { type: String },
            eventDate: { type: Date },
            caption: { type: String },
            uploadedAt: { type: Date, default: Date.now }
        }]
    },
    
    // Room Status
    isActive: { type: Boolean, default: true },
    
    // Additional room details
    roomType: { 
        type: String, 
        enum: ['private_dining', 'event_space', 'meeting_room', 'banquet_hall', 'rooftop', 'patio', 'wine_room', 'chef_table'],
        default: 'private_dining'
    },
    
    // Booking settings
    bookingSettings: {
        minimumNotice: { type: Number, default: 24 }, // hours
        maximumAdvanceBooking: { type: Number, default: 365 }, // days
        cancellationPolicy: { type: String },
        depositRequired: { type: Boolean, default: false },
        depositPercentage: { type: Number, default: 0 }
    },
    
    // Availability settings
    availability: {
        monday: { available: { type: Boolean, default: true }, timeSlots: [String] },
        tuesday: { available: { type: Boolean, default: true }, timeSlots: [String] },
        wednesday: { available: { type: Boolean, default: true }, timeSlots: [String] },
        thursday: { available: { type: Boolean, default: true }, timeSlots: [String] },
        friday: { available: { type: Boolean, default: true }, timeSlots: [String] },
        saturday: { available: { type: Boolean, default: true }, timeSlots: [String] },
        sunday: { available: { type: Boolean, default: true }, timeSlots: [String] },
    },
    
}, { timestamps: true });

// Indexes for search performance
restaurantRoomSchema.index({ restaurantProfileId: 1, isActive: 1 });
restaurantRoomSchema.index({ roomName: 'text', description: 'text' });
restaurantRoomSchema.index({ 'capacity.seated.min': 1, 'capacity.seated.max': 1 });
restaurantRoomSchema.index({ 'capacity.standing.min': 1, 'capacity.standing.max': 1 });
restaurantRoomSchema.index({ roomType: 1 });

// Compound indexes for filtering
restaurantRoomSchema.index({ 
    features: 1,
    roomType: 1
});

const RestaurantRoom = mongoose.model('RestaurantRoom', restaurantRoomSchema);

module.exports = RestaurantRoom;