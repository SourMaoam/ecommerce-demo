import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import styles from './CartIcon.module.css';

const CartIcon = () => {
  const { cartItemsCount } = useCart();

  return (
    <Link to="/cart" className={styles.cartLink} data-testid="cart-icon">
      <div className={styles.cartIcon}>
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17A2 2 0 0119 19A2 2 0 0119 21A2 2 0 0117 21A2 2 0 0117 19H9A2 2 0 017 19A2 2 0 017 21A2 2 0 015 21A2 2 0 015 19A2 2 0 017 17H17Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        {cartItemsCount > 0 && (
          <span className={styles.badge} data-testid="cart-count">
            {cartItemsCount}
          </span>
        )}
      </div>
      <span className={styles.cartText}>Cart</span>
    </Link>
  );
};

export default CartIcon;