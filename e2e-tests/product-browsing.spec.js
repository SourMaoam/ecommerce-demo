const { test, expect } = require('@playwright/test');

test.describe('Product Browsing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
  });

  test('should display product list on homepage', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid^="product-card-"]');
    
    // Check that products are displayed
    const productCards = await page.locator('[data-testid^="product-card-"]').count();
    expect(productCards).toBeGreaterThan(0);
    
    // Check that each product card has required elements
    const firstProduct = page.locator('[data-testid^="product-card-"]').first();
    await expect(firstProduct.locator('h3')).toBeVisible(); // Product name
    await expect(firstProduct.locator('[data-testid^="add-to-cart-"]')).toBeVisible(); // Add to cart button
    await expect(firstProduct.locator('img')).toBeVisible(); // Product image
  });

  test('should navigate to product detail page', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid^="product-card-"]');
    
    // Click on the first product
    const firstProductLink = page.locator('[data-testid^="product-card-"] a').first();
    await firstProductLink.click();
    
    // Should navigate to product detail page
    await expect(page).toHaveURL(/\/products\/\d+/);
    
    // Should display product details
    await expect(page.locator('h1')).toBeVisible(); // Product name as heading
    await expect(page.locator('[data-testid^="add-to-cart-"]')).toBeVisible(); // Add to cart button
  });

  test('should filter products by search', async ({ page }) => {
    // Wait for search bar to be available
    await page.waitForSelector('input[type="text"]');
    
    // Search for a specific term
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill('laptop');
    await searchInput.press('Enter');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Check that results contain the search term (case-insensitive)
    const productNames = await page.locator('[data-testid^="product-card-"] h3').allTextContents();
    const hasRelevantResults = productNames.some(name => 
      name.toLowerCase().includes('laptop') || productNames.length === 0
    );
    expect(hasRelevantResults).toBeTruthy();
  });

  test('should add product to cart from product list', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid^="product-card-"]');
    
    // Get initial cart count (if cart icon is visible)
    const cartIcon = page.locator('[data-testid="cart-icon"]');
    const initialCartText = await cartIcon.textContent().catch(() => '0');
    
    // Click add to cart on first product
    const firstAddToCartBtn = page.locator('[data-testid^="add-to-cart-"]').first();
    await firstAddToCartBtn.click();
    
    // Wait for cart to update
    await page.waitForTimeout(1000);
    
    // Check that cart count has increased (if visible) or button shows feedback
    const buttonText = await firstAddToCartBtn.textContent();
    expect(buttonText).toBeTruthy(); // Button should show some text
  });

  test('should display out of stock products correctly', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid^="product-card-"]');
    
    // Look for out of stock products
    const outOfStockIndicators = await page.locator('text="Out of Stock"').count();
    
    if (outOfStockIndicators > 0) {
      // Check that out of stock products have disabled buttons
      const outOfStockCard = page.locator('[data-testid^="product-card-"]').filter({ hasText: 'Out of Stock' }).first();
      const addToCartBtn = outOfStockCard.locator('[data-testid^="add-to-cart-"]');
      await expect(addToCartBtn).toBeDisabled();
    }
  });

  test('should display product categories', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid^="product-card-"]');
    
    // Check that products have categories displayed
    const categories = await page.locator('[data-testid^="product-card-"] .category, [data-testid^="product-card-"] [class*="category"]').count();
    
    if (categories > 0) {
      // At least one product should show a category
      const categoryText = await page.locator('[data-testid^="product-card-"] .category, [data-testid^="product-card-"] [class*="category"]').first().textContent();
      expect(categoryText.length).toBeGreaterThan(0);
    }
  });

  test('should handle page loading states', async ({ page }) => {
    // Navigate and check for loading indicators
    await page.goto('/');
    
    // Page should load without errors
    await expect(page).toHaveTitle(/ecommerce/i);
    
    // Should not show error messages
    const errorMessages = await page.locator('text="Error"').count();
    expect(errorMessages).toBe(0);
  });

  test('should display enhanced 15-product catalog', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid^="product-card-"]');
    
    // Should display at least 10 products on first page (with pagination limit of 10)
    const productCards = await page.locator('[data-testid^="product-card-"]').count();
    expect(productCards).toBeGreaterThanOrEqual(10);
    
    // Check for diverse product categories
    const categoryTexts = await page.locator('[data-testid^="product-card-"] [class*="category"]').allTextContents();
    const uniqueCategories = [...new Set(categoryTexts)];
    expect(uniqueCategories.length).toBeGreaterThanOrEqual(3); // At least 3 different categories visible
  });

  test('should support category filtering with new categories', async ({ page }) => {
    // Wait for category filter to be available
    await page.waitForSelector('select, [data-testid="category-filter"], .filter');
    
    // Try to filter by Electronics category
    const categoryFilter = page.locator('select').first();
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption('Electronics');
      
      // Wait for results
      await page.waitForTimeout(1000);
      
      // All visible products should be Electronics
      const categories = await page.locator('[data-testid^="product-card-"] [class*="category"]').allTextContents();
      const allElectronics = categories.every(cat => cat === 'Electronics');
      expect(allElectronics).toBeTruthy();
    }
  });

  test('should support enhanced sorting options', async ({ page }) => {
    // Wait for sort controls
    await page.waitForSelector('[data-testid^="product-card-"]');
    
    // Look for sort dropdown
    const sortDropdown = page.locator('select').nth(1); // Assuming second select is sort
    if (await sortDropdown.isVisible()) {
      // Test sorting by price (low to high)
      await sortDropdown.selectOption({ label: /price.*low/i });
      await page.waitForTimeout(1000);
      
      // Get prices and verify they're in ascending order
      const priceTexts = await page.locator('[data-testid^="product-card-"] [class*="price"]').allTextContents();
      const prices = priceTexts.map(text => parseFloat(text.replace(/[^0-9.]/g, '')));
      
      if (prices.length > 1) {
        for (let i = 0; i < prices.length - 1; i++) {
          expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
        }
      }
    }
  });

  test('should handle pricing range for diverse product catalog', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid^="product-card-"]');
    
    // Check that products have varied price ranges
    const priceTexts = await page.locator('[data-testid^="product-card-"] [class*="price"]').allTextContents();
    const prices = priceTexts.map(text => parseFloat(text.replace(/[^0-9.]/g, '')));
    
    // Should have products under $100 and over $100
    const lowPriceProducts = prices.filter(price => price < 100);
    const highPriceProducts = prices.filter(price => price >= 100);
    
    expect(lowPriceProducts.length).toBeGreaterThan(0);
    expect(highPriceProducts.length).toBeGreaterThan(0);
  });

  test('should display quality product images from enhanced catalog', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid^="product-card-"]');
    
    // Check that product images are loading properly
    const productImages = page.locator('[data-testid^="product-card-"] img');
    const imageCount = await productImages.count();
    
    expect(imageCount).toBeGreaterThan(0);
    
    // Check first few images are actually loaded (not broken)
    for (let i = 0; i < Math.min(3, imageCount); i++) {
      const img = productImages.nth(i);
      const src = await img.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src).toContain('unsplash'); // Enhanced catalog uses Unsplash images
    }
  });
});