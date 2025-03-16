import React, { useState, useEffect } from 'react';
import { Project, TaskFormData, Initiative } from '@/types';
import { useInitiatives } from '@/contexts/InitiativeContext';

interface TaskFormProps {
  projects: Project[];
  onSubmit: (taskData: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

// Key for storing the last used project in localStorage
const LAST_PROJECT_KEY = 'taskForm_lastProject';

export default function TaskForm({ projects, onSubmit, onCancel }: TaskFormProps) {
  // Load initiatives for dropdown
  const { initiatives, loading: initiativesLoading } = useInitiatives();
  
  // Get the last used project from localStorage or default to first project
  const getInitialProject = () => {
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
  }>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation errors as user types
    if (name === 'title' || name === 'project') {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Save the last used project
  useEffect(() => {
    if (formData.project && typeof window !== 'undefined') {
      localStorage.setItem(LAST_PROJECT_KEY, formData.project);
    }
  }, [formData.project]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: {
      title?: string;
      project?: string;
    } = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    // Only require project if it's not 'none'
    if (!formData.project && formData.project !== 'none') {
      newErrors.project = 'Project is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Save project preference immediately
    if (typeof window !== 'undefined' && formData.project) {
      localStorage.setItem(LAST_PROJECT_KEY, formData.project);
    }
    
    // Instantly close the form and show the task being created
    // Save the form data for background submission
    const taskDataToSubmit = { ...formData };
    
    // Reset form and close it immediately without waiting for API response
    const currentProject = formData.project;
    setFormData({
      title: '',
      description: '',
      userImpact: '',
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
    
    // Close the form immediately
    onCancel();
    
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
  
  // Sort projects alphabetically
  const sortedProjects = [...projects].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-4">
          <label htmlFor="title" className="form-label">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`form-input ${errors.title ? 'border-red-500' : ''}`}
            placeholder="Enter task title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>
        
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
        
        {/* Priority, Status, and Project */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              <option value="proposed">Proposed</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>
          
          {/* Project */}
          <div>
            <label htmlFor="project" className="form-label">
              Project
            </label>
            <select
              id="project"
              name="project"
              value={formData.project}
              onChange={handleChange}
              className={`form-select ${errors.project ? 'border-red-500' : ''}`}
            >
              <option value="none">None</option>
              {sortedProjects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.project && (
              <p className="mt-1 text-sm text-red-500">{errors.project}</p>
            )}
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
            className="form-textarea h-24"
            placeholder="Enter steps to verify the task (one per line)"
          />
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