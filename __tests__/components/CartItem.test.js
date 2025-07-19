import { render, screen, fireEvent } from '@testing-library/react';
import CartItem from '../../components/CartItem';
import { useShoppingCart } from 'use-shopping-cart';

// Mock the useShoppingCart hook
jest.mock('use-shopping-cart', () => ({
  useShoppingCart: jest.fn(),
}));

describe('CartItem', () => {
  const mockItem = {
    id: '1',
    name: 'Test Product',
    emoji: '🍎',
    quantity: 2,
    price: 1000
  };
  
  const mockRemoveItem = jest.fn();
  
  beforeEach(() => {
    useShoppingCart.mockReturnValue({
      removeItem: mockRemoveItem,
    });
  });

  it('renders the cart item correctly', () => {
    render(<CartItem item={mockItem} />);
    
    expect(screen.getByText('🍎')).toBeInTheDocument();
    expect(screen.getByText(/Test Product/)).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
    expect(screen.getByText('￥1000')).toBeInTheDocument();
  });

  it('calls removeItem when delete button is clicked', () => {
    render(<CartItem item={mockItem} />);
    
    const deleteButton = screen.getByRole('button');
    fireEvent.click(deleteButton);
    
    expect(mockRemoveItem).toHaveBeenCalledWith('1');
  });
});