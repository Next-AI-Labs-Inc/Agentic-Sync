/**
 * Tests for the DataModelProvider component
 */

import React from 'react';
import { render, act, screen, waitFor } from '@testing-library/react';
import { DataModelProvider, useDataModel } from '../src/components/DataModelSystem';
import tasksConfig from '../src/config/dataModels/tasksConfig';

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { id: '1', title: 'Test Item 1', status: 'todo', createdAt: new Date().toISOString() },
      { id: '2', title: 'Test Item 2', status: 'in-progress', createdAt: new Date().toISOString() }
    ])
  })
) as jest.Mock;

// Test component that uses the provider
const TestComponent = () => {
  const { items, loading, error, sortBy, sortDirection, filters, filteredItems } = useDataModel();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading...' : 'Loaded'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <div data-testid="sort">{`${sortBy}:${sortDirection}`}</div>
      <div data-testid="filters">{JSON.stringify(filters)}</div>
      <div data-testid="item-count">{items.length}</div>
      <div data-testid="filtered-count">{filteredItems.length}</div>
      <ul>
        {filteredItems.map(item => (
          <li key={item.id} data-testid={`item-${item.id}`}>
            {item.title} - {item.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

describe('DataModelProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should provide data model context with initial loading state', async () => {
    render(
      <DataModelProvider config={tasksConfig}>
        <TestComponent />
      </DataModelProvider>
    );
    
    // Initial loading state
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading...');
    
    // Should fetch data
    expect(fetch).toHaveBeenCalledTimes(1);
    
    // After data loads
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
      expect(screen.getByTestId('error')).toHaveTextContent('No error');
      expect(screen.getByTestId('item-count')).toHaveTextContent('2');
      expect(screen.getByTestId('filtered-count')).toHaveTextContent('2');
    });
    
    // Should render items
    expect(screen.getByTestId('item-1')).toHaveTextContent('Test Item 1 - todo');
    expect(screen.getByTestId('item-2')).toHaveTextContent('Test Item 2 - in-progress');
  });
  
  test('should handle fetch errors gracefully', async () => {
    // Mock fetch to return an error
    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );
    
    render(
      <DataModelProvider config={tasksConfig}>
        <TestComponent />
      </DataModelProvider>
    );
    
    // After error occurs
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Loaded');
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load data from the server');
      expect(screen.getByTestId('item-count')).toHaveTextContent('0');
    });
  });
  
  test('should use default sort settings from config', async () => {
    render(
      <DataModelProvider config={tasksConfig}>
        <TestComponent />
      </DataModelProvider>
    );
    
    await waitFor(() => {
      // Should use default sort settings from tasksConfig
      expect(screen.getByTestId('sort')).toHaveTextContent('createdAt:desc');
    });
  });
  
  test('should apply filters correctly', async () => {
    const FilterTestComponent = () => {
      const { setFilter, filteredItems } = useDataModel();
      
      React.useEffect(() => {
        // Apply a status filter
        setFilter('status', 'todo');
      }, [setFilter]);
      
      return (
        <div>
          <div data-testid="filtered-count">{filteredItems.length}</div>
          <ul>
            {filteredItems.map(item => (
              <li key={item.id} data-testid={`item-${item.id}`}>
                {item.title} - {item.status}
              </li>
            ))}
          </ul>
        </div>
      );
    };
    
    render(
      <DataModelProvider config={tasksConfig}>
        <FilterTestComponent />
      </DataModelProvider>
    );
    
    // After filter is applied
    await waitFor(() => {
      expect(screen.getByTestId('filtered-count')).toHaveTextContent('1');
      expect(screen.queryByTestId('item-1')).toBeInTheDocument();
      expect(screen.queryByTestId('item-2')).not.toBeInTheDocument();
    });
  });
});