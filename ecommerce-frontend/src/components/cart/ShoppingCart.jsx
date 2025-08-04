import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import CartItem from './CartItem';
import LoadingSpinner from '../common/LoadingSpinner';
import styles from './ShoppingCart.module.css';

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { cart, loading, error, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleCheckout = () => {
    if (cart?.items?.length > 0) {
      navigate('/checkout');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Error loading cart</h2>
        <p>{error}</p>
      </div>
    );
  }

  const isEmpty = !cart?.items || cart.items.length === 0;

  return (
    <div className={styles.shoppingCart}>
      <div className={styles.header}>
        <h1>Shopping Cart</h1>
        {!isEmpty && (
          <button 
            className={styles.clearButton}
            onClick={handleClearCart}
          >
            Clear Cart
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className={styles.emptyCart}>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <Link to="/products" className={styles.continueShoppingBtn}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className={styles.cartContent}>
          <div className={styles.cartItems}>
            {cart.items.map(item => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                data-testid={`cart-item-${item.id}`}
              />
            ))}
          </div>

          <div className={styles.cartSummary}>
            <div className={styles.summaryContent}>
              <h3>Order Summary</h3>
              
              <div className={styles.summaryRow}>
                <span>Subtotal ({cart.items.length} items):</span>
                <span>${cart.total?.toFixed(2) || '0.00'}</span>
              </div>
              
              <div className={styles.summaryRow}>
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              
              <div className={styles.summaryRow}>
                <span>Tax:</span>
                <span>${(cart.total * 0.08)?.toFixed(2) || '0.00'}</span>
              </div>
              
              <hr className={styles.divider} />
              
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Total:</span>
                <span>${(cart.total * 1.08)?.toFixed(2) || '0.00'}</span>
              </div>
              
              <button 
                className={styles.checkoutButton}
                onClick={handleCheckout}
                data-testid="checkout-button"
              >
                Proceed to Checkout
              </button>
              
              <Link to="/products" className={styles.continueShoppingLink}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;