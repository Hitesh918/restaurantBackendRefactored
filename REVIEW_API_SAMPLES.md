# Review API - Sample Requests

## 1. Create Event-Based Review
**Endpoint:** `POST /events/:eventId/reviews`

**Description:** Submit a review for a completed event

**Sample Request:**
```json
{
  "reviewerId": "67a1b2c3d4e5f6g7h8i9j0k1",
  "rating": 5,
  "reviewText": "Excellent venue and amazing service! The food was delicious and the staff was very attentive.",
  "eventType": "corporate",
  "photos": ["67a1b2c3d4e5f6g7h8i9j0k2", "67a1b2c3d4e5f6g7h8i9j0k3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "error": {},
  "data": {
    "reviewId": "67a1b2c3d4e5f6g7h8i9j0k4",
    "status": "pending_moderation"
  }
}
```

---

## 2. Create General Restaurant Review (No Event)
**Endpoint:** `POST /events/restaurants/:restaurantId/reviews`

**Description:** Submit a general review for a restaurant (not tied to any event)

**Sample Request:**
```json
{
  "reviewerId": "67a1b2c3d4e5f6g7h8i9j0k1",
  "rating": 4,
  "reviewText": "Great ambiance and wonderful food. Perfect for casual dining with friends. Would definitely recommend!"
  
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "error": {},
  "data": {
    "reviewId": "67a1b2c3d4e5f6g7h8i9j0k6",
    "status": "pending_moderation"
  }
}
```

---

## 3. Get All Reviews for a Restaurant
**Endpoint:** `GET /events/restaurants/:restaurantId/reviews`

**Description:** Fetch all published reviews for a specific restaurant

**Sample Response:**
```json
{
  "success": true,
  "message": "Reviews fetched successfully",
  "error": {},
  "data": [
    {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k6",
      "eventId": null,
      "restaurantId": "67a1b2c3d4e5f6g7h8i9j0k7",
      "reviewerId": {
        "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "companyName": "Tech Corp"
      },
      "rating": 4,
      "reviewText": "Great ambiance and wonderful food. Perfect for casual dining with friends.",
      "eventType": "personal",
      "photos": ["67a1b2c3d4e5f6g7h8i9j0k5"],
      "status": "published",
      "createdAt": "2025-01-17T10:30:00Z",
      "updatedAt": "2025-01-17T10:30:00Z"
    },
    {
      "_id": "67a1b2c3d4e5f6g7h8i9j0k8",
      "eventId": "67a1b2c3d4e5f6g7h8i9j0k9",
      "restaurantId": "67a1b2c3d4e5f6g7h8i9j0k7",
      "reviewerId": {
        "_id": "67a1b2c3d4e5f6g7h8i9j0k2",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "phone": "+0987654321",
        "companyName": "Design Studio"
      },
      "rating": 5,
      "reviewText": "Excellent venue and amazing service! The food was delicious and the staff was very attentive.",
      "eventType": "corporate",
      "photos": ["67a1b2c3d4e5f6g7h8i9j0k10", "67a1b2c3d4e5f6g7h8i9j0k11"],
      "status": "published",
      "createdAt": "2025-01-16T14:20:00Z",
      "updatedAt": "2025-01-16T14:20:00Z"
    }
  ]
}
```

---

## Field Descriptions

### Required Fields
- **reviewerId** (string): MongoDB ObjectId of the customer/reviewer
- **rating** (number): Rating from 1 to 5
- **reviewText** (string): The review content/description

### Optional Fields
- **eventType** (string): Type of event - `"corporate"`, `"personal"`, or `"agency"`
- **photos** (array): Array of MongoDB ObjectIds referencing Media documents

### Response Fields
- **status** (string): Review status - `"pending_moderation"`, `"published"`, or `"rejected"`
- **eventId** (string or null): Event ID if review is event-based, null for general reviews
