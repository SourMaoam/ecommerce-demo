import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiService } from '../services/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // For now, use a temporary user ID
  const userId = 'temp-user-id';

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getCart(userId);
      setCart(response.data || { items: [], total: 0 });
    } catch (err) {
      // For now, use local storage when API is not available
      console.warn('API not available, using local storage', err);
      const localCart = getCartFromLocalStorage();
      setCart(localCart);
      setError(null); // Don't show error for local storage
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      // Add item to cart
      await apiService.addToCart({
        userId,
        productId,
        quantity
      });
      // Fetch updated cart after adding item
      const cartResponse = await apiService.getCart(userId);
      setCart(cartResponse.data);
    } catch (err) {
      // For now, use local storage when API is not available
      console.warn('API not available, using local storage', err);
      addToLocalCart(productId, quantity);
      const localCart = getCartFromLocalStorage();
      setCart(localCart);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (quantity < 1) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Update cart item quantity
      await apiService.updateCartItem(itemId, { quantity });
      // Fetch updated cart after updating
      const cartResponse = await apiService.getCart(userId);
      setCart(cartResponse.data);
    } catch (err) {
      // For now, use local storage when API is not available
      console.warn('API not available, using local storage', err);
      updateLocalCartItem(itemId, quantity);
      const localCart = getCartFromLocalStorage();
      setCart(localCart);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const removeFromCart = useCallback(async (itemId) => {
    setLoading(true);
    setError(null);
    
    try {
      // Remove item from cart
      await apiService.removeFromCart(itemId);
      // Fetch updated cart after removing
      const cartResponse = await apiService.getCart(userId);
      setCart(cartResponse.data);
    } catch (err) {
      // For now, use local storage when API is not available
      console.warn('API not available, using local storage', err);
      removeFromLocalCart(itemId);
      const localCart = getCartFromLocalStorage();
      setCart(localCart);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const clearCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Since there's no clear cart endpoint, remove all items individually
      const removePromises = cart.items.map(item => 
        apiService.removeFromCart(item.id)
      );
      await Promise.all(removePromises);
      
      // Set empty cart
      setCart({ items: [], total: 0 });
    } catch (err) {
      // For now, use local storage when API is not available
      console.warn('API not available, using local storage', err);
      clearLocalCart();
      setCart({ items: [], total: 0 });
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [cart.items]);

  // Load cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Calculate cart items count
  const cartItemsCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  const value = {
    cart,
    cartItemsCount,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Local storage helper functions for development
const CART_STORAGE_KEY = 'ecommerce_cart';

const getCartFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
  }
  return { items: [], total: 0 };
};

const saveCartToLocalStorage = (cart) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const addToLocalCart = (productId, quantity) => {
  const cart = getCartFromLocalStorage();
  
  // Mock product data - in real app this would come from API
  const mockProduct = getMockProduct(productId);
  if (!mockProduct) return;

  const existingItem = cart.items.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    const newItem = {
      id: Date.now(), // Simple ID generation
      productId,
      quantity,
      product: mockProduct
    };
    cart.items.push(newItem);
  }
  
  // Recalculate total
  cart.total = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  saveCartToLocalStorage(cart);
};

const updateLocalCartItem = (itemId, quantity) => {
  const cart = getCartFromLocalStorage();
  const item = cart.items.find(i => i.id === parseInt(itemId));
  
  if (item) {
    item.quantity = quantity;
    cart.total = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    saveCartToLocalStorage(cart);
  }
};

const removeFromLocalCart = (itemId) => {
  const cart = getCartFromLocalStorage();
  cart.items = cart.items.filter(item => item.id !== parseInt(itemId));
  cart.total = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  saveCartToLocalStorage(cart);
};

const clearLocalCart = () => {
  localStorage.removeItem(CART_STORAGE_KEY);
};

const getMockProduct = (productId) => {
  const mockProducts = {
    1: {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      price: 79.99,
      description: 'High-quality wireless headphones with noise cancellation',
      imageUrl: 'https://via.placeholder.com/300x300?text=Headphones',
      category: 'electronics',
      inStock: true
    },
    2: {
      id: 2,
      name: 'Smartphone Case',
      price: 24.99,
      description: 'Protective case for smartphones with drop protection',
      imageUrl: 'https://via.placeholder.com/300x300?text=Phone+Case',
      category: 'electronics',
      inStock: true
    },
    3: {
      id: 3,
      name: 'Cotton T-Shirt',
      price: 19.99,
      description: 'Comfortable 100% cotton t-shirt in various colors',
      imageUrl: 'https://via.placeholder.com/300x300?text=T-Shirt',
      category: 'clothing',
      inStock: true
    },
    4: {
      id: 4,
      name: 'Running Shoes',
      price: 89.99,
      description: 'Lightweight running shoes with excellent grip',
      imageUrl: 'https://via.placeholder.com/300x300?text=Shoes',
      category: 'sports',
      inStock: false
    },
    5: {
      id: 5,
      name: 'Coffee Maker',
      price: 129.99,
      description: 'Programmable coffee maker with 12-cup capacity',
      imageUrl: 'https://via.placeholder.com/300x300?text=Coffee+Maker',
      category: 'home',
      inStock: true
    },
    6: {
      id: 6,
      name: 'Book: JavaScript Guide',
      price: 34.99,
      description: 'Complete guide to modern JavaScript development',
      imageUrl: 'https://via.placeholder.com/300x300?text=Book',
      category: 'books',
      inStock: true
    }
  };

  return mockProducts[productId] || null;
};