/**
 * Create Model Form
 * 
 * Form for creating a new data model by duplicating an existing one
 * and customizing its basic properties.
 */

import React, { useState } from 'react';
import { useConfig } from '@/contexts/ConfigContext';

interface CreateModelFormProps {
  onSuccess?: (slug: string) => void;
  onCancel?: () => void;
}

export default function CreateModelForm({ onSuccess, onCancel }: CreateModelFormProps) {
  const { availableModels, createModelFromTemplate } = useConfig();
  
  // Form state
  const [sourceSlug, setSourceSlug] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Handle source selection and auto-generate new slug
  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSourceSlug(selected);
    
    // Auto-suggest a unique slug if none is set yet
    if (!newSlug) {
      const baseSlug = selected + '-new';
      // Check if this slug already exists
      const isUnique = !availableModels.some(model => model.slug === baseSlug);
      setNewSlug(isUnique ? baseSlug : baseSlug + '-' + Date.now().toString().slice(-4));
    }
    
    // Auto-suggest a display name if none is set yet
    if (!displayName) {
      const sourceModel = availableModels.find(model => model.slug === selected);
      if (sourceModel) {
        setDisplayName(sourceModel.displayName + ' (Copy)');
      }
    }
  };
  
  // Handle slug change and ensure it's URL friendly
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Make the slug URL-friendly (lowercase, no spaces, etc.)
    const rawValue = e.target.value;
    const urlFriendly = rawValue
      .toLowerCase()
      .replace(/\s+/g, '-')  // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '')  // Remove non-alphanumeric characters except hyphens
      .replace(/-+/g, '-');  // Replace multiple hyphens with a single one
    
    setNewSlug(urlFriendly);
    
    // If display name is empty, suggest one based on the slug
    if (!displayName) {
      // Convert kebab-case to Title Case
      const suggestedName = urlFriendly
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      if (suggestedName) {
        setDisplayName(suggestedName);
      }
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!sourceSlug) {
      setError('Please select a template');
      return;
    }
    
    if (!newSlug) {
      setError('Please enter a slug for the new model');
      return;
    }
    
    if (!displayName) {
      setError('Please enter a display name for the new model');
      return;
    }
    
    // Check for duplicate slugs
    if (availableModels.some(model => model.slug === newSlug)) {
      setError(`A model with the slug "${newSlug}" already exists`);
      return;
    }
    
    // Create the new model
    setIsCreating(true);
    setError('');
    
    try {
      const newModel = createModelFromTemplate(sourceSlug, newSlug, displayName);
      
      if (newModel) {
        // Call success callback
        if (onSuccess) {
          onSuccess(newSlug);
        }
      } else {
        setError('Failed to create new model');
      }
    } catch (err) {
      console.error('Error creating model:', err);
      setError(`Failed to create model: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Create New Data Model
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Create a new data model by duplicating an existing template and customizing its properties.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="source-template" className="block text-sm font-medium text-gray-700">
                Template Model
              </label>
              <select
                id="source-template"
                value={sourceSlug}
                onChange={handleSourceChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a template...</option>
                {availableModels.map(model => (
                  <option key={model.slug} value={model.slug}>
                    {model.displayName}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                The existing data model to use as a starting point
              </p>
            </div>
            
            <div>
              <label htmlFor="new-slug" className="block text-sm font-medium text-gray-700">
                New Model Slug
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  /
                </span>
                <input
                  type="text"
                  id="new-slug"
                  value={newSlug}
                  onChange={handleSlugChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-r-md border-gray-300 p-2"
                  placeholder="my-new-model"
                  required
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                The URL-friendly identifier for the new model (lowercase, no spaces)
              </p>
            </div>
            
            <div>
              <label htmlFor="display-name" className="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <input
                type="text"
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="My New Model"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                The human-readable name for the new model
              </p>
            </div>
            
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-5 flex justify-end">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isCreating || !sourceSlug || !newSlug || !displayName}
              className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                isCreating || !sourceSlug || !newSlug || !displayName
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isCreating ? 'Creating...' : 'Create Model'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}