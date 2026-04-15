// In-memory data store for the application

// Products database
let products = [
    {
        id: 1,
        name: 'Premium Wireless Headphones',
        description: 'Noise cancelling, 30hr battery life',
        price: 299.99,
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        stock: 50,
        badge: 'New'
    },
    {
        id: 2,
        name: 'Smart Watch Pro',
        description: 'Fitness tracking, AMOLED display',
        price: 399.99,
        category: 'Wearables',
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400',
        stock: 30,
        badge: 'Sale'
    },
    {
        id: 3,
        name: 'Ultra-Thin Laptop',
        description: '16GB RAM, 512GB SSD, Intel i7',
        price: 1299.99,
        category: 'Computers',
        image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400',
        stock: 20,
        badge: null
    },
    {
        id: 4,
        name: 'Flagship Smartphone',
        description: '5G, 128GB, Triple Camera',
        price: 899.99,
        category: 'Mobile',
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
        stock: 40,
        badge: null
    },
    {
        id: 5,
        name: 'Gaming Console X',
        description: '4K gaming, 1TB storage',
        price: 499.99,
        category: 'Gaming',
        image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400',
        stock: 25,
        badge: 'Hot'
    },
    {
        id: 6,
        name: 'True Wireless Earbuds',
        description: 'Active noise cancellation',
        price: 179.99,
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1560264280-88b68371db39?w=400',
        stock: 60,
        badge: null
    },
    {
        id: 7,
        name: 'Pro Tablet 12.9"',
        description: 'M1 chip, 256GB, Retina display',
        price: 799.99,
        category: 'Tablets',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
        stock: 35,
        badge: null
    },
    {
        id: 8,
        name: '4K Action Camera',
        description: 'Waterproof, stabilization',
        price: 349.99,
        category: 'Cameras',
        image: 'https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=400',
        stock: 45,
        badge: 'New'
    }
];

// Users database
let users = [
    {
        id: 1,
        email: 'demo@techstore.com',
        password: 'password123', // In production, use bcrypt hashing
        name: 'Demo User',
        phone: '+91 9876543210',
        address: '123 Tech Street, Mumbai',
        city: 'Mumbai',
        zipCode: '400001',
        createdAt: new Date('2026-01-01')
    }
];

// Shopping carts (userId -> cart items)
let carts = {};

// Orders database
let orders = [];

// Auto-increment IDs
let nextUserId = 2;
let nextOrderId = 1;

module.exports = {
    // Products
    getProducts: () => products,
    getProductById: (id) => products.find(p => p.id === parseInt(id)),
    getProductsByCategory: (category) => products.filter(p => p.category === category),
    addProduct: (product) => {
        const newProduct = { id: products.length + 1, ...product };
        products.push(newProduct);
        return newProduct;
    },
    updateProduct: (id, updates) => {
        const index = products.findIndex(p => p.id === parseInt(id));
        if (index === -1) return null;
        products[index] = { ...products[index], ...updates };
        return products[index];
    },
    deleteProduct: (id) => {
        const index = products.findIndex(p => p.id === parseInt(id));
        if (index === -1) return false;
        products.splice(index, 1);
        return true;
    },

    // Users
    getUsers: () => users.map(u => ({ ...u, password: undefined })), // Don't expose passwords
    getUserById: (id) => {
        const user = users.find(u => u.id === parseInt(id));
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    },
    getUserByEmail: (email) => users.find(u => u.email === email),
    addUser: (user) => {
        const newUser = { 
            id: nextUserId++, 
            ...user,
            createdAt: new Date()
        };
        users.push(newUser);
        const { password, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    },
    updateUser: (id, updates) => {
        const index = users.findIndex(u => u.id === parseInt(id));
        if (index === -1) return null;
        users[index] = { ...users[index], ...updates };
        const { password, ...userWithoutPassword } = users[index];
        return userWithoutPassword;
    },
    deleteUser: (id) => {
        const index = users.findIndex(u => u.id === parseInt(id));
        if (index === -1) return false;
        users.splice(index, 1);
        delete carts[id]; // Remove user's cart
        return true;
    },

    // Cart
    getCart: (userId) => carts[userId] || [],
    addToCart: (userId, item) => {
        if (!carts[userId]) {
            carts[userId] = [];
        }
        const existingIndex = carts[userId].findIndex(i => i.productId === item.productId);
        if (existingIndex > -1) {
            carts[userId][existingIndex].quantity += item.quantity;
        } else {
            carts[userId].push(item);
        }
        return carts[userId];
    },
    updateCartItem: (userId, productId, quantity) => {
        if (!carts[userId]) return null;
        const index = carts[userId].findIndex(i => i.productId === productId);
        if (index === -1) return null;
        if (quantity <= 0) {
            carts[userId].splice(index, 1);
        } else {
            carts[userId][index].quantity = quantity;
        }
        return carts[userId];
    },
    removeFromCart: (userId, productId) => {
        if (!carts[userId]) return false;
        const index = carts[userId].findIndex(i => i.productId === productId);
        if (index === -1) return false;
        carts[userId].splice(index, 1);
        return true;
    },
    clearCart: (userId) => {
        carts[userId] = [];
        return true;
    },

    // Orders
    getOrders: () => orders,
    getOrderById: (id) => orders.find(o => o.id === parseInt(id)),
    getOrdersByUserId: (userId) => orders.filter(o => o.userId === parseInt(userId)),
    createOrder: (order) => {
        const newOrder = {
            id: nextOrderId++,
            ...order,
            status: 'pending',
            createdAt: new Date()
        };
        orders.push(newOrder);
        return newOrder;
    },
    updateOrderStatus: (id, status) => {
        const index = orders.findIndex(o => o.id === parseInt(id));
        if (index === -1) return null;
        orders[index].status = status;
        orders[index].updatedAt = new Date();
        return orders[index];
    },

    // Statistics
    getStats: () => ({
        totalProducts: products.length,
        totalUsers: users.length,
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
        categories: [...new Set(products.map(p => p.category))]
    })
};
