import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  const { addToCart, loading } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product.id, 1);
  };

  return (
    <div className={styles.productCard} data-testid={`product-card-${product.id}`}>
      <Link to={`/products/${product.id}`} className={styles.productLink}>
        <div className={styles.imageContainer}>
          <img 
            src={product.imageUrl || '/placeholder-product.jpg'} 
            alt={product.name}
            className={styles.productImage}
            loading="lazy"
          />
          {!product.inStock && (
            <div className={styles.outOfStock}>
              Out of Stock
            </div>
          )}
        </div>

        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{product.name}</h3>
          <p className={styles.productDescription}>
            {product.description?.substring(0, 100)}
            {product.description?.length > 100 && '...'}
          </p>
          
          <div className={styles.productFooter}>
            <span className={styles.price}>
              ${product.price?.toFixed(2)}
            </span>
            
            <button
              className={`${styles.addToCartBtn} ${!product.inStock ? styles.disabled : ''}`}
              onClick={handleAddToCart}
              disabled={!product.inStock || loading}
              data-testid={`add-to-cart-${product.id}`}
            >
              {loading ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>

          {product.category && (
            <span className={styles.category}>
              {product.category}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;