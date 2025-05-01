import React from 'react';
import { render, screen } from '@testing-library/react';
import ItemSection from '@/components/TaskCard/ItemSection';
import '@testing-library/jest-dom';

// Mock the EditableItemList component
jest.mock('@/components/EditableItems/EditableItemList', () => {
  return function MockEditableItemList({ items, rawText }: any) {
    return (
      <div data-testid="editable-item-list">
        <div data-testid="items-count">{items.length}</div>
        <div data-testid="raw-text">{rawText}</div>
      </div>
    );
  };
});

/**
 * UX IMPACT: These tests ensure that the ItemSection component correctly displays
 * section headers, progress indicators, and manages item lists. This component affects
 * how users view and interact with requirements, technical plans, and next steps.
 * 
 * TECHNICAL CONTEXT: The component must correctly calculate progress percentages,
 * display section titles, and pass the right props to the EditableItemList component.
 */
describe('ItemSection', () => {
  /**
   * UX IMPACT: This test ensures that the title and description display correctly,
   * making it clear to users what section they're viewing.
   */
  test('renders section title and description', () => {
    render(
      <ItemSection
        title="Test Requirements"
        description="These are the requirements for the task"
        sectionKey="requirements"
        itemsKey="requirementItems"
        task={{ id: '123', requirements: 'Legacy requirements' }}
        items={[]}
      />
    );
    
    // Check if title and description are displayed
    expect(screen.getByText('Test Requirements')).toBeInTheDocument();
    expect(screen.getByText('These are the requirements for the task')).toBeInTheDocument();
  });

  /**
   * UX IMPACT: This test ensures that the progress information displays correctly
   * when items are present, helping users understand the approval status at a glance.
   */
  test('shows progress information when items are present', () => {
    const items = [
      { id: '1', content: 'Item 1', status: 'approved', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
      { id: '2', content: 'Item 2', status: 'pending', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
      { id: '3', content: 'Item 3', status: 'approved', createdAt: '2023-01-01', updatedAt: '2023-01-01' }
    ];
    
    render(
      <ItemSection
        title="Test Requirements"
        sectionKey="requirements"
        itemsKey="requirementItems"
        task={{ id: '123' }}
        items={items}
      />
    );
    
    // Check if progress stats are shown
    expect(screen.getByText('2/3 approved')).toBeInTheDocument();
    
    // Progress bar should be present (checking for parent element)
    expect(screen.getByRole('heading', { name: 'Test Requirements' })).toBeInTheDocument();
  });

  /**
   * UX IMPACT: This test ensures that the component doesn't show progress information
   * when there are no items, preventing confusion for users.
   */
  test('does not show progress information when no items', () => {
    render(
      <ItemSection
        title="Test Requirements"
        sectionKey="requirements"
        itemsKey="requirementItems"
        task={{ id: '123' }}
        items={[]}
      />
    );
    
    // Progress stats should not be shown
    expect(screen.queryByText('0/0 approved')).not.toBeInTheDocument();
  });

  /**
   * UX IMPACT: This test ensures that the component correctly passes raw text
   * from legacy fields to the editable item list, supporting the transition
   * from string-based to structured item-based data.
   */
  test('passes raw text from task to EditableItemList', () => {
    const task = {
      id: '123',
      requirements: 'Legacy requirements text'
    };
    
    render(
      <ItemSection
        title="Test Requirements"
        sectionKey="requirements"
        itemsKey="requirementItems"
        task={task}
        items={[]}
      />
    );
    
    // Check if raw text is passed to EditableItemList
    const rawTextElement = screen.getByTestId('raw-text');
    expect(rawTextElement.textContent).toBe('Legacy requirements text');
  });

  /**
   * UX IMPACT: This test ensures that the component correctly passes raw text
   * from the rawText prop to the editable item list, allowing for flexibility
   * in how text content is provided.
   */
  test('uses provided rawText prop over task field', () => {
    const task = {
      id: '123',
      requirements: 'Legacy requirements text'
    };
    
    render(
      <ItemSection
        title="Test Requirements"
        sectionKey="requirements"
        itemsKey="requirementItems"
        task={task}
        items={[]}
        rawText="Provided raw text"
      />
    );
    
    // Check if provided raw text is used instead of task field
    const rawTextElement = screen.getByTestId('raw-text');
    expect(rawTextElement.textContent).toBe('Provided raw text');
  });

  /**
   * UX IMPACT: This test ensures that the component correctly handles
   * the case when no content is provided, preventing errors for users.
   */
  test('handles missing content gracefully', () => {
    const task = { id: '123' };
    
    render(
      <ItemSection
        title="Test Requirements"
        sectionKey="requirements"
        itemsKey="requirementItems"
        task={task}
        items={[]}
      />
    );
    
    // Component should render without errors
    expect(screen.getByText('Test Requirements')).toBeInTheDocument();
    
    // EditableItemList should receive empty string as rawText
    const rawTextElement = screen.getByTestId('raw-text');
    expect(rawTextElement.textContent).toBe('');
  });
});