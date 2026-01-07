# Restaurant Backend API

A production-ready Node.js/Express REST API for restaurant management system.

## Features

- **Authentication**: JWT-based authentication for Admin and Restaurant roles
- **Role-based Access Control**: Secure role-based authorization
- **Booking Management**: Complete booking workflow with messaging
- **Restaurant Management**: CRUD operations for restaurants, spaces, and subscriptions
- **Event Management**: Event creation and management
- **Error Handling**: Comprehensive error handling with proper status codes
- **Request Validation**: Input validation middleware
- **Database**: MongoDB with Mongoose ODM

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development
ATLAS_DB_URL=your_mongodb_connection_string
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
FRONTEND_URL=http://localhost:3001
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npx nodemon src/index.js
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Register new user (Admin/Restaurant/Customer)
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/update-password` - Update password (requires authentication)

### Restaurants
- `GET /api/v1/restaurants` - Get all restaurants
- `POST /api/v1/restaurants` - Create restaurant
- `GET /api/v1/restaurants/:id` - Get restaurant by ID
- `PUT /api/v1/restaurants/:id` - Update restaurant
- `DELETE /api/v1/restaurants/:id` - Delete restaurant

### Bookings
- `POST /api/v1/bookings` - Create booking request
- `GET /api/v1/bookings/restaurant/:restaurantId` - Get bookings by restaurant
- `GET /api/v1/bookings/customer/:customerId` - Get bookings by customer
- `POST /api/v1/bookings/:bookingRequestId/message` - Send message
- `POST /api/v1/bookings/:bookingRequestId/decision` - Approve/reject booking

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "error": {},
  "data": null
}
```

## Production Considerations

1. **Environment Variables**: Ensure all sensitive data is in environment variables
2. **JWT Secret**: Use a strong, random JWT secret (minimum 32 characters)
3. **Database**: Use MongoDB Atlas or a managed database service
4. **CORS**: Configure CORS properly for production frontend URL
5. **Rate Limiting**: Consider adding rate limiting middleware
6. **Logging**: Add proper logging (e.g., Winston)
7. **Monitoring**: Set up error monitoring (e.g., Sentry)

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization middleware
- Input validation
- Email normalization
- SQL injection prevention (MongoDB)
- CORS configuration
