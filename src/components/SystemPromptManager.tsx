import React, { useState, useEffect } from 'react';
import { SystemPrompt } from '@/types';
import * as taskApiService from '@/services/taskApiService';

interface SystemPromptManagerProps {
  onSave?: (prompt: SystemPrompt) => void;
  onCancel?: () => void;
  defaultType?: 'implementation' | 'demo' | 'feedback';
}

/**
 * Component for managing system prompts (create, edit, delete) for the agent
 */
export default function SystemPromptManager({ 
  onSave, 
  onCancel,
  defaultType = 'implementation'
}: SystemPromptManagerProps) {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState<Partial<SystemPrompt>>({
    name: '',
    content: '',
    type: defaultType
  });

  // Fetch all system prompts on component mount
  useEffect(() => {
    setLoading(true);
    
    taskApiService.getSystemPrompts()
      .then(data => {
        setPrompts(data);
        
        // Select default prompt of the specified type if available
        const defaultPrompt = data.find((p: SystemPrompt) => p.type === defaultType && p.isDefault);
        if (defaultPrompt) {
          setSelectedPromptId(defaultPrompt.id);
        }
      })
      .catch(err => {
        console.error('Error fetching system prompts:', err);
        setError('Failed to load system prompts. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [defaultType]);

  // Handle prompt selection
  const handleSelectPrompt = (id: string) => {
    setSelectedPromptId(id);
    setIsEditing(false);
    setIsCreating(false);
  };

  // Handle creating a new prompt
  const handleCreateNew = () => {
    setIsCreating(true);
    setIsEditing(false);
    setSelectedPromptId(null);
    setEditedPrompt({
      name: '',
      content: '',
      type: defaultType
    });
  };

  // Handle editing an existing prompt
  const handleEdit = () => {
    if (!selectedPromptId) return;
    
    const promptToEdit = prompts.find(p => p.id === selectedPromptId);
    if (!promptToEdit) return;
    
    setEditedPrompt({
      name: promptToEdit.name,
      content: promptToEdit.content,
      type: promptToEdit.type as 'implementation' | 'demo' | 'feedback' | 'custom'
    });
    
    setIsEditing(true);
    setIsCreating(false);
  };

  // Handle deleting a prompt
  const handleDelete = async () => {
    if (!selectedPromptId) return;
    
    const promptToDelete = prompts.find(p => p.id === selectedPromptId);
    if (!promptToDelete) return;
    
    // Prevent deleting default prompts
    if (promptToDelete.isDefault) {
      setError('Cannot delete default system prompts');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete "${promptToDelete.name}"?`)) {
      try {
        await taskApiService.deleteSystemPrompt(selectedPromptId);
        
        // Update prompts list
        setPrompts(prompts.filter(p => p.id !== selectedPromptId));
        
        // Reset selection
        setSelectedPromptId(null);
        setIsEditing(false);
        setIsCreating(false);
        
      } catch (err: any) {
        console.error('Error deleting system prompt:', err);
        setError(err.message || 'Failed to delete system prompt');
      }
    }
  };

  // Handle saving a prompt (create or update)
  const handleSave = async () => {
    try {
      // Validate prompt data
      if (!editedPrompt.name?.trim()) {
        setError('Prompt name is required');
        return;
      }
      
      if (!editedPrompt.content?.trim()) {
        setError('Prompt content is required');
        return;
      }
      
      if (!editedPrompt.type) {
        setError('Prompt type is required');
        return;
      }
      
      let savedPrompt: SystemPrompt;
      
      if (isCreating) {
        // Create new prompt
        savedPrompt = await taskApiService.createSystemPrompt({
          name: editedPrompt.name,
          content: editedPrompt.content,
          type: editedPrompt.type
        });
        
        // Update prompts list
        setPrompts([...prompts, savedPrompt]);
        
      } else if (isEditing && selectedPromptId) {
        // Update existing prompt
        savedPrompt = await taskApiService.updateSystemPrompt(selectedPromptId, {
          name: editedPrompt.name,
          content: editedPrompt.content,
          type: editedPrompt.type
        });
        
        // Update prompts list
        setPrompts(prompts.map(p => p.id === selectedPromptId ? savedPrompt : p));
      } else {
        throw new Error('Invalid state');
      }
      
      // Reset state
      setIsEditing(false);
      setIsCreating(false);
      setSelectedPromptId(savedPrompt.id);
      setError(null);
      
      // Call onSave callback if provided
      if (onSave) {
        onSave(savedPrompt);
      }
      
    } catch (err: any) {
      console.error('Error saving system prompt:', err);
      setError(err.message || 'Failed to save system prompt');
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedPrompt({
      ...editedPrompt,
      [name]: value
    });
  };

  return (
    <div className="system-prompt-manager bg-white shadow-md rounded-lg p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">System Prompts</h2>
      
      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
          <button 
            className="ml-2 text-red-700 hover:text-red-900"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          <div className="h-48 bg-gray-100 rounded"></div>
        </div>
      )}
      
      {/* Prompts list */}
      {!loading && !isEditing && !isCreating && (
        <>
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-medium">Available Prompts</h3>
            <button
              onClick={handleCreateNew}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create New
            </button>
          </div>
          
          {prompts.length === 0 ? (
            <p className="text-gray-500">No system prompts found. Create one to get started.</p>
          ) : (
            <div className="space-y-2 mb-4">
              {prompts.map(prompt => (
                <div 
                  key={prompt.id}
                  className={`p-3 rounded border ${
                    selectedPromptId === prompt.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-300'
                  } cursor-pointer`}
                  onClick={() => handleSelectPrompt(prompt.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{prompt.name}</h4>
                      <p className="text-sm text-gray-600">
                        Type: {prompt.type.charAt(0).toUpperCase() + prompt.type.slice(1)}
                        {prompt.isDefault && ' (Default)'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      Last updated: {new Date(prompt.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Selected prompt actions */}
          {selectedPromptId && (
            <div className="mt-4">
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                  disabled={prompts.find(p => p.id === selectedPromptId)?.isDefault}
                >
                  Delete
                </button>
                {onSave && (
                  <button
                    onClick={() => onSave(prompts.find(p => p.id === selectedPromptId)!)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Use This Prompt
                  </button>
                )}
              </div>
              
              {/* Selected prompt details */}
              <div className="border border-gray-300 rounded p-4">
                <h3 className="font-semibold text-lg mb-2">
                  {prompts.find(p => p.id === selectedPromptId)?.name}
                </h3>
                <div className="bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-wrap">
                  {prompts.find(p => p.id === selectedPromptId)?.content}
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Edit/Create form */}
      {(isEditing || isCreating) && (
        <div className="prompt-form">
          <h3 className="text-lg font-medium mb-3">
            {isCreating ? 'Create New Prompt' : 'Edit Prompt'}
          </h3>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={editedPrompt.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter prompt name"
            />
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              name="type"
              value={editedPrompt.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="implementation">Implementation</option>
              <option value="demo">Demonstration</option>
              <option value="feedback">Feedback</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              name="content"
              value={editedPrompt.content}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={10}
              placeholder="Enter system prompt content"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setIsCreating(false);
                setError(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save
            </button>
          </div>
        </div>
      )}
      
      {/* Bottom actions */}
      {!isEditing && !isCreating && onCancel && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}