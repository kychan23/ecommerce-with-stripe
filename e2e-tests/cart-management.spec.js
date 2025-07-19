const { test, expect } = require('@playwright/test');

test.describe('E-commerce Cart Management', () => {
  test('allows removing items from the cart', async ({ page }) => {
    // Visit the homepage
    await page.goto('/');
    
    // Add the first product to the cart
    const firstProduct = page.locator('article').first();
    const productName = await firstProduct.locator('.text-lg').textContent();
    await firstProduct.locator('button', { hasText: 'Add to cart' }).click();
    
    // Open the cart
    await page.locator('nav button').click();
    
    // Verify the product is in the cart
    await expect(page.locator('.flex.items-center.gap-4')).toContainText(productName);
    
    // Get the cart item count before removal
    const cartCountBefore = await page.locator('nav .bg-emerald-500.text-xs').textContent();
    
    // Remove the item from the cart
    await page.locator('.flex.items-center.gap-4 button').click();
    
    // Verify the product is removed from the cart
    await expect(page.locator('div', { hasText: 'You have no items in your cart' })).toBeVisible();
    
    // Verify the cart count is updated
    // Note: The cart count might disappear or show 0, depending on the implementation
    const cartCountAfter = await page.locator('nav .bg-emerald-500.text-xs').textContent();
    expect(cartCountAfter).not.toEqual(cartCountBefore);
  });

  test('updates quantity when adding the same product multiple times', async ({ page }) => {
    // Visit the homepage
    await page.goto('/');
    
    // Add the first product to the cart
    const firstProduct = page.locator('article').first();
    const productName = await firstProduct.locator('.text-lg').textContent();
    await firstProduct.locator('button', { hasText: 'Add to cart' }).click();
    
    // Add the same product again
    await firstProduct.locator('button', { hasText: 'Add to cart' }).click();
    
    // Open the cart
    await page.locator('nav button').click();
    
    // Verify the product is in the cart with quantity 2
    const cartItem = page.locator('.flex.items-center.gap-4', { hasText: productName });
    await expect(cartItem).toContainText('(2)');
    
    // Verify the total price is doubled
    const productPrice = await firstProduct.locator('.text-2xl').textContent();
    const priceValue = parseInt(productPrice.replace(/[^\d]/g, ''));
    const expectedTotal = `￥${priceValue * 2}`;
    
    // Check if the total contains the expected value
    await expect(page.locator('div.text-right.font-bold')).toContainText(expectedTotal);
  });
});