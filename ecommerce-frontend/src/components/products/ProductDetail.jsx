import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import LoadingSpinner from '../common/LoadingSpinner';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  
  const { product, loading: productLoading, error, fetchProduct } = useProducts();
  const { addToCart, loading: cartLoading } = useCart();

  useEffect(() => {
    fetchProduct(id);
  }, [id, fetchProduct]);

  const handleAddToCart = async () => {
    await addToCart(product.id, quantity);
    navigate('/cart');
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  if (productLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Error loading product</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/products')}>
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h2>Product not found</h2>
        <button onClick={() => navigate('/products')}>
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className={styles.productDetail}>
      <button 
        className={styles.backButton}
        onClick={() => navigate('/products')}
      >
        ← Back to Products
      </button>

      <div className={styles.productContent}>
        <div className={styles.imageSection}>
          <img 
            src={product.imageUrl || '/placeholder-product.jpg'} 
            alt={product.name}
            className={styles.productImage}
          />
        </div>

        <div className={styles.infoSection}>
          <h1 className={styles.productName}>{product.name}</h1>
          
          <div className={styles.price}>
            ${product.price?.toFixed(2)}
          </div>

          <div className={styles.availability}>
            {product.inStock ? (
              <span className={styles.inStock}>✓ In Stock</span>
            ) : (
              <span className={styles.outOfStock}>✗ Out of Stock</span>
            )}
          </div>

          <div className={styles.description}>
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {product.category && (
            <div className={styles.category}>
              <strong>Category:</strong> {product.category}
            </div>
          )}

          <div className={styles.purchaseSection}>
            <div className={styles.quantitySelector}>
              <label htmlFor="quantity">Quantity:</label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className={styles.quantityInput}
                disabled={!product.inStock}
              />
            </div>

            <button
              className={`${styles.addToCartButton} ${!product.inStock ? styles.disabled : ''}`}
              onClick={handleAddToCart}
              disabled={!product.inStock || cartLoading}
              data-testid={`add-to-cart-${product.id}`}
            >
              {cartLoading ? 'Adding to Cart...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;