const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,
  screenshotOnRunFailure: true,
  // Set environment variables for testing
  env: {
    // Use Stripe test mode
    CYPRESS_STRIPE_PUBLISHABLE_KEY: 'test_key',
  },
});