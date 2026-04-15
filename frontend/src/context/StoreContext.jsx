import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartAPI, orderAPI, paymentAPI, productAPI, userAPI } from '../services/api';

const StoreContext = createContext(null);

function isValidObjectId(value) {
  return typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);
}

function extractUserId(userRecord) {
  const candidate = userRecord?._id || userRecord?.id;
  return isValidObjectId(candidate) ? candidate : null;
}

function normalizeCartItems(items = []) {
  return items.map((item) => {
    const product = item.product || {};
    const productId = product._id || item.productId;
    const unitPrice = Number(product.price ?? item.price ?? 0);
    const quantity = Number(item.quantity ?? 0);

    return {
      productId,
      name: product.name || 'Unknown Product',
      image: product.image || '',
      price: unitPrice,
      quantity,
      lineTotal: Number((unitPrice * quantity).toFixed(2))
    };
  });
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.lineTotal, 0),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const loadProducts = useCallback(async () => {
    const response = await productAPI.getAll();
    setProducts(response.data.data || []);
  }, []);

  const ensureUser = useCallback(async () => {
    const savedUserId = localStorage.getItem('techstoreUserId');
    if (isValidObjectId(savedUserId)) {
      setUser({ id: savedUserId });
      return savedUserId;
    }

    localStorage.removeItem('techstoreUserId');

    const usersResponse = await userAPI.getAll();
    const existingUser = usersResponse.data.data?.[0];
    const existingUserId = extractUserId(existingUser);

    if (existingUserId) {
      localStorage.setItem('techstoreUserId', existingUserId);
      setUser({ ...existingUser, id: existingUserId });
      return existingUserId;
    }

    const timestamp = Date.now();
    const guestPayload = {
      name: 'Guest Shopper',
      email: `guest${timestamp}@techstore.local`,
      password: 'guest123',
      phone: '9999999999'
    };

    const created = await userAPI.register(guestPayload);
    const userId = extractUserId(created.data.data);

    if (!userId) {
      throw new Error('Invalid user id returned by API');
    }

    localStorage.setItem('techstoreUserId', userId);
    setUser({ ...created.data.data, id: userId });
    return userId;
  }, []);

  const loadCart = useCallback(async (userId) => {
    if (!isValidObjectId(userId)) {
      setCart([]);
      return;
    }

    const response = await cartAPI.getCart(userId);
    setCart(normalizeCartItems(response.data.items || []));
  }, []);

  const initializeStore = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      await loadProducts();
      const userId = await ensureUser();
      await loadCart(userId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize store');
    } finally {
      setLoading(false);
    }
  }, [ensureUser, loadCart, loadProducts]);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user?.id) return;

    try {
      setError('');
      await cartAPI.addToCart(user.id, { productId, quantity });
      await loadCart(user.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add item to cart');
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    if (!user?.id) return;

    try {
      setError('');
      await cartAPI.updateQuantity(user.id, productId, quantity);
      await loadCart(user.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update quantity');
    }
  };

  const removeFromCart = async (productId) => {
    if (!user?.id) return;

    try {
      setError('');
      await cartAPI.removeItem(user.id, productId);
      await loadCart(user.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove item');
    }
  };

  const clearCart = async () => {
    if (!user?.id) return;

    try {
      setError('');
      await cartAPI.clearCart(user.id);
      setCart([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to clear cart');
    }
  };

  const placeOrder = async (checkoutForm) => {
    if (!user?.id || cart.length === 0) {
      throw new Error('Cart is empty');
    }

    const payload = {
      userId: user.id,
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      shippingInfo: {
        fullName: checkoutForm.fullName,
        phone: checkoutForm.phone,
        email: checkoutForm.email,
        address: checkoutForm.address,
        city: checkoutForm.city,
        zipCode: checkoutForm.zipCode
      },
      paymentMethod: checkoutForm.paymentMethod,
      total: Number(cartTotal.toFixed(2))
    };

    try {
      setError('');
      const paymentResponse = await paymentAPI.process(payload.total);
      if (paymentResponse.data?.status !== 'success') {
        throw new Error('Payment failed');
      }

      const response = await orderAPI.createOrder(payload);
      await loadCart(user.id);
      return {
        ...response.data,
        payment: paymentResponse.data
      };
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to place order';
      setError(message);
      throw new Error(message);
    }
  };

  const value = {
    products,
    cart,
    user,
    loading,
    error,
    cartTotal,
    cartCount,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    placeOrder
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return context;
}
