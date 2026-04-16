import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`)
};

export const userAPI = {
  getAll: () => api.get('/users'),
  register: (payload) => api.post('/users/register', payload)
};

export const cartAPI = {
  getCart: (userId) => api.get(`/cart/${userId}`),
  addToCart: (userId, payload) => api.post(`/cart/${userId}`, payload),
  updateQuantity: (userId, productId, quantity) =>
    api.put(`/cart/${userId}/${productId}`, { quantity }),
  removeItem: (userId, productId) => api.delete(`/cart/${userId}/${productId}`),
  clearCart: (userId) => api.delete(`/cart/${userId}`)
};

export const orderAPI = {
  createOrder: (payload) => api.post('/orders', payload)
};
