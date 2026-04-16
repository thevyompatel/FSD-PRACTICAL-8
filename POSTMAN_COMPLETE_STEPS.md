# Complete Postman Steps for MERN Practical

## 1. Start Backend Before Postman
1. Open terminal in backend folder.
2. Run:

npm run dev

3. Confirm logs show:
- MongoDB Connected
- Server running at http://localhost:5000

## 2. Create Postman Environment
1. Open Postman.
2. Create environment: MERN Practical Local.
3. Add variables:
- baseUrl = http://localhost:5000
- token = (empty)
- userId = (empty)
- productId = (empty)
- userEmail = testuser@gmail.com
- userPassword = 123456
4. Save and select this environment.

## 3. Create Collection
1. Create collection: MERN Practical - Auth Upload Payment.
2. Add requests in the order below.

## 4. Request 1: Register
- Method: POST
- URL: {{baseUrl}}/api/auth/register
- Body: raw JSON

{
  "name": "Postman User",
  "email": "{{userEmail}}",
  "password": "{{userPassword}}",
  "phone": "9999999999"
}

Expected:
- Status 201
- success = true

## 5. Request 2: Login
- Method: POST
- URL: {{baseUrl}}/api/auth/login
- Body: raw JSON

{
  "email": "{{userEmail}}",
  "password": "{{userPassword}}"
}

Expected:
- Status 200
- token in response

### Login Tests script (auto-save token and userId)

const json = pm.response.json();
pm.environment.set("token", json.token);
if (json.data && (json.data.id || json.data._id)) {
  pm.environment.set("userId", json.data.id || json.data._id);
}

## 6. Request 3: Auth Me
- Method: GET
- URL: {{baseUrl}}/api/auth/me
- Header:
  - Authorization: Bearer {{token}}

Expected:
- Status 200
- User details returned

## 7. Request 4: Add Product With Image
- Method: POST
- URL: {{baseUrl}}/api/products
- Header:
  - Authorization: Bearer {{token}}
- Body: form-data
  - name = Postman Practical Product
  - price = 299.50
  - category = Demo
  - stock = 3
  - description = Created from Postman
  - image = File (pick any local file)

Expected:
- Status 201
- success = true
- _id returned in data

### Add Product Tests script (auto-save productId)

const json = pm.response.json();
if (json.data && json.data._id) {
  pm.environment.set("productId", json.data._id);
}

## 8. Request 5: Get Products
- Method: GET
- URL: {{baseUrl}}/api/products

Expected:
- Status 200
- Product list includes your uploaded product

## 9. Request 6: Mock Payment
- Method: POST
- URL: {{baseUrl}}/api/payment
- Body: raw JSON

{
  "amount": 499.99
}

Expected:
- Status 200
- status = success

## 10. Final Test Flow (Very Important)
Run in this exact order:
1. Register
2. Login
3. Auth Me
4. Add Product (with token + image)
5. Get Products
6. Payment

## 11. Common Errors and Fixes
### Error: EADDRINUSE 5000
Cause: another backend instance already running.
Fix: stop old process, run backend once.

### Error: 401 Unauthorized
Cause: missing or invalid token.
Fix: run login again and use latest token.

### Upload fails
Cause: image field is not set as File.
Fix: in form-data, set image type to File and choose file.

### Connection refused
Cause: backend not running or wrong URL.
Fix: ensure backend is running and baseUrl is http://localhost:5000.

## 12. Optional Runner Validation
1. Open Collection Runner.
2. Select your collection and environment.
3. Run all requests in order.
4. Verify all are green.

## 13. Ready Import Files (Already Added in Project)
- postman/MERN-Practical.postman_collection.json
- postman/MERN-Practical-Local.postman_environment.json
