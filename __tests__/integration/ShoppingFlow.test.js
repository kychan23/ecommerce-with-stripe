import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CartProvider } from 'use-shopping-cart';
import Product from '../../components/Product';
import ShoppingCart from '../../components/ShoppingCart';

// Mock the ShoppingCart component to ensure it's always visible
jest.mock('../../components/ShoppingCart', () => {
  const OriginalShoppingCart = jest.requireActual('../../components/ShoppingCart').default;
  return function MockedShoppingCart(props) {
    return (
      <div className="bg-white flex flex-col absolute right-3 md:right-9 top-14 w-80 py-4 px-4 shadow-[0_5px_15px_0_rgba(0,0,0,.15)] rounded-md opacity-100">
        <OriginalShoppingCart {...props} />
      </div>
    );
  };
});

// Mock the Stripe environment variables
const mockEnv = {
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'test_key',
  NEXT_PUBLIC_URL: 'http://localhost:3000'
};

// Create a wrapper component to provide the CartProvider context
const TestWrapper = ({ children }) => (
  <CartProvider
    mode="payment"
    cartMode="client-only"
    stripe={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
    successUrl={`${process.env.NEXT_PUBLIC_URL}/success`}
    cancelUrl={`${process.env.NEXT_PUBLIC_URL}/?success=false`}
    currency="JPY"
    allowedCountries={["JP"]}
    shouldPersist={false} // Don't persist during tests
  >
    {children}
  </CartProvider>
);

describe('Shopping Flow Integration', () => {
  beforeEach(() => {
    // Setup environment variables
    process.env = { ...process.env, ...mockEnv };

    // Clear localStorage between tests
    window.localStorage.clear();
  });

  it('adds a product to the cart and updates the cart display', async () => {
    // Create a test product
    const testProduct = {
      id: 'test_product_1',
      name: 'Test Product',
      emoji: '🍎',
      price: 1000,
      currency: 'JPY'
    };

    // No need to mock useShoppingCart as we've mocked the ShoppingCart component

    // Render both components within the CartProvider
    const { debug } = render(
      <TestWrapper>
        <div>
          <Product product={testProduct} />
          <ShoppingCart />
        </div>
      </TestWrapper>
    );

    // Initially, the cart should be empty
    expect(screen.getByText(/You have no items in your cart/i)).toBeInTheDocument();

    // Find and click the "Add to Cart" button
    const addButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addButton);

    // Debug the rendered output to see what's available
    console.log('[DEBUG_LOG] After clicking Add to Cart button');
    debug();

    // Wait for the product to appear in the cart
    await waitFor(() => {
      expect(screen.queryByText('Test Product')).toBeInTheDocument();
    });

    // Now check for the other elements
    expect(screen.getByText('￥1000')).toBeInTheDocument();
    expect(screen.getByText('(1)')).toBeInTheDocument();

    // Test removing the item from the cart
    const removeButton = screen.getByRole('button', { 
      name: (_, element) => {
        return element.querySelector('img[alt="delete icon"]') !== null;
      }
    });
    fireEvent.click(removeButton);

    // Wait for the cart to be empty again
    await waitFor(() => {
      expect(screen.getByText(/You have no items in your cart/i)).toBeInTheDocument();
    });
  });
});
