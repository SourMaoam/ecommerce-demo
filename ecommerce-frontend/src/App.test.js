import { render } from '@testing-library/react';
import App from './App';

test('renders ecommerce app without crashing', () => {
  // Simple smoke test to ensure app renders without errors
  render(<App />);
  // If we get here without throwing, the test passes
  expect(true).toBe(true);
});
