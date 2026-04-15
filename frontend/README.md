# TechStore Frontend (React)

React-based e-commerce frontend with routing, API integration using Axios, and global state management using Context.

## Stack

- React 18
- React Router DOM
- Axios
- Context API
- Vite

## Implemented Components

- `ProductList` - Fetches and displays products from `/api/products`
- `ProductDetail` - Product detail page at `/products/:id`
- `Cart` - Cart management (add/update/remove/clear)
- `Checkout` - Creates orders through `/api/orders`

## Routing

- `/` -> Product list
- `/products/:id` -> Product detail
- `/cart` -> Cart
- `/checkout` -> Checkout

## State Management

Global state is handled in `src/context/StoreContext.jsx`:

- Products
- Cart items
- User identity (auto-resolved/created)
- Cart count and total
- Shared actions: add/update/remove/clear cart and place order

## API Layer

All HTTP calls are centralized in `src/services/api.js`.

- Products API
- Users API
- Cart API
- Orders API

## Run Locally

1. Start backend server (port 3000):

```bash
cd backend
npm install
npm run dev
```

2. Start frontend server (port 5173):

```bash
cd frontend
npm install
npm run dev
```

Vite proxy forwards `/api` requests to `http://localhost:3000`.

## Build

```bash
cd frontend
npm run build
```
