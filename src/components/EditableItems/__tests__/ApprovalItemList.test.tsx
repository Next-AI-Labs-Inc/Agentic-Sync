import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApprovalItemList from '../ApprovalItemList';
import { ItemWithStatus } from '@/types';

describe('ApprovalItemList', () => {
  // Sample test data
  const mockItems: ItemWithStatus[] = [
    {
      id: 'item-1',
      content: 'Test item 1',
      status: 'proposed',
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-03-01T00:00:00Z'
    },
    {
      id: 'item-2',
      content: 'Test item 2',
      status: 'approved',
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-03-01T00:00:00Z',
      approvedAt: '2025-03-05T00:00:00Z'
    }
  ];

  // Mock handlers
  const mockOnUpdate = jest.fn();
  const mockOnApprove = jest.fn().mockImplementation(() => Promise.resolve());
  const mockOnVeto = jest.fn().mockImplementation(() => Promise.resolve());

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component with items', () => {
    render(
      <ApprovalItemList
        items={mockItems}
        label="Requirements"
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
        onVeto={mockOnVeto}
      />
    );

    // Check if the label is rendered
    expect(screen.getByText('Requirements')).toBeInTheDocument();

    // Check if both items are rendered
    expect(screen.getByText('Test item 1')).toBeInTheDocument();
    expect(screen.getByText('Test item 2')).toBeInTheDocument();

    // Check if the approved item has the approved badge
    expect(screen.getByTestId('approved-badge')).toBeInTheDocument();

    // Check if approve/veto buttons are only shown for proposed items
    expect(screen.getByTestId('approve-btn-0')).toBeInTheDocument();
    expect(screen.getByTestId('veto-btn-0')).toBeInTheDocument();
    expect(screen.queryByTestId('approve-btn-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('veto-btn-1')).not.toBeInTheDocument();
  });

  test('renders empty state when no items', () => {
    render(
      <ApprovalItemList
        items={[]}
        label="Requirements"
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
        onVeto={mockOnVeto}
      />
    );

    expect(screen.getByTestId('empty-message')).toBeInTheDocument();
    expect(screen.getByText('No requirements items. Click the + button to add one.')).toBeInTheDocument();
  });

  test('allows adding a new item', async () => {
    render(
      <ApprovalItemList
        items={mockItems}
        label="Requirements"
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
        onVeto={mockOnVeto}
      />
    );

    // Click the add button
    fireEvent.click(screen.getByTestId('add-item-btn'));
    
    // Textarea should appear
    const textarea = screen.getByTestId('new-item-textarea');
    expect(textarea).toBeInTheDocument();
    
    // Enter text
    fireEvent.change(textarea, { target: { value: 'New requirement' } });
    
    // Save the new item
    fireEvent.click(screen.getByTestId('save-new-btn'));
    
    // onUpdate should be called with the new item added
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    const updatedItems = mockOnUpdate.mock.calls[0][0];
    expect(updatedItems.length).toBe(3);
    expect(updatedItems[2].content).toBe('New requirement');
    expect(updatedItems[2].status).toBe('proposed');
  });

  test('allows editing an existing item', () => {
    render(
      <ApprovalItemList
        items={mockItems}
        label="Requirements"
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
        onVeto={mockOnVeto}
      />
    );

    // Double click on the first item
    fireEvent.doubleClick(screen.getByTestId('item-content-0'));
    
    // Textarea should appear
    const textarea = screen.getByTestId('edit-textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Test item 1');
    
    // Change the text
    fireEvent.change(textarea, { target: { value: 'Updated test item' } });
    
    // Save the changes
    fireEvent.click(screen.getByTestId('save-edit-btn'));
    
    // onUpdate should be called with the updated item
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    const updatedItems = mockOnUpdate.mock.calls[0][0];
    expect(updatedItems.length).toBe(2);
    expect(updatedItems[0].content).toBe('Updated test item');
  });

  test('calls onApprove when approve button is clicked', async () => {
    render(
      <ApprovalItemList
        items={mockItems}
        label="Requirements"
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
        onVeto={mockOnVeto}
      />
    );

    // Click the approve button on the first item
    fireEvent.click(screen.getByTestId('approve-btn-0'));
    
    // onApprove should be called with the correct item ID
    expect(mockOnApprove).toHaveBeenCalledTimes(1);
    expect(mockOnApprove).toHaveBeenCalledWith('item-1');
    
    // The button should show "Processing..." while the approval is in progress
    expect(screen.getByTestId('approve-btn-0')).toHaveTextContent('Processing...');
    
    // After the promise resolves, the button should be re-enabled
    await waitFor(() => {
      expect(screen.getByTestId('approve-btn-0')).toHaveTextContent('Approve');
    });
  });

  test('calls onVeto when veto button is clicked', async () => {
    render(
      <ApprovalItemList
        items={mockItems}
        label="Requirements"
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
        onVeto={mockOnVeto}
      />
    );

    // Click the veto button on the first item
    fireEvent.click(screen.getByTestId('veto-btn-0'));
    
    // onVeto should be called with the correct item ID
    expect(mockOnVeto).toHaveBeenCalledTimes(1);
    expect(mockOnVeto).toHaveBeenCalledWith('item-1');
    
    // The button should show "Processing..." while the veto is in progress
    expect(screen.getByTestId('veto-btn-0')).toHaveTextContent('Processing...');
    
    // After the promise resolves, the button should be re-enabled
    await waitFor(() => {
      expect(screen.getByTestId('veto-btn-0')).toHaveTextContent('Veto');
    });
  });

  test('handles errors during approval gracefully', async () => {
    // Mock console.error to prevent test output noise
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Create a failing mock
    const mockFailingApprove = jest.fn().mockImplementation(() => Promise.reject(new Error('Approval failed')));

    render(
      <ApprovalItemList
        items={mockItems}
        label="Requirements"
        onUpdate={mockOnUpdate}
        onApprove={mockFailingApprove}
        onVeto={mockOnVeto}
      />
    );

    // Click the approve button on the first item
    fireEvent.click(screen.getByTestId('approve-btn-0'));
    
    // The button should show "Processing..." while the approval is in progress
    expect(screen.getByTestId('approve-btn-0')).toHaveTextContent('Processing...');
    
    // After the promise rejects, the button should be re-enabled
    await waitFor(() => {
      expect(screen.getByTestId('approve-btn-0')).toHaveTextContent('Approve');
    });

    // Should log the error but not crash
    expect(console.error).toHaveBeenCalled();

    // Restore console.error
    console.error = originalConsoleError;
  });

  test('handles approval of complex items with non-string IDs gracefully', async () => {
    // Create items with undefined IDs to test robustness
    const itemsWithComplexIds: ItemWithStatus[] = [
      {
        id: undefined as any, // This is intentionally creating an item with an undefined ID
        content: 'Complex item',
        status: 'proposed',
        createdAt: '2025-03-01T00:00:00Z',
        updatedAt: '2025-03-01T00:00:00Z'
      }
    ];

    render(
      <ApprovalItemList
        items={itemsWithComplexIds}
        label="Requirements"
        onUpdate={mockOnUpdate}
        onApprove={mockOnApprove}
        onVeto={mockOnVeto}
      />
    );

    // Component should render without crashing
    expect(screen.getByText('Complex item')).toBeInTheDocument();
  });
});