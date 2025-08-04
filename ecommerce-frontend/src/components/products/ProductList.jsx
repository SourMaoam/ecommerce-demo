import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import LoadingSpinner from '../common/LoadingSpinner';
import { useProducts } from '../../hooks/useProducts';
import styles from './ProductList.module.css';

const ProductList = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'name'
  });

  const { products, loading, error, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts(filters);
  }, [filters, fetchProducts]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Error loading products</h2>
        <p>{error}</p>
        <button onClick={() => fetchProducts(filters)}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.productListContainer}>
      <div className={styles.header}>
        <h1>Products</h1>
        <p>{products.length} products found</p>
      </div>

      <div className={styles.content}>
        <aside className={styles.sidebar}>
          <ProductFilters 
            filters={filters} 
            onFilterChange={handleFilterChange}
          />
        </aside>

        <main className={styles.products}>
          {products.length === 0 ? (
            <div className={styles.noProducts}>
              <h2>No products found</h2>
              <p>Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  data-testid={`product-card-${product.id}`}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductList;