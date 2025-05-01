import React, { useState } from 'react';
import { FeedbackFormData } from '@/types';

interface FeedbackFormProps {
  taskId: string;
  onSubmit: (feedback: FeedbackFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Form component for submitting feedback on a task
 */
export default function FeedbackForm({ taskId, onSubmit, onCancel, isSubmitting = false }: FeedbackFormProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!content.trim()) {
      setError('Feedback content is required');
      return;
    }
    
    try {
      // Clear error
      setError(null);
      
      // Submit feedback
      await onSubmit({ content });
      
      // Clear form on success
      setContent('');
      
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setError(err.message || 'Failed to submit feedback. Please try again.');
    }
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Provide Feedback</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Display error message if there is one */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {/* Feedback content textarea */}
        <div className="mb-4">
          <label 
            htmlFor="feedback-content" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Feedback
          </label>
          <textarea
            id="feedback-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your feedback on this task..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows={6}
            disabled={isSubmitting}
          />
          <p className="mt-1 text-sm text-gray-500">
            Provide clear and specific feedback for the agent to address.
          </p>
        </div>
        
        {/* Form actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
}