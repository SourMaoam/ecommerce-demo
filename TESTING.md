# E-Commerce Testing Infrastructure

This document describes the comprehensive testing setup for the multi-agent e-commerce project.

## Overview

The testing infrastructure is organized into three layers:

1. **Backend Tests** - API integration and unit tests using .NET xUnit
2. **Frontend Tests** - Component and hook tests using Jest & React Testing Library  
3. **E2E Tests** - End-to-end user journey tests using Playwright

## Backend Testing (.NET xUnit)

### Location
`EcommerceApi/Tests/Integration/`

### Test Structure
- **TestWebApplicationFactory.cs** - Custom test server setup with isolated in-memory database
- **ProductsApiTests.cs** - Tests for product CRUD operations, search, filtering
- **CartApiTests.cs** - Tests for cart management, add/remove/update operations
- **OrdersApiTests.cs** - Tests for checkout and order processing

### Running Backend Tests
```bash
cd EcommerceApi
dotnet test
```

### Key Features
- Isolated test environments with unique in-memory databases
- Mock data seeding for consistent test scenarios
- Comprehensive coverage of API endpoints
- Error handling and edge case testing

### Current Status
✅ Test infrastructure complete  
❌ 12/23 tests failing due to API response format mismatches

## Frontend Testing (Jest + React Testing Library)

### Location
`ecommerce-frontend/src/__tests__/`

### Test Structure
```
__tests__/
├── components/
│   ├── cart/
│   │   └── CartItem.test.jsx
│   ├── common/
│   │   └── LoadingSpinner.test.jsx
│   └── products/
│       └── ProductCard.test.jsx
└── hooks/
    └── useProducts.test.js
```

### Running Frontend Tests
```bash
cd ecommerce-frontend
npm test
```

### Key Features
- Component testing with user interaction simulation
- Hook testing with API mocking
- Accessibility and responsive design testing
- Loading and error state validation

### Current Status
✅ Test infrastructure complete  
⚠️ Some dependency resolution issues (react-router-dom version)

## E2E Testing (Playwright)

### Location
`e2e-tests/`

### Test Structure
- **product-browsing.spec.js** - Product listing, searching, filtering, navigation
- **shopping-cart.spec.js** - Add to cart, quantity updates, cart persistence
- **checkout-flow.spec.js** - Complete checkout process, form validation

### Running E2E Tests
```bash
# Prerequisites: Start both backend and frontend servers
cd EcommerceApi && dotnet run
cd ecommerce-frontend && npm start

# Run tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui
```

### Browser Support
- Desktop: Chrome, Firefox, Safari
- Mobile: Chrome (Pixel 5), Safari (iPhone 12)

### Key Features
- Complete user journey testing
- Multi-browser and mobile testing
- Automatic server startup in CI environments
- Screenshot and video capture on failures

## Quick Test Commands

### Run All Tests
```bash
npm run test:all
```

### Individual Test Suites
```bash
# Backend only
npm run test:backend

# Frontend only  
npm run test:frontend

# E2E only
npm run test:e2e
```

## Test Data & Scenarios

### Backend Test Data
- 3 seeded products with different categories and price ranges
- Various cart scenarios with multiple items
- Order creation and validation scenarios

### E2E Test Scenarios
- **Happy Path**: Browse → Add to Cart → Checkout → Complete Order
- **Edge Cases**: Empty cart, out of stock products, form validation
- **Error Handling**: Network failures, invalid inputs

## CI/CD Integration

### Recommended Pipeline
1. **Unit Tests** - Run backend and frontend tests in parallel
2. **Build** - Build both applications
3. **E2E Tests** - Run full user journey tests
4. **Coverage Report** - Generate and publish coverage reports

### Required Environment
- .NET 9 Runtime
- Node.js 18+
- Playwright browsers (auto-installed)

## Contributing to Tests

### Adding Backend Tests
1. Create test class in `EcommerceApi/Tests/Integration/`
2. Use `TestWebApplicationFactory<Program>` for test server
3. Follow existing patterns for setup and assertions

### Adding Frontend Tests
1. Create test file in `ecommerce-frontend/src/__tests__/`
2. Use React Testing Library best practices
3. Mock external dependencies (API calls, routing)

### Adding E2E Tests
1. Create spec file in `e2e-tests/`
2. Use data-testid attributes for reliable selectors
3. Handle loading states and async operations

## Test Coverage Goals

- **Backend**: 90%+ line coverage for business logic
- **Frontend**: 80%+ component and hook coverage
- **E2E**: 100% critical user path coverage

## Known Issues & Limitations

### Backend
- Some API endpoints return inconsistent response formats
- Need better error response standardization

### Frontend
- React Router DOM version compatibility
- Need more complex form interaction tests

### E2E
- Tests assume specific UI text (could be more flexible)
- Mobile testing needs device-specific validation

## Future Enhancements

1. **Performance Testing** - Add load testing with k6 or Artillery
2. **Visual Regression** - Add screenshot comparison testing
3. **API Contract Testing** - Add Pact or similar consumer-driven tests
4. **Accessibility Testing** - Integrate axe-core for automated a11y testing
5. **Security Testing** - Add OWASP ZAP integration for security scanning

## Support & Troubleshooting

### Common Issues

**Backend tests failing with database conflicts:**
- Tests use isolated databases with unique names
- Check for proper test cleanup in `TestWebApplicationFactory`

**Frontend tests can't find modules:**
- Ensure all dependencies are installed: `npm install`
- Check package.json for version compatibility

**E2E tests timing out:**
- Ensure both servers are running before tests start
- Increase timeout in playwright.config.js if needed

**Test data inconsistencies:**
- Backend tests use fresh data for each test
- E2E tests may need to handle varying product data

### Getting Help

For test-related issues:
1. Check this documentation first
2. Review test logs for specific error messages
3. Update shared-comms.md with issues for other agents
4. Ensure all dependencies and servers are properly configured