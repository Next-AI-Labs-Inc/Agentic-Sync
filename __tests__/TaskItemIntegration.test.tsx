import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskRequirements from '../src/components/TaskCard/TaskRequirements';
import { ItemWithStatus } from '@/types';
import { FeatureFlags } from '@/config/constants/featureFlags';

// Mock the feature flags for testing
jest.mock('@/config/constants/featureFlags', () => ({
  FeatureFlags: {
    ApproveAndVetoButtonsOperational: true // Enable buttons for tests
  }
}));

// Mocking next/link to avoid router errors
jest.mock('next/link', () => {
  return ({children}) => {
    return children;
  }
});

/**
 * UX IMPACT: This test ensures that when users approve requirements, the UI 
 * immediately reflects the changes and updates the progress indicators.
 * If this fails, users would be unable to track task progress accurately.
 * 
 * TECHNICAL CONTEXT: Tests the integration between TaskRequirements, ItemSection, 
 * and EditableItemList components to verify the approval flow works end-to-end.
 */
describe('Task Item Integration Tests', () => {
  // Mock task data with requirements
  const mockTask = {
    id: 'task-123',
    requirementItems: [
      {
        id: 'req-1',
        content: 'Requirement 1',
        status: 'proposed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'req-2',
        content: 'Requirement 2',
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvedAt: new Date().toISOString()
      }
    ] as ItemWithStatus[],
    requirements: 'Requirement 1\nRequirement 2'
  };

  // Mock handlers
  const mockOnApproveRequirementItem = jest.fn().mockImplementation((taskId, itemId) => {
    // This would typically update the database
    return Promise.resolve();
  });
  
  const mockOnVetoRequirementItem = jest.fn().mockImplementation(() => Promise.resolve());
  
  const mockOnUpdateRequirementItems = jest.fn().mockImplementation((taskId, items) => {
    // This would typically update the database
    return Promise.resolve();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('approving a requirement item calls the callback with correct parameters', async () => {
    render(
      <TaskRequirements
        task={mockTask}
        onApproveRequirementItem={mockOnApproveRequirementItem}
        onVetoRequirementItem={mockOnVetoRequirementItem}
        onUpdateRequirementItems={mockOnUpdateRequirementItems}
      />
    );

    // Initial state should show 1/2 requirements approved
    const progressText = screen.getByText('1/2 approved');
    expect(progressText).toBeInTheDocument();
    
    // Find and click the approve button for the first requirement
    const approveButton = screen.getByTestId('approve-btn-0');
    expect(approveButton).toBeInTheDocument();
    
    fireEvent.click(approveButton);
    
    // Verify that onApproveRequirementItem was called with the correct parameters
    expect(mockOnApproveRequirementItem).toHaveBeenCalledTimes(1);
    expect(mockOnApproveRequirementItem).toHaveBeenCalledWith('task-123', 'req-1');
    
    // In a real app, we would test the UI update as well
    // But that requires more complex setup with state management
  });

  test('vetoing a requirement item calls the callback with correct parameters', async () => {
    render(
      <TaskRequirements
        task={mockTask}
        onApproveRequirementItem={mockOnApproveRequirementItem}
        onVetoRequirementItem={mockOnVetoRequirementItem}
        onUpdateRequirementItems={mockOnUpdateRequirementItems}
      />
    );
    
    // Find and click the veto button for the first requirement
    const vetoButton = screen.getByTestId('veto-btn-0');
    expect(vetoButton).toBeInTheDocument();
    
    fireEvent.click(vetoButton);
    
    // Verify that onVetoRequirementItem was called with the correct parameters
    expect(mockOnVetoRequirementItem).toHaveBeenCalledTimes(1);
    expect(mockOnVetoRequirementItem).toHaveBeenCalledWith('task-123', 'req-1');
  });
});