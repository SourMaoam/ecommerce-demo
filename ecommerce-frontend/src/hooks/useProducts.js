import { useState, useCallback } from 'react';
import { apiService } from '../services/api';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Remove empty filters
      const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await apiService.getProducts(cleanedFilters);
      setProducts(response.data || []);
    } catch (err) {
      // For now, use mock data when API is not available
      console.warn('API not available, using mock data');
      setProducts(generateMockProducts(filters));
      setError(null); // Don't show error for mock data
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getProduct(id);
      setProduct(response.data);
    } catch (err) {
      // For now, use mock data when API is not available
      console.warn('API not available, using mock data');
      const mockProduct = generateMockProduct(id);
      setProduct(mockProduct);
      setError(null); // Don't show error for mock data
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    product,
    loading,
    error,
    fetchProducts,
    fetchProduct,
  };
};

// Mock data generators for development
const generateMockProducts = (filters = {}) => {
  const mockProducts = [
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      price: 79.99,
      description: 'High-quality wireless headphones with noise cancellation',
      imageUrl: 'https://via.placeholder.com/300x300?text=Headphones',
      category: 'electronics',
      inStock: true
    },
    {
      id: 2,
      name: 'Smartphone Case',
      price: 24.99,
      description: 'Protective case for smartphones with drop protection',
      imageUrl: 'https://via.placeholder.com/300x300?text=Phone+Case',
      category: 'electronics',
      inStock: true
    },
    {
      id: 3,
      name: 'Cotton T-Shirt',
      price: 19.99,
      description: 'Comfortable 100% cotton t-shirt in various colors',
      imageUrl: 'https://via.placeholder.com/300x300?text=T-Shirt',
      category: 'clothing',
      inStock: true
    },
    {
      id: 4,
      name: 'Running Shoes',
      price: 89.99,
      description: 'Lightweight running shoes with excellent grip',
      imageUrl: 'https://via.placeholder.com/300x300?text=Shoes',
      category: 'sports',
      inStock: false
    },
    {
      id: 5,
      name: 'Coffee Maker',
      price: 129.99,
      description: 'Programmable coffee maker with 12-cup capacity',
      imageUrl: 'https://via.placeholder.com/300x300?text=Coffee+Maker',
      category: 'home',
      inStock: true
    },
    {
      id: 6,
      name: 'Book: JavaScript Guide',
      price: 34.99,
      description: 'Complete guide to modern JavaScript development',
      imageUrl: 'https://via.placeholder.com/300x300?text=Book',
      category: 'books',
      inStock: true
    }
  ];

  let filteredProducts = [...mockProducts];

  // Apply filters
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.category) {
    filteredProducts = filteredProducts.filter(product =>
      product.category === filters.category
    );
  }

  if (filters.minPrice) {
    filteredProducts = filteredProducts.filter(product =>
      product.price >= parseFloat(filters.minPrice)
    );
  }

  if (filters.maxPrice) {
    filteredProducts = filteredProducts.filter(product =>
      product.price <= parseFloat(filters.maxPrice)
    );
  }

  // Apply sorting
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-low':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
  }

  return filteredProducts;
};

const generateMockProduct = (id) => {
  const mockProducts = generateMockProducts();
  return mockProducts.find(product => product.id === parseInt(id)) || null;
};