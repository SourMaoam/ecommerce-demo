import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    await addToCart(product.id, 1);
    
    // Show feedback animation briefly
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
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
              className={`${styles.addToCartBtn} ${!product.inStock ? styles.disabled : ''} ${isAdding ? styles.adding : ''}`}
              onClick={handleAddToCart}
              disabled={!product.inStock}
              data-testid={`add-to-cart-${product.id}`}
            >
              {isAdding ? '✓ Added!' : 'Add to Cart'}
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