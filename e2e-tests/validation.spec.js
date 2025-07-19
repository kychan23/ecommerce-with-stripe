const { test, expect } = require('@playwright/test');

test.describe('E-commerce Validation Rules', () => {
  test('enforces minimum cart value restriction', async ({ page }) => {
    // Visit the homepage
    await page.goto('/');
    
    // Find the cheapest product (assuming it's less than the minimum required)
    // From the products.js file, we know the Egg product is ¥100, which is less than the minimum ¥300
    const eggProduct = page.locator('article', { hasText: 'Egg' });
    
    // Add the product to the cart
    await eggProduct.locator('button', { hasText: 'Add to cart' }).click();
    
    // Open the cart
    await page.locator('nav button').click();
    
    // Verify the product is in the cart
    await expect(page.locator('.flex.items-center.gap-4', { hasText: 'Egg' })).toBeVisible();
    
    // Verify the checkout button is disabled due to minimum value restriction
    const checkoutButton = page.locator('button', { hasText: 'Proceed to checkout' });
    await expect(checkoutButton).toBeDisabled();
    
    // Verify the error message about minimum cart value is displayed
    await expect(page.locator('.text-red-700')).toContainText('You must have at least');
  });

  test('enforces maximum items restriction', async ({ page }) => {
    // Visit the homepage
    await page.goto('/');
    
    // Find a product to add multiple times
    const product = page.locator('article').first();
    
    // Open the cart to make sure it's empty
    await page.locator('nav button').click();
    
    // Close the cart by clicking elsewhere
    await page.locator('nav p').click();
    
    // Add the product to the cart multiple times to exceed the limit (20 items)
    // We'll use the quantity controls to set a high quantity
    for (let i = 0; i < 5; i++) {
      // Click the + button 4 times to set quantity to 5
      for (let j = 0; j < 4; j++) {
        await product.locator('button', { hasText: '+' }).click();
      }
      
      // Add to cart (5 items each time, so 5 iterations = 25 items)
      await product.locator('button', { hasText: 'Add to cart' }).click();
    }
    
    // Open the cart
    await page.locator('nav button').click();
    
    // Verify the checkout button is disabled due to maximum items restriction
    const checkoutButton = page.locator('button', { hasText: 'Proceed to checkout' });
    await expect(checkoutButton).toBeDisabled();
    
    // Verify the error message about maximum items is displayed
    await expect(page.locator('.text-red-700')).toContainText('You cannot have more than 20 items');
  });
});