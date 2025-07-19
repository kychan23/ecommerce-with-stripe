# Testing Strategy for E-commerce Site with Stripe Integration

## Overview
This document outlines a comprehensive testing strategy for our Next.js e-commerce application with Stripe integration. 
The goal is to ensure the application functions correctly, provides a good user experience, and handles payments securely.

## Testing Approaches

### 1. Unit Testing



Unit tests focus on testing individual components in isolation.

**Recommended Tools:**
- Jest: JavaScript testing framework
- React Testing Library: For testing React components
- @testing-library/user-event: For simulating user interactions

**Components to Test:**
- `CartItem.js`: Test rendering, price display, and remove functionality
- `CheckoutButton.js`: Test different states (loading, errors), validation logic
- `ShoppingCart.js`: Test cart calculations, empty/filled states
- `Product.js`: Test product rendering and "Add to Cart" functionality

**Example Unit Test for CartItem:**
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import CartItem from '../components/CartItem';
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
```

### 2. Integration Testing
Integration tests verify that multiple components work together correctly.

**Recommended Tools:**
- Jest
- React Testing Library
- Mock Service Worker (MSW): For mocking API calls

**Scenarios to Test:**
- Adding a product to cart and seeing it appear in the shopping cart
- Cart total updates correctly when adding/removing items
- Checkout flow from cart to Stripe redirect

**Example Integration Test:**
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { CartProvider } from 'use-shopping-cart';
import Product from '../components/Product';
import ShoppingCart from '../components/ShoppingCart';

// Mock the Stripe environment variables
const mockEnv = {
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'test_key',
  NEXT_PUBLIC_URL: 'http://localhost:3000'
};

describe('Shopping Flow', () => {
  beforeEach(() => {
    // Setup environment variables
    process.env = { ...process.env, ...mockEnv };
  });

  it('adds a product to the cart and updates the cart display', async () => {
    // Render both components within the CartProvider
    render(
      <CartProvider
        mode="payment"
        cartMode="client-only"
        stripe={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
        currency="JPY"
      >
        <Product product={{ id: '1', name: 'Test Product', emoji: '🍎', price: 1000 }} />
        <ShoppingCart />
      </CartProvider>
    );

    // Find and click the "Add to Cart" button
    const addButton = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(addButton);

    // Check if the product appears in the cart
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('￥1000')).toBeInTheDocument();
    expect(screen.getByText('(1)')).toBeInTheDocument();
  });
});
```

### 3. End-to-End Testing
E2E tests simulate real user journeys through the application.

**Recommended Tools:**
- Cypress: For browser-based end-to-end testing
- Playwright: Alternative to Cypress with multi-browser support

**User Flows to Test:**
- Complete shopping journey: Browse products → Add to cart → Checkout
- Error handling: Attempting checkout with empty cart
- Validation: Testing minimum/maximum cart value restrictions

**Example Cypress Test:**
```javascript
describe('E-commerce Shopping Flow', () => {
  it('allows a user to add products to cart and proceed to checkout', () => {
    // Visit the homepage
    cy.visit('/');

    // Click the "Proceed" button on the intro screen
    cy.contains('button', 'Proceed').click();

    // Add a product to the cart
    cy.contains('Add to Cart').first().click();

    // Open the cart
    cy.get('[data-testid="cart-icon"]').click();

    // Verify product is in cart
    cy.contains('Test Product').should('be.visible');

    // Proceed to checkout
    cy.contains('button', 'Proceed to checkout').click();

    // Verify redirect to Stripe
    cy.url().should('include', 'checkout.stripe.com');
  });
});
```

### 4. Payment Integration Testing
Testing the Stripe integration requires special consideration.

**Approaches:**
- Use Stripe's test mode and test cards
- Mock the Stripe redirect for unit/integration tests
- Test the success/cancel flows with simulated returns

**Example Test Setup for Stripe:**
```javascript
// In your test setup
const mockRedirectToCheckout = jest.fn().mockResolvedValue({ error: null });

jest.mock('use-shopping-cart', () => ({
  useShoppingCart: () => ({
    redirectToCheckout: mockRedirectToCheckout,
    cartCount: 5,
    totalPrice: 5000
  }),
}));

// Then in your test
test('CheckoutButton redirects to Stripe when clicked', async () => {
  render(<CheckoutButton />);

  const button = screen.getByRole('button', { name: /proceed to checkout/i });
  fireEvent.click(button);

  expect(mockRedirectToCheckout).toHaveBeenCalled();
});
```

### 5. Visual Regression Testing
Ensure UI components render correctly across different devices and browsers.

**Recommended Tools:**
- Storybook: For component documentation and visual testing
- Percy or Chromatic: For visual regression testing

## Setting Up the Testing Environment

### Installation Steps
1. Install Jest and React Testing Library:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

2. Install Cypress for E2E testing:
```bash
npm install --save-dev cypress
```

3. Update package.json with test scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "cypress": "cypress open",
    "cypress:headless": "cypress run"
  }
}
```

4. Create Jest configuration (jest.config.js):
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1'
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  }
};
```

5. Create Jest setup file (jest.setup.js):
```javascript
import '@testing-library/jest-dom';
```

## Continuous Integration
Integrate testing into your CI/CD pipeline:

1. Run unit and integration tests on every pull request
2. Run E2E tests on staging deployments
3. Use GitHub Actions or similar CI service

## Conclusion
This testing strategy provides a comprehensive approach to ensuring the quality and reliability of the e-commerce application. By implementing these testing practices, we can confidently make changes and add features while maintaining a high-quality user experience.
