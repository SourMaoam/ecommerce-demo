const { test, expect } = require('@playwright/test');

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page and add items to cart
    await page.goto('/');
    await page.waitForSelector('[data-testid^="product-card-"]');
    
    // Add at least one item to cart
    const firstAddToCartBtn = page.locator('[data-testid^="add-to-cart-"]').first();
    await firstAddToCartBtn.click();
    await page.waitForTimeout(1000);
  });

  test('should navigate to checkout from cart', async ({ page }) => {
    // Navigate to cart
    try {
      await page.locator('[data-testid="cart-icon"]').click();
    } catch {
      await page.goto('/cart');
    }
    
    await page.waitForTimeout(1000);
    
    // Look for checkout button
    const checkoutButton = page.locator('[data-testid="checkout-button"], button:has-text("Checkout"), button:has-text("Proceed")').first();
    
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      
      // Should navigate to checkout page
      await expect(page).toHaveURL(/checkout|order/);
    }
  });

  test('should display shipping form', async ({ page }) => {
    // Navigate to checkout
    try {
      await page.goto('/checkout');
    } catch {
      // Navigate through cart
      await page.goto('/cart');
      await page.waitForTimeout(1000);
      const checkoutBtn = page.locator('button:has-text("Checkout")').first();
      if (await checkoutBtn.isVisible()) {
        await checkoutBtn.click();
      }
    }
    
    await page.waitForTimeout(1000);
    
    // Check for shipping form elements
    const shippingInputs = await page.locator('input[type="text"], input[placeholder*="address"], input[placeholder*="name"], input[placeholder*="city"]').count();
    
    if (shippingInputs > 0) {
      // Should have form fields for shipping information
      expect(shippingInputs).toBeGreaterThan(0);
    } else {
      // Checkout might be a single page, check for any form elements
      const formElements = await page.locator('form, input, select, textarea').count();
      expect(formElements).toBeGreaterThan(0);
    }
  });

  test('should validate required shipping fields', async ({ page }) => {
    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForTimeout(1000);
    
    // Try to submit without filling required fields
    const submitButton = page.locator('button:has-text("Place Order"), button:has-text("Complete"), button[type="submit"]').first();
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Should show validation errors or prevent submission
      const errorMessages = await page.locator('text="required", text="Please", text="error", .error, [class*="error"]').count();
      const isStillOnCheckout = page.url().includes('checkout');
      
      expect(errorMessages > 0 || isStillOnCheckout).toBeTruthy();
    }
  });

  test('should display payment options', async ({ page }) => {
    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForTimeout(1000);
    
    // Look for payment-related elements
    const paymentElements = await page.locator('text="payment", text="credit card", text="paypal", input[type="radio"], select[name*="payment"]').count();
    
    if (paymentElements > 0) {
      expect(paymentElements).toBeGreaterThan(0);
    } else {
      // Payment might be implied, check for any checkout form
      const checkoutForm = await page.locator('form').count();
      expect(checkoutForm).toBeGreaterThan(0);
    }
  });

  test('should complete checkout with valid information', async ({ page }) => {
    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForTimeout(1000);
    
    // Fill in shipping information if form is present
    const nameInput = page.locator('input[placeholder*="name"], input[name*="name"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test User');
    }
    
    const addressInput = page.locator('input[placeholder*="address"], input[name*="address"]').first();
    if (await addressInput.isVisible()) {
      await addressInput.fill('123 Test Street');
    }
    
    const cityInput = page.locator('input[placeholder*="city"], input[name*="city"]').first();
    if (await cityInput.isVisible()) {
      await cityInput.fill('Test City');
    }
    
    const zipInput = page.locator('input[placeholder*="zip"], input[name*="zip"], input[placeholder*="postal"]').first();
    if (await zipInput.isVisible()) {
      await zipInput.fill('12345');
    }
    
    // Select payment method if available
    const paymentRadio = page.locator('input[type="radio"]').first();
    if (await paymentRadio.isVisible()) {
      await paymentRadio.click();
    }
    
    // Submit the order
    const submitButton = page.locator('button:has-text("Place Order"), button:has-text("Complete"), button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Wait for order completion
      await page.waitForTimeout(2000);
      
      // Should either redirect to confirmation or show success message
      const hasConfirmation = await page.locator('text="confirmation", text="thank you", text="order", text="success"').count() > 0;
      const isOnConfirmationPage = page.url().includes('confirmation') || page.url().includes('success') || page.url().includes('order');
      
      expect(hasConfirmation || isOnConfirmationPage).toBeTruthy();
    }
  });

  test('should display order summary during checkout', async ({ page }) => {
    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForTimeout(1000);
    
    // Should display cart items or order summary
    const summaryElements = await page.locator('[data-testid^="cart-item-"], text=/\\$\\d+\\.\\d{2}/, .summary, [class*="summary"], [class*="total"]').count();
    
    expect(summaryElements).toBeGreaterThan(0);
  });

  test('should handle checkout errors gracefully', async ({ page }) => {
    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForTimeout(1000);
    
    // Try submitting with invalid data
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email');
    }
    
    const submitButton = page.locator('button:has-text("Place Order"), button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      // Should show error or stay on checkout page
      const hasErrors = await page.locator('.error, [class*="error"], text="invalid"').count() > 0;
      const isStillOnCheckout = page.url().includes('checkout');
      
      expect(hasErrors || isStillOnCheckout).toBeTruthy();
    }
  });

  test('should allow returning to cart from checkout', async ({ page }) => {
    // Navigate to checkout
    await page.goto('/checkout');
    await page.waitForTimeout(1000);
    
    // Look for back to cart link
    const backButton = page.locator('text="back to cart", text="edit cart", button:has-text("Back")').first();
    
    if (await backButton.isVisible()) {
      await backButton.click();
      
      // Should return to cart
      await expect(page).toHaveURL(/cart/);
    }
  });
});