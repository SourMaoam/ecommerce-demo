import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useOrders } from '../../hooks/useOrders';
import CartReview from './CartReview';
import ShippingForm from './ShippingForm';
import PaymentForm from './PaymentForm';
import LoadingSpinner from '../common/LoadingSpinner';
import styles from './Checkout.module.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading } = useCart();
  const { createOrder, loading: orderLoading } = useOrders();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZipCode: '',
    sameAsShipping: true
  });

  const steps = [
    { number: 1, name: 'Review Cart', component: 'cart' },
    { number: 2, name: 'Shipping Info', component: 'shipping' },
    { number: 3, name: 'Payment', component: 'payment' }
  ];

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        userId: 'temp-user-id', // This would come from authentication
        cartItems: cart.items,
        shippingAddress: shippingInfo,
        paymentMethod: {
          type: 'credit_card',
          last4: paymentInfo.cardNumber.slice(-4)
        },
        total: cart.total * 1.08 // Including tax
      };

      const order = await createOrder(orderData);
      navigate(`/order-confirmation/${order.orderId}`);
    } catch (error) {
      console.error('Order placement failed:', error);
      // Handle error (show notification, etc.)
    }
  };

  if (cartLoading) {
    return <LoadingSpinner />;
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>Your cart is empty</h2>
        <p>Please add items to your cart before proceeding to checkout.</p>
        <button onClick={() => navigate('/products')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className={styles.checkout}>
      <div className={styles.header}>
        <h1>Checkout</h1>
        <div className={styles.stepIndicator}>
          {steps.map((step) => (
            <div
              key={step.number}
              className={`${styles.step} ${
                step.number === currentStep ? styles.active : ''
              } ${step.number < currentStep ? styles.completed : ''}`}
            >
              <span className={styles.stepNumber}>{step.number}</span>
              <span className={styles.stepName}>{step.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.stepContent}>
          {currentStep === 1 && (
            <CartReview 
              cart={cart}
              onNext={handleNextStep}
            />
          )}
          
          {currentStep === 2 && (
            <ShippingForm
              shippingInfo={shippingInfo}
              onChange={setShippingInfo}
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
            />
          )}
          
          {currentStep === 3 && (
            <PaymentForm
              paymentInfo={paymentInfo}
              onChange={setPaymentInfo}
              shippingInfo={shippingInfo}
              cart={cart}
              onPrevious={handlePreviousStep}
              onPlaceOrder={handlePlaceOrder}
              loading={orderLoading}
            />
          )}
        </div>

        <div className={styles.orderSummary}>
          <div className={styles.summary}>
            <h3>Order Summary</h3>
            
            <div className={styles.summaryRow}>
              <span>Subtotal ({cart.items.length} items):</span>
              <span>${cart.total?.toFixed(2)}</span>
            </div>
            
            <div className={styles.summaryRow}>
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            
            <div className={styles.summaryRow}>
              <span>Tax:</span>
              <span>${(cart.total * 0.08)?.toFixed(2)}</span>
            </div>
            
            <hr className={styles.divider} />
            
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total:</span>
              <span>${(cart.total * 1.08)?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;