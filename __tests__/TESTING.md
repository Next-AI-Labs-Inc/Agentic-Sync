# Task App Testing Guide

This document provides information about testing the Tasks app, with special focus on the real-time synchronization components that use EventBus.

## Test Structure

The tests are divided into three main categories:

1. `EventBus.test.ts` - Tests for the core EventBus implementation (publish/subscribe system)
2. `TaskSyncService.test.ts` - Tests for the TaskSyncService, which uses EventBus
3. `TaskContextSync.test.tsx` - Tests for the synchronization features in TaskContext

## Memory Usage Considerations

The original test implementation caused memory leaks in several ways:

1. Large nested mock structures with test data were created and destroyed for each test
2. Complex subscriptions were created without proper cleanup
3. Multiple emitted events were processed in rapid succession
4. Tests failed to properly clean up resources between test runs

### How the New Tests Prevent Memory Leaks

1. **Simplified Mocking**: The new tests use simpler, more focused mocks with only the necessary data
2. **Proper Cleanup**: Each test explicitly unsubscribes from events in cleanup
3. **Clean Instance Per Test**: Each test starts with a fresh EventBus instance
4. **Direct Testing**: We test the core functionality directly rather than through React component wrappers

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- EventBus.test.ts

# Run with watch mode
npm test -- --watch EventBus.test.ts

# Run with coverage
npm test -- --coverage
```

## Testing Strategy

1. **Unit Tests**: Test individual components (EventBus, TaskSyncService)
2. **Isolation**: Tests don't depend on the state of other tests
3. **Simplicity**: Each test verifies one specific behavior
4. **Cleanup**: All tests clean up after themselves

## Key Components Under Test

### EventBus

The core event system providing publish/subscribe functionality. Tests verify:
- Event subscription and unsubscription
- Event emission to registered listeners
- Proper listener cleanup to prevent memory leaks

### TaskSyncService

A service that manages real-time task updates using EventBus. Tests verify:
- Task event subscription
- Task event emissions
- Proper cleanup on shutdown

### TaskContext (React)

The React context providing task state and operations to components. Tests verify:
- Real-time updates when tasks are created, updated, or deleted
- Proper cleanup on component unmount

## Performance Testing

The tests include a performance test case that simulates many events and listeners to ensure the system can handle high throughput without memory issues.