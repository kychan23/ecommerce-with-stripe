describe('E-commerce Shopping Flow', () => {
  beforeEach(() => {
    // Visit the homepage before each test
    cy.visit('/');
  });

  it('allows a user to add products to cart and proceed to checkout', () => {
    // Click the "Proceed" button on the intro screen if it exists
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Proceed")').length > 0) {
        cy.contains('button', 'Proceed').click();
      }
    });
    
    // Add a product to the cart
    // Note: We're using a more resilient selector that doesn't depend on specific text
    cy.get('button[aria-label="Add to Cart"], button:contains("Add to Cart")')
      .first()
      .click();
    
    // Open the cart (assuming there's a cart icon or button)
    cy.get('[data-testid="cart-icon"], [aria-label="Shopping Cart"], button:contains("Cart")')
      .click();
    
    // Verify at least one product is in cart
    cy.get('div').contains('Total:').should('be.visible');
    
    // Proceed to checkout
    cy.contains('button', 'Proceed to checkout').click();
    
    // Since we can't fully test the Stripe redirect in Cypress,
    // we can verify that the checkout process was initiated
    // This could be checking for a loading state or a redirect
    cy.get('button:contains("Proceed to checkout")')
      .should('have.attr', 'disabled')
      .or('contain', 'Loading');
  });

  it('shows validation message when cart has insufficient value', () => {
    // Click the "Proceed" button on the intro screen if it exists
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Proceed")').length > 0) {
        cy.contains('button', 'Proceed').click();
      }
    });
    
    // Find a low-priced product (assuming there is one)
    // Add it to cart (this is a simplification - you might need to find a specific product)
    cy.get('button[aria-label="Add to Cart"], button:contains("Add to Cart")')
      .first()
      .click();
    
    // Open the cart
    cy.get('[data-testid="cart-icon"], [aria-label="Shopping Cart"], button:contains("Cart")')
      .click();
    
    // Check if there's a validation message about minimum cart value
    // This assumes the cart has a product with value less than the minimum
    cy.contains('You must have at least').should('exist');
    
    // Verify the checkout button is disabled
    cy.contains('button', 'Proceed to checkout')
      .should('be.disabled');
  });

  it('allows removing items from the cart', () => {
    // Click the "Proceed" button on the intro screen if it exists
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Proceed")').length > 0) {
        cy.contains('button', 'Proceed').click();
      }
    });
    
    // Add a product to the cart
    cy.get('button[aria-label="Add to Cart"], button:contains("Add to Cart")')
      .first()
      .click();
    
    // Open the cart
    cy.get('[data-testid="cart-icon"], [aria-label="Shopping Cart"], button:contains("Cart")')
      .click();
    
    // Verify product is in cart
    cy.get('div').contains('Total:').should('be.visible');
    
    // Remove the item from the cart
    cy.get('button[aria-label="delete"], img[alt="delete icon"]')
      .parent('button')
      .click();
    
    // Verify cart is empty
    cy.contains('You have no items in your cart').should('be.visible');
  });
});