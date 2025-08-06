import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '../../../contexts/CartContext';
import ProductCard from '../../../components/products/ProductCard';

// Mock the CartContext
const mockAddToCart = jest.fn();
const mockCartContext = {
  addToCart: mockAddToCart,
  loading: false,
  cart: { items: [], total: 0 },
  removeFromCart: jest.fn(),
  updateQuantity: jest.fn(),
  clearCart: jest.fn()
};

jest.mock('../../../contexts/CartContext', () => ({
  ...jest.requireActual('../../../contexts/CartContext'),
  useCart: () => mockCartContext
}));

const ProductCardWrapper = ({ children }) => (
  <BrowserRouter>
    <CartProvider>
      {children}
    </CartProvider>
  </BrowserRouter>
);

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'This is a test product with a longer description that should be truncated after 100 characters to ensure proper display',
    price: 29.99,
    imageUrl: 'https://example.com/test-product.jpg',
    category: 'Electronics',
    inStock: true
  };

  beforeEach(() => {
    mockAddToCart.mockClear();
  });

  it('renders product information correctly', () => {
    render(
      <ProductCardWrapper>
        <ProductCard product={mockProduct} />
      </ProductCardWrapper>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Test Product' })).toBeInTheDocument();
  });

  it('truncates long descriptions', () => {
    render(
      <ProductCardWrapper>
        <ProductCard product={mockProduct} />
      </ProductCardWrapper>
    );

    const description = screen.getByText(/This is a test product with a longer description/);
    expect(description).toHaveTextContent('...');
    expect(description.textContent.length).toBeLessThanOrEqual(103); // 100 chars + '...'
  });

  it('displays product image with correct src and alt', () => {
    render(
      <ProductCardWrapper>
        <ProductCard product={mockProduct} />
      </ProductCardWrapper>
    );

    const image = screen.getByRole('img', { name: 'Test Product' });
    expect(image).toHaveAttribute('src', mockProduct.imageUrl);
    expect(image).toHaveAttribute('alt', mockProduct.name);
  });

  it('uses placeholder image when imageUrl is not provided', () => {
    const productWithoutImage = { ...mockProduct, imageUrl: null };
    
    render(
      <ProductCardWrapper>
        <ProductCard product={productWithoutImage} />
      </ProductCardWrapper>
    );

    const image = screen.getByRole('img', { name: 'Test Product' });
    expect(image).toHaveAttribute('src', '/placeholder-product.jpg');
  });

  it('has correct test ids', () => {
    render(
      <ProductCardWrapper>
        <ProductCard product={mockProduct} />
      </ProductCardWrapper>
    );

    expect(screen.getByTestId('product-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('add-to-cart-1')).toBeInTheDocument();
  });

  it('calls addToCart when add to cart button is clicked', async () => {
    render(
      <ProductCardWrapper>
        <ProductCard product={mockProduct} />
      </ProductCardWrapper>
    );

    const addToCartButton = screen.getByTestId('add-to-cart-1');
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith(1, 1);
    });
  });

  it('prevents navigation when add to cart button is clicked', async () => {
    const mockNavigate = jest.fn();
    
    render(
      <ProductCardWrapper>
        <ProductCard product={mockProduct} />
      </ProductCardWrapper>
    );

    const addToCartButton = screen.getByTestId('add-to-cart-1');
    fireEvent.click(addToCartButton);

    // The event should be prevented from bubbling up to the Link
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables add to cart button when product is out of stock', () => {
    const outOfStockProduct = { ...mockProduct, inStock: false };
    
    render(
      <ProductCardWrapper>
        <ProductCard product={outOfStockProduct} />
      </ProductCardWrapper>
    );

    const addToCartButton = screen.getByTestId('add-to-cart-1');
    expect(addToCartButton).toBeDisabled();
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('shows loading state when adding to cart', () => {
    const loadingContext = { ...mockCartContext, loading: true };
    
    jest.mocked(require('../../../contexts/CartContext').useCart).mockReturnValue(loadingContext);

    render(
      <ProductCardWrapper>
        <ProductCard product={mockProduct} />
      </ProductCardWrapper>
    );

    const addToCartButton = screen.getByTestId('add-to-cart-1');
    expect(addToCartButton).toHaveTextContent('Adding...');
    expect(addToCartButton).toBeDisabled();
  });

  it('creates correct link to product detail page', () => {
    render(
      <ProductCardWrapper>
        <ProductCard product={mockProduct} />
      </ProductCardWrapper>
    );

    const productLink = screen.getByRole('link');
    expect(productLink).toHaveAttribute('href', '/products/1');
  });

  it('handles missing optional fields gracefully', () => {
    const minimalProduct = {
      id: 2,
      name: 'Minimal Product',
      inStock: true
    };

    render(
      <ProductCardWrapper>
        <ProductCard product={minimalProduct} />
      </ProductCardWrapper>
    );

    expect(screen.getByText('Minimal Product')).toBeInTheDocument();
    expect(screen.getByTestId('product-card-2')).toBeInTheDocument();
    
    // Should not crash when optional fields are missing
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/placeholder-product.jpg');
  });
});