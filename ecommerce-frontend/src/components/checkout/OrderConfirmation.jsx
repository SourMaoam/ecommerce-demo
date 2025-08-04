import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import LoadingSpinner from '../common/LoadingSpinner';
import styles from './OrderConfirmation.module.css';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { order, loading, error, fetchOrder } = useOrders();

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId);
    }
  }, [orderId, fetchOrder]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h2>Error loading order details</h2>
        <p>{error}</p>
        <Link to="/products" className={styles.button}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.notFound}>
        <h2>Order not found</h2>
        <p>The order you're looking for doesn't exist or has been removed.</p>
        <Link to="/products" className={styles.button}>
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.orderConfirmation}>
      <div className={styles.header}>
        <div className={styles.successIcon}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1>Order Confirmed!</h1>
        <p>Thank you for your purchase. Your order has been successfully placed.</p>
      </div>

      <div className={styles.orderDetails}>
        <div className={styles.orderInfo}>
          <h2>Order Details</h2>
          <div className={styles.infoRow}>
            <span className={styles.label}>Order Number:</span>
            <span className={styles.value}>{order.orderId}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Order Date:</span>
            <span className={styles.value}>
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Status:</span>
            <span className={`${styles.value} ${styles.status}`}>
              {order.status}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Total:</span>
            <span className={`${styles.value} ${styles.total}`}>
              ${order.total?.toFixed(2)}
            </span>
          </div>
        </div>

        <div className={styles.shippingInfo}>
          <h3>Shipping Address</h3>
          <div className={styles.address}>
            <p>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
            </p>
            <p>{order.shippingAddress?.country}</p>
          </div>
        </div>
      </div>

      <div className={styles.orderItems}>
        <h3>Items Ordered</h3>
        <div className={styles.items}>
          {order.items?.map(item => (
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
      </div>

      <div className={styles.nextSteps}>
        <h3>What's Next?</h3>
        <ul>
          <li>You'll receive an email confirmation shortly</li>
          <li>We'll send you tracking information when your order ships</li>
          <li>Estimated delivery: 5-7 business days</li>
        </ul>
      </div>

      <div className={styles.actions}>
        <Link to="/products" className={styles.continueShoppingButton}>
          Continue Shopping
        </Link>
        <button 
          className={styles.printButton}
          onClick={() => window.print()}
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;