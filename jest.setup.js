// Setup file for Jest
import '@testing-library/jest-dom';
import 'jest-canvas-mock';

// Only setup browser-specific mocks if we're in a browser environment
if (typeof window !== 'undefined') {
  // Mock localStorage
  const localStorageMock = (function() {
    let store = {};
    return {
      getItem(key) {
        return store[key] || null;
      },
      setItem(key, value) {
        store[key] = value.toString();
      },
      removeItem(key) {
        delete store[key];
      },
      clear() {
        store = {};
      }
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });

  // Mock next/router
  jest.mock('next/router', () => ({
    useRouter() {
      return {
        route: '/',
        pathname: '',
        query: {},
        asPath: '',
        push: jest.fn(),
        replace: jest.fn(),
        events: {
          on: jest.fn(),
          off: jest.fn()
        }
      };
    }
  }));
}

// Suppress console.error, console.warn, and stack traces during tests
global.console.error = jest.fn();
global.console.warn = jest.fn();

// Reduce stack trace noise
Error.stackTraceLimit = 3;

// Override Error serialization for cleaner test output
const originalPrepareStackTrace = Error.prepareStackTrace;
Error.prepareStackTrace = (err, stack) => {
  if (process.env.NODE_ENV === 'test') {
    return `${err.message}`;
  }
  return originalPrepareStackTrace ? originalPrepareStackTrace(err, stack) : undefined;
};