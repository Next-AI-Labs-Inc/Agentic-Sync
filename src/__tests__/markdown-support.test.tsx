import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskMarkdown from '../components/TaskCard/TaskMarkdown';

// Mock the task data
const mockTask = {
  id: 'test-task-id',
  project: 'test-project',
  markdown: '# Test Markdown\n\nThis is a **test** of _markdown_ rendering.'
};

describe('TaskMarkdown Component', () => {
  it('renders markdown content when expanded', () => {
    render(
      <TaskMarkdown 
        task={mockTask}
        isExpanded={true}
      />
    );
    
    // Check that the markdown content is rendered properly
    expect(screen.getByText('Test Markdown')).toBeInTheDocument();
    expect(screen.getByText('This is a test of markdown rendering.')).toBeInTheDocument();
  });
  
  it('does not render when not expanded', () => {
    const { container } = render(
      <TaskMarkdown 
        task={mockTask}
        isExpanded={false}
      />
    );
    
    // Check that nothing is rendered
    expect(container.firstChild).toBeNull();
  });
  
  it('does not render when no markdown content is present', () => {
    const { container } = render(
      <TaskMarkdown 
        task={{ id: 'test-task-id', project: 'test-project' }}
        isExpanded={true}
      />
    );
    
    // Check that nothing is rendered
    expect(container.firstChild).toBeNull();
  });
});