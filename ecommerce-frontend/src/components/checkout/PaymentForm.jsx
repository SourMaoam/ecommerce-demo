import React from 'react';
import styles from './PaymentForm.module.css';

const PaymentForm = ({ 
  paymentInfo, 
  onChange, 
  shippingInfo, 
  cart, 
  onPrevious, 
  onPlaceOrder, 
  loading 
}) => {
  const handleInputChange = (field, value) => {
    onChange(prev => ({ ...prev, [field]: value }));
  };

  const handleSameAsShippingChange = (checked) => {
    if (checked) {
      onChange(prev => ({
        ...prev,
        sameAsShipping: true,
        billingAddress: shippingInfo.address,
        billingCity: shippingInfo.city,
        billingState: shippingInfo.state,
        billingZipCode: shippingInfo.zipCode
      }));
    } else {
      onChange(prev => ({
        ...prev,
        sameAsShipping: false,
        billingAddress: '',
        billingCity: '',
        billingState: '',
        billingZipCode: ''
      }));
    }
  };

  const formatCardNumber = (value) => {
    // Remove all non-digits and limit to 16 characters
    const digits = value.replace(/\D/g, '').substring(0, 16);
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryDate = (value) => {
    // Remove all non-digits and limit to 4 characters
    const digits = value.replace(/\D/g, '').substring(0, 4);
    // Add slash after first 2 digits
    if (digits.length >= 2) {
      return digits.substring(0, 2) + '/' + digits.substring(2);
    }
    return digits;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const requiredFields = ['cardNumber', 'expiryDate', 'cvv', 'nameOnCard'];
    const missingFields = requiredFields.filter(field => !paymentInfo[field]?.trim());
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return;
    }

    // Card number validation (basic)
    const cardDigits = paymentInfo.cardNumber.replace(/\D/g, '');
    if (cardDigits.length < 13 || cardDigits.length > 19) {
      alert('Please enter a valid card number');
      return;
    }

    // CVV validation
    if (paymentInfo.cvv.length < 3 || paymentInfo.cvv.length > 4) {
      alert('Please enter a valid CVV');
      return;
    }

    onPlaceOrder();
  };

  return (
    <div className={styles.paymentForm}>
      <h2>Payment Information</h2>
      
      <form onSubmit={handleSubmit}>
        <div className={styles.cardSection}>
          <h3>Card Details</h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="cardNumber">Card Number *</label>
            <input
              id="cardNumber"
              type="text"
              value={formatCardNumber(paymentInfo.cardNumber)}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              placeholder="1234 5678 9012 3456"
              maxLength="19"
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="expiryDate">Expiry Date *</label>
              <input
                id="expiryDate"
                type="text"
                value={formatExpiryDate(paymentInfo.expiryDate)}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                placeholder="MM/YY"
                maxLength="5"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="cvv">CVV *</label>
              <input
                id="cvv"
                type="text"
                value={paymentInfo.cvv}
                onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                placeholder="123"
                maxLength="4"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="nameOnCard">Name on Card *</label>
            <input
              id="nameOnCard"
              type="text"
              value={paymentInfo.nameOnCard}
              onChange={(e) => handleInputChange('nameOnCard', e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.billingSection}>
          <h3>Billing Address</h3>
          
          <div className={styles.checkboxGroup}>
            <input
              id="sameAsShipping"
              type="checkbox"
              checked={paymentInfo.sameAsShipping}
              onChange={(e) => handleSameAsShippingChange(e.target.checked)}
            />
            <label htmlFor="sameAsShipping">
              Same as shipping address
            </label>
          </div>

          {!paymentInfo.sameAsShipping && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="billingAddress">Street Address *</label>
                <input
                  id="billingAddress"
                  type="text"
                  value={paymentInfo.billingAddress}
                  onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                  required={!paymentInfo.sameAsShipping}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="billingCity">City *</label>
                  <input
                    id="billingCity"
                    type="text"
                    value={paymentInfo.billingCity}
                    onChange={(e) => handleInputChange('billingCity', e.target.value)}
                    required={!paymentInfo.sameAsShipping}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="billingState">State *</label>
                  <input
                    id="billingState"
                    type="text"
                    value={paymentInfo.billingState}
                    onChange={(e) => handleInputChange('billingState', e.target.value)}
                    required={!paymentInfo.sameAsShipping}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="billingZipCode">ZIP Code *</label>
                  <input
                    id="billingZipCode"
                    type="text"
                    value={paymentInfo.billingZipCode}
                    onChange={(e) => handleInputChange('billingZipCode', e.target.value)}
                    required={!paymentInfo.sameAsShipping}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.orderSummary}>
          <h3>Final Order Summary</h3>
          <div className={styles.summaryRow}>
            <span>Subtotal:</span>
            <span>${cart.total?.toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Tax:</span>
            <span>${(cart.total * 0.08)?.toFixed(2)}</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.total}`}>
            <span>Total:</span>
            <span>${(cart.total * 1.08)?.toFixed(2)}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            type="button"
            className={styles.backButton}
            onClick={onPrevious}
            disabled={loading}
          >
            Back to Shipping
          </button>
          
          <button 
            type="submit"
            className={styles.placeOrderButton}
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;