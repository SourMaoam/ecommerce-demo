import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CartReview.module.css';

const CartReview = ({ cart, onNext }) => {
  return (
    <div className={styles.cartReview}>
      <h2>Review Your Order</h2>
      
      <div className={styles.items}>
        {cart.items.map(item => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemImage}>
              <img 
                src={item.product?.imageUrl || '/placeholder-product.jpg'} 
                alt={item.product?.name}
              />
            </div>
            
            <div className={styles.itemDetails}>
              <h4>{item.product?.name}</h4>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${item.product?.price?.toFixed(2)} each</p>
            </div>
            
            <div className={styles.itemTotal}>
              ${(item.product?.price * item.quantity)?.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <Link to="/cart" className={styles.editCartButton}>
          Edit Cart
        </Link>
        
        <button 
          className={styles.nextButton}
          onClick={onNext}
        >
          Continue to Shipping
        </button>
      </div>
    </div>
  );
};

export default CartReview;