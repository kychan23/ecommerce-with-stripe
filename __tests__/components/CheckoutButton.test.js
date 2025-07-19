import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckoutButton from '../../components/CheckoutButton';
import { useShoppingCart } from 'use-shopping-cart';

// Mock the useShoppingCart hook
jest.mock('use-shopping-cart', () => ({
  useShoppingCart: jest.fn(),
}));

describe('CheckoutButton', () => {
  // Setup common test variables
  const mockRedirectToCheckout = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the button with correct text', () => {
    // Mock the useShoppingCart hook with valid cart data
    useShoppingCart.mockReturnValue({
      redirectToCheckout: mockRedirectToCheckout,
      cartCount: 1,
      totalPrice: 1000,
    });
    
    render(<CheckoutButton />);
    
    // Check if the button is rendered with the correct text
    expect(screen.getByRole('button')).toHaveTextContent('Proceed to checkout');
  });
  
  it('disables the button when cart total is less than minimum', () => {
    // Mock the useShoppingCart hook with cart total less than minimum
    useShoppingCart.mockReturnValue({
      redirectToCheckout: mockRedirectToCheckout,
      cartCount: 1,
      totalPrice: 20, // Less than minimum 30
    });
    
    render(<CheckoutButton />);
    
    // Check if the button is disabled
    expect(screen.getByRole('button')).toBeDisabled();
    
    // Check if the error message is displayed
    expect(screen.getByText(/You must have at least £0.30 in your basket/i)).toBeInTheDocument();
  });
  
  it('disables the button when cart has too many items', () => {
    // Mock the useShoppingCart hook with too many items
    useShoppingCart.mockReturnValue({
      redirectToCheckout: mockRedirectToCheckout,
      cartCount: 21, // More than maximum 20
      totalPrice: 1000,
    });
    
    render(<CheckoutButton />);
    
    // Check if the button is disabled
    expect(screen.getByRole('button')).toBeDisabled();
    
    // Check if the error message is displayed
    expect(screen.getByText(/You cannot have more than 20 items/i)).toBeInTheDocument();
  });
  
  it('shows error message when cart is empty', async () => {
    // Mock the useShoppingCart hook with empty cart
    useShoppingCart.mockReturnValue({
      redirectToCheckout: mockRedirectToCheckout,
      cartCount: 0,
      totalPrice: 0,
    });
    
    render(<CheckoutButton />);
    
    // Click the button
    fireEvent.click(screen.getByRole('button'));
    
    // Check if the error message is displayed
    expect(screen.getByText(/Please add some items to your cart/i)).toBeInTheDocument();
    
    // Check if the button is disabled after click
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
  
  it('shows loading state during checkout', async () => {
    // Create a promise that doesn't resolve immediately
    const redirectPromise = new Promise((resolve) => {
      setTimeout(() => resolve({ error: null }), 100);
    });
    
    // Mock the useShoppingCart hook with valid cart data
    useShoppingCart.mockReturnValue({
      redirectToCheckout: jest.fn(() => redirectPromise),
      cartCount: 1,
      totalPrice: 1000,
    });
    
    render(<CheckoutButton />);
    
    // Click the button
    fireEvent.click(screen.getByRole('button'));
    
    // Check if the button shows loading text
    expect(screen.getByRole('button')).toHaveTextContent('Loading...');
  });
  
  it('shows error message when redirect fails', async () => {
    // Mock the redirectToCheckout to return an error
    const mockRedirectWithError = jest.fn().mockResolvedValue({ error: 'Redirect failed' });
    
    // Mock the useShoppingCart hook
    useShoppingCart.mockReturnValue({
      redirectToCheckout: mockRedirectWithError,
      cartCount: 1,
      totalPrice: 1000,
    });
    
    render(<CheckoutButton />);
    
    // Click the button
    fireEvent.click(screen.getByRole('button'));
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Unable to redirect to Stripe checkout page/i)).toBeInTheDocument();
    });
  });
  
  it('handles exceptions during redirect', async () => {
    // Mock the redirectToCheckout to throw an error
    const mockRedirectWithException = jest.fn().mockImplementation(() => {
      throw new Error('Network error');
    });
    
    // Mock the useShoppingCart hook
    useShoppingCart.mockReturnValue({
      redirectToCheckout: mockRedirectWithException,
      cartCount: 1,
      totalPrice: 1000,
    });
    
    render(<CheckoutButton />);
    
    // Click the button
    fireEvent.click(screen.getByRole('button'));
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Unable to redirect to Stripe checkout page/i)).toBeInTheDocument();
    });
  });
});