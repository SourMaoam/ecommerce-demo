import { useState, useCallback } from 'react';
import { apiService } from '../services/api';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // For now, use a temporary user ID
  const userId = 'temp-user-id';

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getOrders(userId);
      setOrders(response.data || []);
    } catch (err) {
      // For now, use mock data when API is not available
      console.warn('API not available, using mock data');
      const mockOrders = getMockOrders();
      setOrders(mockOrders);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getOrder(orderId);
      setOrder(response.data);
    } catch (err) {
      // For now, use mock data when API is not available
      console.warn('API not available, using mock data');
      const mockOrder = getMockOrder(orderId);
      setOrder(mockOrder);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (orderData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.createOrder(orderData);
      return response.data;
    } catch (err) {
      // For now, create mock order when API is not available
      console.warn('API not available, creating mock order');
      const mockOrder = createMockOrder(orderData);
      setError(null);
      return mockOrder;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    order,
    loading,
    error,
    fetchOrders,
    fetchOrder,
    createOrder,
  };
};

// Mock data generators for development
const getMockOrders = () => {
  return [
    {
      orderId: 'ORD-001',
      status: 'Processing',
      total: 159.98,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: 1,
          productId: 1,
          quantity: 2,
          product: {
            id: 1,
            name: 'Wireless Bluetooth Headphones',
            price: 79.99,
            imageUrl: 'https://via.placeholder.com/300x300?text=Headphones'
          }
        }
      ],
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        country: 'United States'
      }
    }
  ];
};

const getMockOrder = (orderId) => {
  return {
    orderId: orderId,
    status: 'Confirmed',
    total: 159.98,
    createdAt: new Date().toISOString(),
    items: [
      {
        id: 1,
        productId: 1,
        quantity: 2,
        product: {
          id: 1,
          name: 'Wireless Bluetooth Headphones',
          price: 79.99,
          imageUrl: 'https://via.placeholder.com/300x300?text=Headphones'
        }
      }
    ],
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      country: 'United States'
    }
  };
};

const createMockOrder = (orderData) => {
  const orderId = 'ORD-' + Date.now().toString().slice(-6);
  
  return {
    orderId: orderId,
    status: 'Confirmed',
    total: orderData.total,
    createdAt: new Date().toISOString(),
    items: orderData.cartItems,
    shippingAddress: orderData.shippingAddress
  };
};