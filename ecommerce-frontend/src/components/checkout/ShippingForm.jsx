import React from 'react';
import styles from './ShippingForm.module.css';

const ShippingForm = ({ shippingInfo, onChange, onNext, onPrevious }) => {
  const handleInputChange = (field, value) => {
    onChange(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field]?.trim());
    
    if (missingFields.length > 0) {
      alert(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      alert('Please enter a valid email address');
      return;
    }

    onNext();
  };

  return (
    <div className={styles.shippingForm}>
      <h2>Shipping Information</h2>
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName">First Name *</label>
            <input
              id="firstName"
              type="text"
              value={shippingInfo.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="lastName">Last Name *</label>
            <input
              id="lastName"
              type="text"
              value={shippingInfo.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address *</label>
          <input
            id="email"
            type="email"
            value={shippingInfo.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number</label>
          <input
            id="phone"
            type="tel"
            value={shippingInfo.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="address">Street Address *</label>
          <input
            id="address"
            type="text"
            value={shippingInfo.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            required
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="city">City *</label>
            <input
              id="city"
              type="text"
              value={shippingInfo.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="state">State *</label>
            <input
              id="state"
              type="text"
              value={shippingInfo.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="zipCode">ZIP Code *</label>
            <input
              id="zipCode"
              type="text"
              value={shippingInfo.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="country">Country</label>
          <select
            id="country"
            value={shippingInfo.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
          </select>
        </div>

        <div className={styles.actions}>
          <button 
            type="button"
            className={styles.backButton}
            onClick={onPrevious}
          >
            Back to Cart
          </button>
          
          <button 
            type="submit"
            className={styles.nextButton}
          >
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShippingForm;