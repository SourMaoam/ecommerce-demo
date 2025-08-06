import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CartItem from '../../../components/cart/CartItem';

const CartItemWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

// Mock window.confirm
global.confirm = jest.fn();

describe('CartItem', () => {
  const mockItem = {
    id: 1,
    productId: 123,
    quantity: 2,
    product: {
      id: 123,
      name: 'Test Product',
      description: 'This is a test product with a longer description that should be truncated after 100 characters to test the truncation functionality',
      price: 25.99,
      imageUrl: 'https://example.com/test-product.jpg',
      category: 'Electronics'
    }
  };

  const mockOnUpdateQuantity = jest.fn();
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    mockOnUpdateQuantity.mockClear();
    mockOnRemove.mockClear();
    global.confirm.mockClear();
    mockOnUpdateQuantity.mockResolvedValue();
    mockOnRemove.mockResolvedValue();
  });

  it('renders cart item information correctly', () => {
    render(
      <CartItemWrapper>
        <CartItem 
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      </CartItemWrapper>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('$25.99 each')).toBeInTheDocument();
    expect(screen.getByText('$51.98')).toBeInTheDocument(); // 25.99 * 2
    expect(screen.getByText('2')).toBeInTheDocument(); // quantity
  });

  it('displays product image with correct src and alt', () => {
    render(
      <CartItemWrapper>
        <CartItem 
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      </CartItemWrapper>
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockItem.product.imageUrl);
    expect(image).toHaveAttribute('alt', mockItem.product.name);
  });

  it('uses placeholder image when imageUrl is not provided', () => {
    const itemWithoutImage = {
      ...mockItem,
      product: { ...mockItem.product, imageUrl: null }
    };
    
    render(
      <CartItemWrapper>
        <CartItem 
          item={itemWithoutImage}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      </CartItemWrapper>
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/placeholder-product.jpg');
  });

  it('truncates long product descriptions', () => {
    render(
      <CartItemWrapper>
        <CartItem 
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      </CartItemWrapper>
    );

    const description = screen.getByText(/This is a test product with a longer description/);
    expect(description).toHaveTextContent('...');
    expect(description.textContent.length).toBeLessThanOrEqual(103); // 100 chars + '...'
  });

  it('creates correct link to product detail page', () => {
    render(
      <CartItemWrapper>
        <CartItem 
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      </CartItemWrapper>
    );

    const productLink = screen.getByRole('link');
    expect(productLink).toHaveAttribute('href', '/products/123');
  });

  it('increases quantity when + button is clicked', async () => {
    render(
      <CartItemWrapper>
        <CartItem 
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      </CartItemWrapper>
    );

    const increaseButton = screen.getByText('+');
    fireEvent.click(increaseButton);

    await waitFor(() => {
      expect(mockOnUpdateQuantity).toHaveBeenCalledWith(1, 3); // id, newQuantity
    });
  });

  it('decreases quantity when - button is clicked', async () => {
    render(
      <CartItemWrapper>
        <CartItem 
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      </CartItemWrapper>
    );

    const decreaseButton = screen.getByText('-');
    fireEvent.click(decreaseButton);

    await waitFor(() => {
      expect(mockOnUpdateQuantity).toHaveBeenCalledWith(1, 1); // id, newQuantity
    });
  });

  it('disables decrease button when quantity is 1', () => {
    const itemWithQuantityOne = { ...mockItem, quantity: 1 };
    
    render(
      <CartItemWrapper>
        <CartItem 
          item={itemWithQuantityOne}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      </CartItemWrapper>
    );

    const decreaseButton = screen.getByText('-');
    expect(decreaseButton).toBeDisabled();
  });

  it('does not update quantity below 1', async () => {
    const itemWithQuantityOne = { ...mockItem, quantity: 1 };
    
    render(
      <CartItemWrapper>
        <CartItem 
          item={itemWithQuantityOne}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      </CartItemWrapper>
    );

    const decreaseButton = screen.getByText('-');
    fireEvent.click(decreaseButton);

    // Should not call onUpdateQuantity since quantity would go below 1
    expect(mockOnUpdateQuantity).not.toHaveBeenCalled();
  });

  it('shows loading state during quantity update', async () => {
    // Make the update promise hang to test loading state
    let resolveUpdate;
    mockOnUpdateQuantity.mockReturnValue(new Promise(resolve => {
      resolveUpdate = resolve;
    }));

    render(
      <CartItemWrapper>
        <CartItem 
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      </CartItemWrapper>
    );

    const increaseButton = screen.getByText('+');
    fireEvent.click(increaseButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('...')).toBeInTheDocument();
    });

    // Buttons should be disabled during update
    expect(screen.getByText('+')).toBeDisabled();
    expect(screen.getByText('-')).toBeDisabled();

    // Resolve the promise
    resolveUpdate();
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // Back to normal display
    });
  });

  it('shows confirmation dialog when remove button is clicked', async () => {
    global.confirm.mockReturnValue(true);

    render(
      <CartItemWrapper>
        <CartItem 
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      </CartItemWrapper>
    );

    const removeButton = screen.getByTestId('remove-item-1');
    fireEvent.click(removeButton);

    expect(global.confirm).toHaveBeenCalledWith('Remove this item from your cart?');
    
    await waitFor(() => {
      expect(mockOnRemove).toHaveBeenCalledWith(1);
    });
  });

  it('does not remove item when confirmation is cancelled', async () => {
    global.confirm.mockReturnValue(false);

    render(
      <CartItemWrapper>
        <CartItem 
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      </CartItemWrapper>
    );

    const removeButton = screen.getByTestId('remove-item-1');
    fireEvent.click(removeButton);

    expect(global.confirm).toHaveBeenCalledWith('Remove this item from your cart?');
    expect(mockOnRemove).not.toHaveBeenCalled();
  });

  it('shows loading state during item removal', async () => {
    global.confirm.mockReturnValue(true);
    
    // Make the remove promise hang to test loading state
    let resolveRemove;
    mockOnRemove.mockReturnValue(new Promise(resolve => {
      resolveRemove = resolve;
    }));

    render(
      <CartItemWrapper>
        <CartItem 
          item={mockItem}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      </CartItemWrapper>
    );

    const removeButton = screen.getByTestId('remove-item-1');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.getByText('Removing...')).toBeInTheDocument();
    });

    expect(removeButton).toBeDisabled();

    // Resolve the promise
    resolveRemove();
    
    await waitFor(() => {
      expect(screen.getByText('Remove')).toBeInTheDocument();
    });
  });

  it('handles missing product data gracefully', () => {
    const itemWithoutProduct = {
      id: 2,
      productId: 456,
      quantity: 1,
      product: null
    };

    render(
      <CartItemWrapper>
        <CartItem 
          item={itemWithoutProduct}
          onUpdateQuantity={mockOnUpdateQuantity}
          onRemove={mockOnRemove}
        />
      </CartItemWrapper>
    );

    // Should not crash when product data is missing
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/placeholder-product.jpg');
    
    const removeButton = screen.getByTestId('remove-item-2');
    expect(removeButton).toBeInTheDocument();
  });
});