
### Running locally with Stripe for now no backend:
1.  Do npm install to install all dependencies
2.  Then to run the local server, do npm run dev

For environment, please send me DM to give you the Stripe keys. 

## Testing

This project includes a comprehensive testing setup with unit tests, integration tests, and end-to-end tests.

### Running Tests

- **Unit and Integration Tests**:
  ```bash
  # Run all tests
  npm test

  # Run tests in watch mode (for development)
  npm run test:watch

  # Generate test coverage report
  npm run test:coverage
  ```

- **End-to-End Tests**:
  ```bash
  # Cypress
  # Open Cypress test runner
  npm run cypress

  # Run Cypress tests headlessly
  npm run cypress:headless

  # Playwright
  # Run Playwright tests in headless mode
  npm run test:e2e

  # Run Playwright tests with UI mode for debugging
  npm run test:e2e:ui
  ```

### Testing Structure

- **Unit Tests**: Located in `__tests__/components/` - test individual components in isolation
- **Integration Tests**: Located in `__tests__/integration/` - test component interactions
- **E2E Tests**: 
  - Cypress: Located in `cypress/e2e/` - test complete user flows
  - Playwright: Located in `e2e-tests/` - test complete user flows with alternative framework

### Test Configuration

- Jest configuration is in `jest.config.js`
- Jest setup is in `jest.setup.js`
- Cypress configuration is in `cypress.config.js`
- Playwright configuration is in `playwright.config.js`

For more details on the testing strategy, see the [testing-strategy.md](./testing-strategy.md) document.

### Japanese Documentation

For Japanese speakers, we have translated testing documentation available:
- [テスト戦略 (Testing Strategy)](./testing-strategy-ja.md) - 包括的なテスト戦略の詳細
- [テストアプローチ概要 (Testing Approaches Summary)](./testing-approaches-summary-ja.md) - 様々なテストアプローチの簡潔な概要
