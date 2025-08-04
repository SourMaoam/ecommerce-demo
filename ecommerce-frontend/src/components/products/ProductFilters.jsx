import React from 'react';
import styles from './ProductFilters.module.css';

const ProductFilters = ({ filters, onFilterChange }) => {
  const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports',
    'Books',
    'Toys',
    'Beauty'
  ];

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
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category.toLowerCase()}>
              {category}
            </option>
          ))}
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
          <option value="name">Name</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>
    </div>
  );
};

export default ProductFilters;