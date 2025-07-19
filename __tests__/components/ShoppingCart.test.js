import { render, screen } from '@testing-library/react';
import ShoppingCart from '../../components/ShoppingCart';
import { useShoppingCart } from 'use-shopping-cart';

// Mock the dependencies
jest.mock('use-shopping-cart', () => ({
  useShoppingCart: jest.fn(),
}));

// Mock the CartItem component
jest.mock('../../components/CartItem', () => {
  return function MockCartItem({ item }) {
    return <div data-testid={`cart-item-${item.id}`}>{item.name}</div>;
  };
});

// Mock the CheckoutButton component
jest.mock('../../components/CheckoutButton', () => {
  return function MockCheckoutButton() {
    return <button data-testid="checkout-button">Checkout</button>;
  };
});

describe('ShoppingCart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty cart message when cart is empty', () => {
    // Mock the useShoppingCart hook with empty cart
    useShoppingCart.mockReturnValue({
      shouldDisplayCart: true,
      cartCount: 0,
      cartDetails: {},
    });

    render(<ShoppingCart />);

    // Check if the empty cart message is displayed
    expect(screen.getByText(/You have no items in your cart/i)).toBeInTheDocument();
    
    // Checkout button should not be rendered
    expect(screen.queryByTestId('checkout-button')).not.toBeInTheDocument();
  });

  it('renders cart items when cart has items', () => {
    // Mock cart items
    const mockCartDetails = {
      item1: {
        id: 'item1',
        name: 'Test Product 1',
        emoji: '🍎',
        quantity: 2,
        price: 1000,
      },
      item2: {
        id: 'item2',
        name: 'Test Product 2',
        emoji: '🍌',
        quantity: 1,
        price: 500,
      },
    };

    // Mock the useShoppingCart hook with items in cart
    useShoppingCart.mockReturnValue({
      shouldDisplayCart: true,
      cartCount: 3,
      cartDetails: mockCartDetails,
    });

    render(<ShoppingCart />);

    // Check if cart items are rendered
    expect(screen.getByTestId('cart-item-item1')).toBeInTheDocument();
    expect(screen.getByTestId('cart-item-item2')).toBeInTheDocument();
    
    // Check if total price and quantity are displayed correctly
    expect(screen.getByText(/Total: ￥2500\(3\)/i)).toBeInTheDocument();
    
    // Checkout button should be rendered
    expect(screen.getByTestId('checkout-button')).toBeInTheDocument();
  });

  it('calculates total price and quantity correctly', () => {
    // Mock cart items with different quantities and prices
    const mockCartDetails = {
      item1: {
        id: 'item1',
        name: 'Test Product 1',
        emoji: '🍎',
        quantity: 3,
        price: 1000,
      },
      item2: {
        id: 'item2',
        name: 'Test Product 2',
        emoji: '🍌',
        quantity: 2,
        price: 500,
      },
    };

    // Mock the useShoppingCart hook
    useShoppingCart.mockReturnValue({
      shouldDisplayCart: true,
      cartCount: 5,
      cartDetails: mockCartDetails,
    });

    render(<ShoppingCart />);

    // Check if total price and quantity are calculated correctly
    // Total price = (1000 * 3) + (500 * 2) = 3000 + 1000 = 4000
    // Total quantity = 3 + 2 = 5
    expect(screen.getByText(/Total: ￥4000\(5\)/i)).toBeInTheDocument();
  });

  it('applies correct visibility styling based on shouldDisplayCart', () => {
    // Mock the useShoppingCart hook with shouldDisplayCart = false
    useShoppingCart.mockReturnValue({
      shouldDisplayCart: false,
      cartCount: 0,
      cartDetails: {},
    });

    const { container } = render(<ShoppingCart />);

    // Check if the opacity-0 class is applied
    expect(container.firstChild).toHaveClass('opacity-0');
    
    // Re-render with shouldDisplayCart = true
    useShoppingCart.mockReturnValue({
      shouldDisplayCart: true,
      cartCount: 0,
      cartDetails: {},
    });

    const { container: visibleContainer } = render(<ShoppingCart />);
    
    // Check if the opacity-100 class is applied
    expect(visibleContainer.firstChild).toHaveClass('opacity-100');
  });
});