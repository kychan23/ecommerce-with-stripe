import { render, screen, fireEvent } from '@testing-library/react';
import Product from '../../components/Product';
import { useShoppingCart } from 'use-shopping-cart';

// Mock the useShoppingCart hook
jest.mock('use-shopping-cart', () => ({
  useShoppingCart: jest.fn(),
  formatCurrencyString: jest.fn(({ value, currency }) => {
    return currency === 'JPY' ? `￥${value}` : `${currency} ${value}`;
  }),
}));

describe('Product', () => {
  // Setup common test variables
  const mockProduct = {
    id: 'test_product_1',
    name: 'Test Product',
    emoji: '🍎',
    price: 1000,
    currency: 'JPY'
  };
  
  const mockAddItem = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the useShoppingCart hook
    useShoppingCart.mockReturnValue({
      addItem: mockAddItem,
    });
  });
  
  it('renders the product correctly', () => {
    render(<Product product={mockProduct} />);
    
    // Check if product information is displayed correctly
    expect(screen.getByText('🍎')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('￥1000')).toBeInTheDocument();
    
    // Check if quantity controls are displayed
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Initial quantity
    
    // Check if "Add to cart" button is displayed
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });
  
  it('increases quantity when + button is clicked', () => {
    render(<Product product={mockProduct} />);
    
    // Initial quantity should be 1
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Click the + button
    const increaseButton = screen.getByText('+');
    fireEvent.click(increaseButton);
    
    // Quantity should be increased to 2
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Click again
    fireEvent.click(increaseButton);
    
    // Quantity should be increased to 3
    expect(screen.getByText('3')).toBeInTheDocument();
  });
  
  it('decreases quantity when - button is clicked', () => {
    render(<Product product={mockProduct} />);
    
    // Increase quantity to 3 first
    const increaseButton = screen.getByText('+');
    fireEvent.click(increaseButton);
    fireEvent.click(increaseButton);
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Click the - button
    const decreaseButton = screen.getByText('-');
    fireEvent.click(decreaseButton);
    
    // Quantity should be decreased to 2
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Click again
    fireEvent.click(decreaseButton);
    
    // Quantity should be decreased to 1
    expect(screen.getByText('1')).toBeInTheDocument();
  });
  
  it('does not decrease quantity below 1', () => {
    render(<Product product={mockProduct} />);
    
    // Initial quantity should be 1
    expect(screen.getByText('1')).toBeInTheDocument();
    
    // Click the - button
    const decreaseButton = screen.getByText('-');
    fireEvent.click(decreaseButton);
    
    // Quantity should still be 1
    expect(screen.getByText('1')).toBeInTheDocument();
  });
  
  it('adds product to cart with correct quantity when "Add to cart" button is clicked', () => {
    render(<Product product={mockProduct} />);
    
    // Increase quantity to 3
    const increaseButton = screen.getByText('+');
    fireEvent.click(increaseButton);
    fireEvent.click(increaseButton);
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Click the "Add to cart" button
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);
    
    // Check if addItem was called with the correct arguments
    expect(mockAddItem).toHaveBeenCalledWith(mockProduct, { count: 3 });
  });
  
  it('resets quantity to 1 after adding to cart', () => {
    render(<Product product={mockProduct} />);
    
    // Increase quantity to 3
    const increaseButton = screen.getByText('+');
    fireEvent.click(increaseButton);
    fireEvent.click(increaseButton);
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Click the "Add to cart" button
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addToCartButton);
    
    // Quantity should be reset to 1
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});