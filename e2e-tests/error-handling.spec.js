const { test, expect } = require('@playwright/test');

test.describe('E-commerce Error Handling', () => {
  test('shows error when attempting checkout with empty cart', async ({ page }) => {
    // Visit the homepage
    await page.goto('/');
    
    // Open the cart (it should be empty by default)
    await page.locator('nav button').click();
    
    // Verify the cart is empty
    await expect(page.locator('div', { hasText: 'You have no items in your cart' })).toBeVisible();
    
    // Verify the checkout button is disabled or shows an error
    const checkoutButton = page.locator('button', { hasText: 'Proceed to checkout' });
    
    // The button might not exist if the cart is empty, so we need to handle that case
    const buttonCount = await checkoutButton.count();
    
    if (buttonCount > 0) {
      // If the button exists, it should be disabled
      await expect(checkoutButton).toBeDisabled();
      
      // Try to click it anyway (this should not navigate)
      await checkoutButton.click({ force: true });
      
      // Verify we're still on the same page
      await expect(page.url()).not.toContain('checkout.stripe.com');
    } else {
      // If the button doesn't exist, verify we see the empty cart message
      await expect(page.locator('div', { hasText: 'You have no items in your cart' })).toBeVisible();
    }
  });
});