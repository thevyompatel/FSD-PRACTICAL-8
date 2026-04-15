# MERN Practical Backend

Node.js + Express backend for JWT authentication, password hashing, image upload, validation, and a mock payment API.

## 🚀 Quick Start

### Installation

```bash
cd backend
npm install
```

### Run Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server runs on: `http://localhost:5000`

### Environment

Create `backend/.env` with:

```bash
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mern_practical
JWT_SECRET=mysecretkey
```

### MongoDB Setup

- Default connection string: `mongodb://127.0.0.1:27017/mern_practical`
- Configurable via environment variable: `MONGO_URI`
- Ensure local MongoDB service is running before starting the server

## 📁 Project Structure

```
backend/
│
├── server.js              # Main Express server
├── config/
│   └── db.js              # MongoDB connection config
├── models/
│   ├── Product.js         # Product schema/model
│   ├── User.js            # User schema/model
│   ├── Order.js           # Order schema/model
│   └── Cart.js            # Cart schema/model
├── routes/
│   ├── auth.js            # JWT auth endpoints
│   ├── products.js        # Product endpoints
│   ├── users.js           # User endpoints
│   ├── cart.js            # Shopping cart endpoints
│   └── orders.js          # Order management endpoints
│
├── middleware/
│   ├── errorHandler.js    # Global error handling
│   └── validate.js        # Request validation
│
```

## 🔌 API Endpoints

### Auth API (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user with hashed password |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user from token |

### Products API (`/api/products`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get product by ID |
| GET | `/api/products/category/:category` | Get products by category |
| POST | `/api/products` | Add new product with image upload |
| PUT | `/api/products/:id` | Update product and/or image |
| DELETE | `/api/products/:id` | Delete product |

**Query Parameters:**
- `category` - Filter by category
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `search` - Search in name/description

**Example Request:**
```bash
GET /api/products?category=Audio&minPrice=100&maxPrice=500
```

### Users API (`/api/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | User login |
| GET | `/api/users/me` | Get current user from token |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/users/:id/orders` | Get user's orders |

**Register Example:**
```json
POST /api/users/register
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+91 9876543210"
}
```

**Login Example:**
```json
POST /api/users/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Cart API (`/api/cart`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart/:userId` | Get user's cart |
| POST | `/api/cart/:userId` | Add item to cart |
| PUT | `/api/cart/:userId/:productId` | Update cart item quantity |
| DELETE | `/api/cart/:userId/:productId` | Remove item from cart |
| DELETE | `/api/cart/:userId` | Clear entire cart |

**Add to Cart Example:**
```json
POST /api/cart/1
{
  "productId": "<productObjectId>",
  "quantity": 2
}
```

### Orders API (`/api/orders`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/:id` | Get order by ID |
| GET | `/api/orders/user/:userId` | Get user's orders |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/:id/status` | Update order status |
| GET | `/api/orders/stats/summary` | Get order statistics |

**Create Order Example:**
```json
POST /api/orders
{
  "userId": "<userObjectId>",
  "items": [
    {
      "productId": "<productObjectId>",
      "quantity": 2,
      "price": 299.99
    }
  ],
  "shippingInfo": {
    "fullName": "John Doe",
    "phone": "+91 9876543210",
    "email": "john@example.com",
    "address": "123 Street",
    "city": "Mumbai",
    "zipCode": "400001"
  },
  "paymentMethod": "cod",
  "total": 599.98
}
```

### Mock Payment API (`/api/payment`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment` | Return success when `amount > 0` |

**Example:**
```json
POST /api/payment
{
  "amount": 999.99
}
```

## 🛡️ Validation & Error Handling

### Request Validation

All routes include input validation:
- Email format validation
- Password length checks
- Required field validation
- Data type validation
- Stock availability checks

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Specific error 1", "Specific error 2"],
  "path": "/api/endpoint",
  "method": "POST",
  "timestamp": "2026-02-12T10:30:00.000Z"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## 🔧 Middleware

### Validation Middleware (`validate.js`)

- `validateProduct` - Product data validation
- `validateProductUpdate` - Partial product update validation
- `validateUser` - User registration validation
- `validateLogin` - Login credentials validation
- `validateCartItem` - Cart item validation
- `validateOrder` - Order creation validation
- `validatePayment` - Mock payment amount validation
- `validateId` - ID parameter validation

### Error Handler (`errorHandler.js`)

- Global error catching
- Detailed error logging
- Custom error responses
- Async error handling

## 📊 Response Format

All API responses follow consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "count": 10
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

## 🔐 Security Notes

> **Warning:** This is a demo application. In production:
> - Use environment variables for configuration
> - Implement JWT authentication
> - Hash passwords with bcrypt
> - Add rate limiting
> - Implement HTTPS
> - Add input sanitization

## 📝 Demo Credentials

**Test User:**
- Email: `demo@techstore.com`
- Password: `password123`

## 🧪 Practical Test Flow

1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. Copy the returned token
4. `POST /api/products` with `Authorization: Bearer <token>` and `form-data` image upload
5. `GET /api/products`
6. `POST /api/payment` with a positive amount

## 🧪 Testing API

Use tools like:
- **Postman** - GUI API testing
- **Thunder Client** - VS Code extension
- **cURL** - Command line

Example cURL request:
```bash
curl http://localhost:5000/api/products
```

## 📦 Dependencies

- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `mongoose` - MongoDB object modeling
- `nodemon` - Development auto-reload

## 🚀 Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use process manager (PM2)
3. Set up reverse proxy (Nginx)
4. Enable HTTPS
5. Configure database
6. Add logging system

---

Built with ❤️ for TechStore E-commerce Platform
