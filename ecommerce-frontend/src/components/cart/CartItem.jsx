import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './CartItem.module.css';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(true);
    try {
      await onUpdateQuantity(item.id, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm('Remove this item from your cart?')) {
      setIsRemoving(true);
      try {
        await onRemove(item.id);
      } finally {
        setIsRemoving(false);
      }
    }
  };

  return (
    <div className={`${styles.cartItem} ${isRemoving ? styles.removing : ''}`}>
      <div className={styles.productImage}>
        <img 
          src={item.product?.imageUrl || '/placeholder-product.jpg'} 
          alt={item.product?.name}
          loading="lazy"
        />
      </div>

      <div className={styles.productDetails}>
        <Link 
          to={`/products/${item.productId}`} 
          className={styles.productName}
        >
          {item.product?.name}
        </Link>
        
        <p className={styles.productDescription}>
          {item.product?.description?.substring(0, 100)}
          {item.product?.description?.length > 100 && '...'}
        </p>
        
        {item.product?.category && (
          <span className={styles.category}>
            {item.product.category}
          </span>
        )}
      </div>

      <div className={styles.quantityControls}>
        <button
          className={styles.quantityBtn}
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={item.quantity <= 1 || isUpdating}
        >
          -
        </button>
        
        <span className={styles.quantity}>
          {isUpdating ? '...' : item.quantity}
        </span>
        
        <button
          className={styles.quantityBtn}
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={isUpdating}
        >
          +
        </button>
      </div>

      <div className={styles.priceSection}>
        <div className={styles.unitPrice}>
          ${item.product?.price?.toFixed(2)} each
        </div>
        <div className={styles.totalPrice}>
          ${(item.product?.price * item.quantity)?.toFixed(2)}
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.removeButton}
          onClick={handleRemove}
          disabled={isRemoving}
          data-testid={`remove-item-${item.id}`}
        >
          {isRemoving ? 'Removing...' : 'Remove'}
        </button>
      </div>
    </div>
  );
};

export default CartItem;