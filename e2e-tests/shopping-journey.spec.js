const { test, expect } = require('@playwright/test');

test.describe('E-commerce Shopping Journey', () => {
  test('allows a user to add products to cart and proceed to checkout', async ({ page }) => {
    // Visit the homepage
    await page.goto('/');
    
    // Get the first product
    const firstProduct = page.locator('article').first();
    const productName = await firstProduct.locator('.text-lg').textContent();
    const productPrice = await firstProduct.locator('.text-2xl').textContent();
    
    // Add the product to the cart
    await firstProduct.locator('button', { hasText: 'Add to cart' }).click();
    
    // Open the cart
    await page.locator('nav button').click();
    
    // Verify product is in cart
    await expect(page.locator('.flex.items-center.gap-4')).toContainText(productName);
    
    // Proceed to checkout
    await page.locator('button', { hasText: 'Proceed to checkout' }).click();
    
    // Verify redirect to Stripe
    await expect(page.url()).toContain('checkout.stripe.com');
  });
});