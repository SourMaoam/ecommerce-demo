import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import styles from './ProductFilters.module.css';

const ProductFilters = ({ filters, onFilterChange }) => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await apiService.getCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.warn('Could not fetch categories, using fallback:', error);
        // Fallback categories based on backend update
        setCategories([
          'Electronics',
          'Home & Kitchen', 
          'Sports & Fitness',
          'Books & Media',
          'Fashion & Accessories'
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'name'
    });
  };

  return (
    <div className={styles.filters}>
      <div className={styles.filterHeader}>
        <h3>Filters</h3>
        <button 
          className={styles.clearButton}
          onClick={handleClearFilters}
        >
          Clear All
        </button>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="text"
          value={filters.search}
          onChange={(e) => handleInputChange('search', e.target.value)}
          placeholder="Search products..."
          className={styles.input}
        />
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={filters.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className={styles.select}
          disabled={categoriesLoading}
        >
          <option value="">All Categories</option>
          {categoriesLoading ? (
            <option disabled>Loading categories...</option>
          ) : (
            categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))
          )}
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label>Price Range</label>
        <div className={styles.priceRange}>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleInputChange('minPrice', e.target.value)}
            placeholder="Min"
            min="0"
            className={styles.priceInput}
          />
          <span>to</span>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleInputChange('maxPrice', e.target.value)}
            placeholder="Max"
            min="0"
            className={styles.priceInput}
          />
        </div>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="sortBy">Sort By</label>
        <select
          id="sortBy"
          value={filters.sortBy}
          onChange={(e) => handleInputChange('sortBy', e.target.value)}
          className={styles.select}
        >
          <option value="name">Name (A-Z)</option>
          <option value="name_desc">Name (Z-A)</option>
          <option value="price">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="category">Category</option>
          <option value="category_desc">Category (Reverse)</option>
        </select>
      </div>
    </div>
  );
};

export default ProductFilters;