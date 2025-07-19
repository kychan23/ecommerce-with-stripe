# E2E Tests with Playwright

This directory contains end-to-end tests for the e-commerce application using Playwright.

## Test Structure

The tests are organized into the following files:

1. `shopping-journey.spec.js` - Tests the complete shopping journey from browsing products to checkout
2. `error-handling.spec.js` - Tests error handling when attempting to checkout with an empty cart
3. `validation.spec.js` - Tests validation rules for minimum cart value and maximum number of items
4. `cart-management.spec.js` - Tests cart management functionality like removing items and updating quantities

## Running the Tests

To run the tests, you can use the following npm scripts:

```bash
# Run all tests in headless mode
npm run test:e2e

# Run tests with UI mode for debugging
npm run test:e2e:ui

# Run a specific test file
npx playwright test e2e-tests/shopping-journey.spec.js

# Run tests in a specific browser
npx playwright test --project=chromium
```

## Test Coverage

The tests cover the following user flows:

1. **Complete Shopping Journey**
   - Browse products
   - Add products to cart
   - Proceed to checkout
   - Verify redirect to Stripe

2. **Error Handling**
   - Attempting checkout with empty cart
   - Verifying appropriate error messages

3. **Validation Rules**
   - Minimum cart value restriction (¥300)
   - Maximum items restriction (20 items)

4. **Cart Management**
   - Removing items from the cart
   - Updating quantity when adding the same product multiple times

## Adding New Tests

When adding new tests, follow these guidelines:

1. Create a new file for a new category of tests
2. Use descriptive test names that explain the behavior being tested
3. Add comments to explain complex interactions
4. Use page objects for common interactions if the test suite grows larger