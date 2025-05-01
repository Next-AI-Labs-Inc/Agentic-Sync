import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AgentIntegration from '@/components/TaskCard/AgentIntegration';
import '@testing-library/jest-dom';

// Mock the imported components
jest.mock('@/components/FeedbackForm', () => {
  return function MockFeedbackForm({ onSubmit, onCancel, isSubmitting, showTitle }: any) {
    return (
      <div data-testid="feedback-form">
        <button data-testid="submit-feedback" onClick={() => onSubmit('Test feedback')}>
          Submit
        </button>
        <button data-testid="cancel-feedback" onClick={onCancel}>
          Cancel
        </button>
      </div>
    );
  };
});

jest.mock('@/components/AgentLauncher', () => {
  return function MockAgentLauncher({ taskId, taskTitle, onLaunch }: any) {
    return (
      <div data-testid="agent-launcher">
        <button data-testid="launch-implement" onClick={() => onLaunch('implement')}>
          Implement
        </button>
        <button data-testid="launch-demo" onClick={() => onLaunch('demo')}>
          Demo
        </button>
      </div>
    );
  };
});

/**
 * UX IMPACT: These tests ensure that the agent integration component works correctly,
 * allowing users to provide feedback and launch the AI agent to help with task implementation.
 * 
 * TECHNICAL CONTEXT: The component must handle feedback submission and agent launching,
 * and should only appear for tasks with appropriate statuses.
 */
describe('AgentIntegration', () => {
  // Mock functions for the required props
  const mockAddFeedback = jest.fn().mockResolvedValue(undefined);
  const mockLaunchAgent = jest.fn().mockResolvedValue(undefined);
  
  // Reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * UX IMPACT: This test ensures that the component only appears for tasks that
   * are in a state where agent integration is appropriate, preventing users from
   * attempting to use the agent when it's not relevant.
   */
  test('renders only for actionable tasks', () => {
    // Actionable task
    const actionableTask = {
      id: '123',
      title: 'Actionable Task',
      status: 'in-progress'
    };
    
    // Non-actionable task
    const completedTask = {
      id: '456',
      title: 'Completed Task',
      status: 'done'
    };
    
    // Render with actionable task
    const { rerender } = render(
      <AgentIntegration 
        task={actionableTask}
        onAddFeedback={mockAddFeedback}
        onLaunchAgent={mockLaunchAgent}
      />
    );
    
    // Component should be visible
    expect(screen.getByText('Agent Integration')).toBeInTheDocument();
    
    // Re-render with non-actionable task
    rerender(
      <AgentIntegration 
        task={completedTask}
        onAddFeedback={mockAddFeedback}
        onLaunchAgent={mockLaunchAgent}
      />
    );
    
    // Component should not be visible
    expect(screen.queryByText('Agent Integration')).not.toBeInTheDocument();
  });

  /**
   * UX IMPACT: This test ensures that the feedback button works correctly,
   * allowing users to provide feedback on tasks to improve the development process.
   */
  test('shows feedback form when feedback button is clicked', () => {
    const task = {
      id: '123',
      title: 'Test Task',
      status: 'todo'
    };
    
    render(
      <AgentIntegration 
        task={task}
        onAddFeedback={mockAddFeedback}
        onLaunchAgent={mockLaunchAgent}
      />
    );
    
    // Initially, feedback form should not be visible
    expect(screen.queryByTestId('feedback-form')).not.toBeInTheDocument();
    
    // Click the feedback button
    fireEvent.click(screen.getByText('Give Feedback'));
    
    // Feedback form should now be visible
    expect(screen.getByTestId('feedback-form')).toBeInTheDocument();
  });

  /**
   * UX IMPACT: This test ensures that feedback submission works correctly,
   * allowing users to successfully provide feedback on tasks.
   */
  test('submits feedback successfully', async () => {
    const task = {
      id: '123',
      title: 'Test Task',
      status: 'todo'
    };
    
    render(
      <AgentIntegration 
        task={task}
        onAddFeedback={mockAddFeedback}
        onLaunchAgent={mockLaunchAgent}
      />
    );
    
    // Click the feedback button to show form
    fireEvent.click(screen.getByText('Give Feedback'));
    
    // Submit feedback
    fireEvent.click(screen.getByTestId('submit-feedback'));
    
    // Check if feedback was submitted with correct parameters
    expect(mockAddFeedback).toHaveBeenCalledWith('123', 'Test feedback');
  });

  /**
   * UX IMPACT: This test ensures that users can cancel feedback submission,
   * allowing them to change their mind without committing the feedback.
   */
  test('cancels feedback form', () => {
    const task = {
      id: '123',
      title: 'Test Task',
      status: 'todo'
    };
    
    render(
      <AgentIntegration 
        task={task}
        onAddFeedback={mockAddFeedback}
        onLaunchAgent={mockLaunchAgent}
      />
    );
    
    // Click the feedback button to show form
    fireEvent.click(screen.getByText('Give Feedback'));
    
    // Cancel feedback
    fireEvent.click(screen.getByTestId('cancel-feedback'));
    
    // Feedback form should no longer be visible
    expect(screen.queryByTestId('feedback-form')).not.toBeInTheDocument();
    
    // Should show the main component again
    expect(screen.getByText('Agent Integration')).toBeInTheDocument();
  });

  /**
   * UX IMPACT: This test ensures that the agent launcher works correctly,
   * allowing users to get AI assistance with implementing tasks.
   */
  test('launches agent correctly', () => {
    const task = {
      id: '123',
      title: 'Test Task',
      status: 'todo'
    };
    
    render(
      <AgentIntegration 
        task={task}
        onAddFeedback={mockAddFeedback}
        onLaunchAgent={mockLaunchAgent}
      />
    );
    
    // Click the implement button
    fireEvent.click(screen.getByTestId('launch-implement'));
    
    // Check if agent was launched with correct parameters
    expect(mockLaunchAgent).toHaveBeenCalledWith('123', 'implement', undefined);
    
    // Click the demo button
    fireEvent.click(screen.getByTestId('launch-demo'));
    
    // Check if agent was launched with correct parameters
    expect(mockLaunchAgent).toHaveBeenCalledWith('123', 'demo', undefined);
  });

  /**
   * UX IMPACT: This test ensures that the component conditionally shows
   * the appropriate buttons based on available functionality.
   */
  test('conditionally shows feedback and agent buttons', () => {
    const task = {
      id: '123',
      title: 'Test Task',
      status: 'todo'
    };
    
    // Render with only feedback
    const { rerender } = render(
      <AgentIntegration 
        task={task}
        onAddFeedback={mockAddFeedback}
      />
    );
    
    // Should show feedback button but not agent launcher
    expect(screen.getByText('Give Feedback')).toBeInTheDocument();
    expect(screen.queryByTestId('agent-launcher')).not.toBeInTheDocument();
    
    // Re-render with only agent launcher
    rerender(
      <AgentIntegration 
        task={task}
        onLaunchAgent={mockLaunchAgent}
      />
    );
    
    // Should show agent launcher but not feedback button
    expect(screen.queryByText('Give Feedback')).not.toBeInTheDocument();
    expect(screen.getByTestId('agent-launcher')).toBeInTheDocument();
  });
});