import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Project, TaskFormData } from '@/types';
import { ClickableId } from '@/utils/clickable-id';

interface TaskFormProps {
  projects: Project[];
  onSubmit: (taskData: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

// Key for storing the last used project in localStorage
const LAST_PROJECT_KEY = 'taskForm_lastProject';

export default function TaskForm({ projects, onSubmit, onCancel }: TaskFormProps) {
  // Empty array as we removed initiatives
  const initiatives = [];
  
  // Get the initial project - auto-select if only one project exists
  const getInitialProject = () => {
    // If there's only one project, use it
    if (projects.length === 1) {
      return projects[0].id;
    }
    
    // Otherwise try to get from localStorage
    if (typeof window !== 'undefined') {
      const savedProject = localStorage.getItem(LAST_PROJECT_KEY);
      
      // Check if the saved project still exists in the list of projects
      if (savedProject && (savedProject === 'none' || projects.some(p => p.id === savedProject))) {
        return savedProject;
      }
    }
    
    // Default to 'none' if available or first project
    return 'none';
  };
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    userImpact: '',
    quotes: '',
    requirements: '',
    technicalPlan: '',
    priority: 'medium',
    project: getInitialProject(),
    status: 'todo',
    initiative: '',
    tags: '',
    verificationSteps: '',
    nextSteps: ''
  });
  
  const [errors, setErrors] = useState<{
    title?: string;
    project?: string;
    verificationSteps?: string;
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation errors as user types
    if (name === 'title' || name === 'project' || name === 'verificationSteps') {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Save the last used project
  useEffect(() => {
    if (formData.project && typeof window !== 'undefined') {
      localStorage.setItem(LAST_PROJECT_KEY, formData.project);
    }
  }, [formData.project]);
  
  // Handle submit - now with create and continue functionality
  const handleSubmit = async (e: React.FormEvent, shouldCreateAnother = false) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: {
      title?: string;
      project?: string;
      verificationSteps?: string;
    } = {};
    
    if (!formData.title || formData.title.length === 0) {
      newErrors.title = 'Title is required';
    }
    
    // Only require project if it's not 'none'
    if (!formData.project && formData.project !== 'none') {
      newErrors.project = 'Project is required';
    }
    
    // Verification steps are not required
    // Removed requirement for verification steps to match API
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Save project preference immediately
    if (typeof window !== 'undefined' && formData.project) {
      localStorage.setItem(LAST_PROJECT_KEY, formData.project);
    }
    
    // Save the form data for background submission
    const taskDataToSubmit = { ...formData };
    
    // Reset form but keep project and expanded state
    const currentProject = formData.project;
    setFormData({
      title: '',
      description: '',
      userImpact: '',
      quotes: '',
      requirements: '',
      technicalPlan: '',
      priority: 'medium',
      project: currentProject, // Keep the same project
      status: 'todo',
      initiative: '',
      tags: '',
      verificationSteps: '',
      nextSteps: ''
    });
    
    // Only close the form if we're not creating another task
    if (!shouldCreateAnother) {
      onCancel();
    } else {
      // Focus on title input for the next task
      setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus();
        }
      }, 0);
    }
    
    // Now submit in the background
    setIsSubmitting(true);
    
    try {
      // Submit the data in the background
      await onSubmit(taskDataToSubmit);
    } catch (error) {
      console.error('Error submitting task:', error);
      // No UI error shown - error is handled silently to avoid disrupting workflow
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle Enter key press in title field
  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent, true);
    }
  };
  
  // Sort projects alphabetically
  const sortedProjects = [...projects].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Add New</h2>
        <ClickableId 
          id="CO_9103" 
          filePath="/src/components/TaskForm.tsx"
          className="self-center" 
        />
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-4">
          <label htmlFor="title" className="form-label">
            What do you want to get done <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            onKeyDown={handleTitleKeyDown}
            ref={titleInputRef}
            className={`form-input ${errors.title ? 'border-red-500' : ''}`}
            placeholder="What do you want to get done"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>
        
        {/* Area of Concern (Project) */}
        <div className="mb-4">
          <label htmlFor="project" className="form-label">
            What overarching goal does this serve
          </label>
          
          {/* Original select dropdown that works */}
          <select
            id="project"
            name="project"
            value={formData.project}
            onChange={handleChange}
            className={`form-select mb-2 ${errors.project ? 'border-red-500' : ''}`}
          >
            <option value="none">None</option>
            {sortedProjects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          
          {/* Text input for creating a new area of concern */}
          <div className="relative mt-2">
            <input
              type="text"
              id="new-project"
              name="new-project"
              placeholder="Or type a new area of concern here"
              className="form-input pr-10"
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue) {
                  // Create a unique project ID 
                  const projectId = `${inputValue.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
                  
                  // Set the project ID in the form data
                  setFormData(prev => ({ ...prev, project: projectId }));
                }
              }}
            />
          </div>
          
          {errors.project && (
            <p className="mt-1 text-sm text-red-500">{errors.project}</p>
          )}
          <div className="mt-1 text-xs text-gray-500">
            Select an existing area or type a new one above
          </div>
        </div>
        
        {/* More Options Toggle */}
        <div className="mb-4">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center cursor-pointer px-3 py-1 rounded-md"
            onClick={(e) => {
              e.preventDefault(); // Prevent form submission
              e.stopPropagation(); // Stop event bubbling
              setShowMoreOptions(!showMoreOptions);
            }}
          >
            {showMoreOptions ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Hide Options
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                More Options
              </>
            )}
          </button>
        </div>
        
        {/* Additional fields - hidden by default */}
        {showMoreOptions && (
          <div className="space-y-4 animated fadeIn">
            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea h-24"
                placeholder="Enter a brief overview of what this task does"
              />
            </div>
            
            {/* User Impact */}
            <div className="mb-4">
              <label htmlFor="userImpact" className="form-label">
                User Impact
              </label>
              <textarea
                id="userImpact"
                name="userImpact"
                value={formData.userImpact}
                onChange={handleChange}
                className="form-textarea h-24"
                placeholder="Explain how this task benefits users and why it matters (this will be shown in the collapsed view instead of description)"
              />
              <div className="mt-1 text-xs text-gray-500">
                This will replace the description in the collapsed view if provided
              </div>
            </div>
            
            {/* Quotes */}
            <div className="mb-4">
              <label htmlFor="quotes" className="form-label">
                Quotes
              </label>
              <textarea
                id="quotes"
                name="quotes"
                value={formData.quotes}
                onChange={handleChange}
                className="form-textarea h-24"
                placeholder="Add relevant quotes here"
              />
              <div className="mt-1 text-xs text-gray-500">
                Quotes will show a 2-line preview in collapsed view and full content in expanded view
              </div>
            </div>
            
            {/* Requirements */}
            <div className="mb-4">
              <label htmlFor="requirements" className="form-label">
                Requirements
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                className="form-textarea h-24"
                placeholder="List the requirements this solution must fulfill (use bullet points with - at the start of each line)"
              />
              <div className="mt-1 text-xs text-gray-500">
                Format as a bulleted list using - at the start of each line
              </div>
            </div>
            
            {/* Technical Plan */}
            <div className="mb-4">
              <label htmlFor="technicalPlan" className="form-label">
                Technical Plan
              </label>
              <textarea
                id="technicalPlan"
                name="technicalPlan"
                value={formData.technicalPlan}
                onChange={handleChange}
                className="form-textarea h-24"
                placeholder="Detail the step-by-step implementation plan (use numbered list with 1., 2., etc.)"
              />
              <div className="mt-1 text-xs text-gray-500">
                Format as a numbered list using 1., 2., etc. at the start of each line
              </div>
            </div>
            
            {/* Priority, Status in a grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Priority */}
              <div>
                <label htmlFor="priority" className="form-label">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              {/* Status */}
              <div>
                <label htmlFor="status" className="form-label">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="brainstorm">Brainstorm</option>
                  <option value="proposed">Proposed</option>
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="on-hold">On Hold</option>
                  <option value="done">For Review</option>
                  <option value="reviewed">Done</option>
                </select>
              </div>
            </div>
            
            {/* Initiative */}
            <div className="mb-4">
              <label htmlFor="initiative" className="form-label">
                Initiative
              </label>
              <select
                id="initiative"
                name="initiative"
                value={formData.initiative}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">None</option>
                {initiatives.map(initiative => (
                  <option key={initiative.id} value={initiative.name}>
                    {initiative.name}
                  </option>
                ))}
              </select>
              <div className="mt-1 text-xs text-gray-500">
                Select the parent initiative this task belongs to (optional)
              </div>
            </div>
            
            {/* Tags */}
            <div className="mb-4">
              <label htmlFor="tags" className="form-label">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter tags separated by commas (e.g. frontend, bug, ui)"
              />
            </div>
            
            {/* Verification Steps */}
            <div className="mb-4">
              <label htmlFor="verificationSteps" className="form-label">
                Verification Steps
              </label>
              <textarea
                id="verificationSteps"
                name="verificationSteps"
                value={formData.verificationSteps}
                onChange={handleChange}
                className={`form-textarea h-24 ${errors.verificationSteps ? 'border-red-500' : ''}`}
                placeholder="List the steps to verify this task has been implemented correctly (one step per line)"
              />
              <div className="mt-1 text-xs text-gray-500">
                Always include verification steps - they're essential for ensuring the task can be properly tested
              </div>
              {errors.verificationSteps && (
                <p className="mt-1 text-sm text-red-500">{errors.verificationSteps}</p>
              )}
            </div>
            
            {/* Next Steps */}
            <div className="mb-4">
              <label htmlFor="nextSteps" className="form-label">
                Next Steps
              </label>
              <textarea
                id="nextSteps"
                name="nextSteps"
                value={formData.nextSteps}
                onChange={handleChange}
                className="form-textarea h-24"
                placeholder="Enter next steps after this task (one per line)"
              />
            </div>
          </div>
        )}
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e as React.FormEvent, true)}
            className="btn btn-outline-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save & Add Another'}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Task'}
          </button>
        </div>
      </form>
    </div>
  );
}