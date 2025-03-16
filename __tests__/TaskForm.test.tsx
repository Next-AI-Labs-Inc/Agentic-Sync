import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '@/components/TaskForm';
import { InitiativeProvider } from '@/contexts/InitiativeContext';

// Mock the useInitiatives hook
jest.mock('@/contexts/InitiativeContext', () => {
  const originalModule = jest.requireActual('@/contexts/InitiativeContext');
  return {
    ...originalModule,
    useInitiatives: () => ({
      initiatives: [
        { id: 1, name: 'Documentation Map Enhancement', description: 'Test initiative 1', status: 'in-progress', priority: 'high', createdAt: '', updatedAt: '' },
        { id: 2, name: 'Bug Reporting System', description: 'Test initiative 2', status: 'in-progress', priority: 'high', createdAt: '', updatedAt: '' }
      ],
      loading: false,
      error: null,
      refreshInitiatives: jest.fn(),
      createInitiative: jest.fn()
    })
  };
});

describe('TaskForm', () => {
  const mockProjects = [
    { id: 'project1', name: 'Project 1', description: 'Test Project 1' },
    { id: 'project2', name: 'Project 2', description: 'Test Project 2' }
  ];
  
  const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
  const mockOnCancel = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });
  
  test('renders the form with all required fields', () => {
    render(
      <InitiativeProvider>
        <TaskForm 
          projects={mockProjects} 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </InitiativeProvider>
    );
    
    // Check for important form elements
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/project/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/initiative/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    
    // Check for submit and cancel buttons
    expect(screen.getByRole('button', { name: /save task/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });
  
  test('shows "None" option for project and all available projects', () => {
    render(
      <InitiativeProvider>
        <TaskForm 
          projects={mockProjects} 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </InitiativeProvider>
    );
    
    const projectSelect = screen.getByLabelText(/project/i);
    expect(projectSelect).toBeInTheDocument();
    
    // Check for project options
    const options = screen.getAllByRole('option');
    const projectOptions = Array.from(options).filter(
      option => option.textContent === 'None' ||
                option.textContent === 'Project 1' ||
                option.textContent === 'Project 2'
    );
    
    // Verify the project options
    expect(projectOptions.length).toBeGreaterThanOrEqual(3);
    
    // Check for individual project options
    expect(screen.getByRole('option', { name: 'Project 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Project 2' })).toBeInTheDocument();
  });
  
  test('shows initiative options in the dropdown', () => {
    render(
      <InitiativeProvider>
        <TaskForm 
          projects={mockProjects} 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </InitiativeProvider>
    );
    
    const initiativeSelect = screen.getByLabelText(/initiative/i);
    expect(initiativeSelect).toBeInTheDocument();
    
    // Check for initiative options
    const options = screen.getAllByRole('option');
    const initiativeOptions = Array.from(options).filter(
      option => option.textContent === 'None' ||
                option.textContent === 'Documentation Map Enhancement' ||
                option.textContent === 'Bug Reporting System'
    );
    
    // Verify we found at least 3 options (None + 2 initiatives)
    expect(initiativeOptions.length).toBeGreaterThanOrEqual(3);
    
    // Check for specific initiatives
    expect(screen.getByRole('option', { name: 'Documentation Map Enhancement' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Bug Reporting System' })).toBeInTheDocument();
  });
  
  test('remembers last selected project', async () => {
    // Set last project in localStorage
    localStorage.setItem('taskForm_lastProject', 'project2');
    
    render(
      <InitiativeProvider>
        <TaskForm 
          projects={mockProjects} 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </InitiativeProvider>
    );
    
    // Check that project2 is selected
    const projectSelect = screen.getByLabelText(/project/i) as HTMLSelectElement;
    expect(projectSelect.value).toBe('project2');
  });
  
  test('validates required fields', async () => {
    render(
      <InitiativeProvider>
        <TaskForm 
          projects={mockProjects} 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </InitiativeProvider>
    );
    
    // Clear the title field (it's required)
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: '' } });
    
    // Try to submit the form
    const submitButton = screen.getByRole('button', { name: /save task/i });
    fireEvent.click(submitButton);
    
    // Check for validation error
    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    
    // Verify onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  test('submits form with correct data when all required fields are filled', async () => {
    render(
      <InitiativeProvider>
        <TaskForm 
          projects={mockProjects} 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </InitiativeProvider>
    );
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Test Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Test description' } });
    fireEvent.change(screen.getByLabelText(/priority/i), { target: { value: 'high' } });
    fireEvent.change(screen.getByLabelText(/project/i), { target: { value: 'project1' } });
    fireEvent.change(screen.getByLabelText(/status/i), { target: { value: 'todo' } });
    fireEvent.change(screen.getByLabelText(/initiative/i), { target: { value: 'Documentation Map Enhancement' } });
    fireEvent.change(screen.getByLabelText(/tags/i), { target: { value: 'test,form,jest' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save task/i }));
    
    // Wait for the form to be submitted
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
    
    // Check that the correct data was submitted
    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Test Task',
      description: 'Test description',
      priority: 'high',
      project: 'project1',
      status: 'todo',
      initiative: 'Documentation Map Enhancement',
      tags: 'test,form,jest',
    }));
    
    // Check that onCancel was called to close the form
    expect(mockOnCancel).toHaveBeenCalled();
  });
  
  test('handles cancel button click', () => {
    render(
      <InitiativeProvider>
        <TaskForm 
          projects={mockProjects} 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </InitiativeProvider>
    );
    
    // Click the cancel button
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    
    // Check that onCancel was called
    expect(mockOnCancel).toHaveBeenCalled();
    
    // Check that onSubmit was not called
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  test('saves the project preference to localStorage', async () => {
    render(
      <InitiativeProvider>
        <TaskForm 
          projects={mockProjects} 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      </InitiativeProvider>
    );
    
    // Select a project
    fireEvent.change(screen.getByLabelText(/project/i), { target: { value: 'project2' } });
    
    // Check that localStorage was updated
    expect(localStorage.getItem('taskForm_lastProject')).toBe('project2');
  });
});