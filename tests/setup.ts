/**
 * Configuration Jest pour les tests
 */

// Mock fetch pour les tests
global.fetch = jest.fn();

// Mock console pour éviter les logs en test
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn()
};

// Configuration des timeouts
jest.setTimeout(10000);

// Reset des mocks avant chaque test
beforeEach(() => {
  jest.clearAllMocks();
});
