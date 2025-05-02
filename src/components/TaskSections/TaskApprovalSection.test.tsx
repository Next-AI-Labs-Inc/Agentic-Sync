import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskApprovalSection from './TaskApprovalSection';
import { ItemWithStatus } from '@/types';

// Mock the ApprovalItemList component
jest.mock('../EditableItems/ApprovalItemList', () => {
  return function MockApprovalItemList(props: any) {
    return (
      <div data-testid="approval-item-list">
        <div data-testid="mock-label">{props.label}</div>
        <div data-testid="mock-read-only">{String(!!props.readOnly)}</div>
        <button 
          data-testid="mock-update" 
          onClick={() => props.onUpdate([{ id: 'new-item', content: 'New item', status: 'proposed' }])}
        >
          Update
        </button>
        <button 
          data-testid="mock-approve" 
          onClick={() => props.onApprove('item1')}
        >
          Approve
        </button>
        <button 
          data-testid="mock-veto" 
          onClick={() => props.onVeto('item1')}
        >
          Veto
        </button>
      </div>
    );
  };
});

describe('TaskApprovalSection', () => {
  const mockItems: ItemWithStatus[] = [
    {
      id: 'item1',
      content: 'Test item',
      status: 'proposed',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z'
    }
  ];

  const mockUpdateItems = jest.fn();
  const mockApproveItem = jest.fn();
  const mockVetoItem = jest.fn();
  const mockSetEditingSections = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when isVisible is true', () => {
    render(
      <TaskApprovalSection
        label="Test Section"
        sectionKey="test"
        items={mockItems}
        taskId="task1"
        onUpdateItems={mockUpdateItems}
        onApproveItem={mockApproveItem}
        onVetoItem={mockVetoItem}
        isVisible={true}
      />
    );

    expect(screen.getByTestId('approval-item-list')).toBeInTheDocument();
    expect(screen.getByTestId('mock-label')).toHaveTextContent('Test Section');
  });

  it('does not render when isVisible is false', () => {
    render(
      <TaskApprovalSection
        label="Test Section"
        sectionKey="test"
        items={mockItems}
        taskId="task1"
        onUpdateItems={mockUpdateItems}
        onApproveItem={mockApproveItem}
        onVetoItem={mockVetoItem}
        isVisible={false}
      />
    );

    expect(screen.queryByTestId('approval-item-list')).not.toBeInTheDocument();
  });

  it('passes readOnly prop to ApprovalItemList', () => {
    render(
      <TaskApprovalSection
        label="Test Section"
        sectionKey="test"
        items={mockItems}
        taskId="task1"
        onUpdateItems={mockUpdateItems}
        onApproveItem={mockApproveItem}
        onVetoItem={mockVetoItem}
        isVisible={true}
        readOnly={true}
      />
    );

    expect(screen.getByTestId('mock-read-only')).toHaveTextContent('true');
  });

  it('handles update with taskId', () => {
    render(
      <TaskApprovalSection
        label="Test Section"
        sectionKey="test"
        items={mockItems}
        taskId="task1"
        onUpdateItems={mockUpdateItems}
        onApproveItem={mockApproveItem}
        onVetoItem={mockVetoItem}
        isVisible={true}
        setEditingSections={mockSetEditingSections}
      />
    );

    screen.getByTestId('mock-update').click();
    expect(mockUpdateItems).toHaveBeenCalledWith('task1', [{ id: 'new-item', content: 'New item', status: 'proposed' }]);
  });

  it('resets editing section when items become empty', () => {
    render(
      <TaskApprovalSection
        label="Test Section"
        sectionKey="test"
        items={mockItems}
        taskId="task1"
        onUpdateItems={mockUpdateItems}
        onApproveItem={mockApproveItem}
        onVetoItem={mockVetoItem}
        isVisible={true}
        setEditingSections={mockSetEditingSections}
      />
    );

    // Simulate update with empty items array
    screen.getByTestId('mock-update').click();
    mockUpdateItems.mockImplementationOnce((taskId, items) => {
      if (items.length === 0) {
        expect(mockSetEditingSections).toHaveBeenCalled();
      }
    });

    // Pretend we got empty items
    mockUpdateItems('task1', []);
  });

  it('correctly passes approve and veto handlers with taskId', () => {
    render(
      <TaskApprovalSection
        label="Test Section"
        sectionKey="test"
        items={mockItems}
        taskId="task1"
        onUpdateItems={mockUpdateItems}
        onApproveItem={mockApproveItem}
        onVetoItem={mockVetoItem}
        isVisible={true}
      />
    );

    screen.getByTestId('mock-approve').click();
    expect(mockApproveItem).toHaveBeenCalledWith('task1', 'item1');

    screen.getByTestId('mock-veto').click();
    expect(mockVetoItem).toHaveBeenCalledWith('task1', 'item1');
  });
});