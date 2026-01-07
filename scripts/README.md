# Utility Scripts

Scripts for creating users and mock data in the database.

## Add Images to Existing Restaurants

Adds Unsplash images to restaurants that don't have images yet.

### Usage

```bash
npm run add-restaurant-images
```

### What it does

- Finds all active restaurants
- Checks if they already have images (skips if they do)
- Adds appropriate Unsplash images based on restaurant type:
  - **French/Fine Dining**: Elegant restaurant images
  - **Indian**: Indian cuisine and dining images
  - **Seafood**: Seafood and ocean view images
  - **Default**: General restaurant images
- Adds multiple image categories:
  - Hero image (main restaurant image)
  - Gallery images (dining areas)
  - Food & Beverage images
  - Ambience images

### Notes

- Only adds images to restaurants that don't already have a hero image
- Uses Unsplash URLs (no local file storage needed)
- Images are categorized and published automatically

---

## Add Menu PDFs to Restaurants

Adds menu PDFs to restaurants that don't have menus yet.

### Usage

```bash
npm run add-menu-pdfs
```

### What it does

- Finds all active restaurants
- Checks if they already have a menu PDF (skips if they do)
- Adds appropriate menu PDF URLs based on restaurant type:
  - **Indian restaurants**: Uses Copper Chimney menu PDF
  - **Other restaurants**: Uses general restaurant menu PDF
- Menu PDFs are stored in the Media collection with category "menu"

### Notes

- Only adds menus to restaurants that don't already have one
- Uses external PDF URLs (no local file storage needed)
- Menu PDFs are automatically linked to restaurants

---

## Seed Restaurant Data (Comprehensive)

Seeds all restaurant-related schemas with comprehensive data. This is the recommended script for seeding all restaurant-related data.

### Usage

```bash
npm run seed-restaurant-data
```

### What it seeds

1. **Cuisines** (20 cuisines)
   - French, Indian, Seafood, Italian, Japanese, American, Mexican, Vegan, etc.
   - All set to "Publish" status

2. **Restaurants** (3 sample restaurants)
   - The Grand Bistro (French, New York)
   - Spice Garden Indian Cuisine (Indian, San Francisco)
   - Ocean's Edge Seafood (Seafood, Miami)
   - All with complete profiles, addresses, opening hours, etc.
   - All passwords: `Restro@123`

3. **Restaurant Spaces** (Private dining spaces)
   - Multiple spaces per restaurant
   - With capacity, event styles, and features

4. **Restaurant Subscriptions**
   - Active subscriptions linked to restaurants
   - 1-year Premium Plan subscriptions

5. **Media** (Images and PDFs)
   - Hero images for restaurants
   - Gallery images
   - Menu PDFs

6. **Availability Blocks**
   - Sample availability blocks for restaurant spaces

7. **Customers**
   - Sample customer accounts for testing bookings

8. **Booking Requests**
   - Sample approved booking requests

9. **Events**
   - Events created from approved bookings
   - With complete event details

10. **Reviews**
    - Sample reviews for completed events

### Notes

- The script will skip items that already exist (based on email/name)
- All restaurant passwords are set to: `Restro@123`
- Creates a Premium Plan if it doesn't exist
- Provides a detailed summary of all created items

---

## Create Mock Restaurants (Simple)

Creates sample restaurants in the database with proper data. All restaurants will have the password `Restro@123`.

### Usage

```bash
npm run create-mock-restaurants
```

### What it does

- Creates 8 mock restaurants with complete data including:
  - User accounts with Restaurant role
  - Restaurant profiles with all required fields
  - Addresses, opening hours, cuisines, features
  - Ratings, reviews, pricing information
  - Offers and specials
  - All passwords set to: `Restro@123`

### Restaurants Created

1. The Grand Bistro (French, New York)
2. Spice Garden Indian Cuisine (Indian, San Francisco)
3. Ocean's Edge Seafood (Seafood, Miami)
4. Bella Italia (Italian, Chicago)
5. Sakura Japanese Sushi (Japanese, Los Angeles)
6. The Steakhouse (American, Boston)
7. Mama's Mexican Kitchen (Mexican, San Francisco)
8. Green Leaf Vegan Bistro (Vegan, Portland)

### Notes

- The script will skip restaurants if a user with the same email already exists
- All restaurants are created with `listingStatus: "active"`
- All restaurants have `tableBookingEnabled: true`

---

## Admin User Creation Scripts

Scripts to create admin users in the database.

## Interactive Script (Recommended)

This script will prompt you for email, password, and full name:

```bash
npm run create-admin
```

Or directly:
```bash
node scripts/create-admin.js
```

The script will:
- Prompt for email (with validation)
- Prompt for password (hidden input)
- Prompt for full name
- Check if user already exists
- Create the admin user with hashed password

## Simple Script (Command Line Arguments)

For automation or CI/CD, use the simple script with command line arguments:

```bash
node scripts/create-admin-simple.js <email> <password> <fullName>
```

Example:
```bash
node scripts/create-admin-simple.js admin@example.com password123 "Admin User"
```

## Requirements

1. Make sure your `.env` file is configured with:
   - `ATLAS_DB_URL` - MongoDB connection string
   - `JWT_SECRET` - JWT secret key

2. The database must be accessible and the connection string must be valid.

## Notes

- Email will be normalized to lowercase
- Password will be hashed using bcrypt
- Role will be set to "Admin"
- If a user with the same email already exists, the script will exit with an error
- Password must be at least 6 characters long

