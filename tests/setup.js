// Test setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_minimum_32_characters';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_minimum_32_chars';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.LOG_LEVEL = 'error';

// Set test timeout
jest.setTimeout(10000);

// Mock console methods in test environment
if (typeof globalThis !== 'undefined') {
  globalThis.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}
