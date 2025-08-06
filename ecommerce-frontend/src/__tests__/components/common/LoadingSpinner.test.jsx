import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    const spinner = document.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = 'Please wait while we load your data...';
    
    render(<LoadingSpinner message={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('applies correct size class', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    
    let spinner = document.querySelector('.spinner');
    expect(spinner).toHaveClass('small');

    rerender(<LoadingSpinner size="large" />);
    
    spinner = document.querySelector('.spinner');
    expect(spinner).toHaveClass('large');
  });

  it('applies default medium size when no size specified', () => {
    render(<LoadingSpinner />);
    
    const spinner = document.querySelector('.spinner');
    expect(spinner).toHaveClass('medium');
  });

  it('has correct structure', () => {
    render(<LoadingSpinner message="Test loading" />);
    
    const container = document.querySelector('.loadingContainer');
    expect(container).toBeInTheDocument();
    
    const spinner = document.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
    
    const spinnerInner = document.querySelector('.spinnerInner');
    expect(spinnerInner).toBeInTheDocument();
    
    const message = document.querySelector('.loadingMessage');
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent('Test loading');
  });

  it('renders without message when message is empty string', () => {
    render(<LoadingSpinner message="" />);
    
    const message = document.querySelector('.loadingMessage');
    expect(message).toHaveTextContent('');
  });

  it('handles all size variants', () => {
    const sizes = ['small', 'medium', 'large'];
    
    sizes.forEach(size => {
      const { unmount } = render(<LoadingSpinner size={size} />);
      
      const spinner = document.querySelector('.spinner');
      expect(spinner).toHaveClass(size);
      
      unmount();
    });
  });
});