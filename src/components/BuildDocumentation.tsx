/**
 * Build Documentation Component
 * 
 * Displays and manages build documentation for a task.
 * Supports Markdown and HTML formats.
 */

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/router';

interface BuildDocumentationItem {
  id: string;
  title: string;
  content: string;
  format: 'markdown' | 'html' | 'text';
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

interface BuildDocumentationProps {
  taskId: string;
  initialDocumentation?: BuildDocumentationItem[];
  readOnly?: boolean;
  className?: string;
}

export default function BuildDocumentation({
  taskId,
  initialDocumentation = [],
  readOnly = false,
  className = ''
}: BuildDocumentationProps) {
  const router = useRouter();
  
  // State
  const [documentation, setDocumentation] = useState<BuildDocumentationItem[]>(initialDocumentation);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Load documentation for the task
  useEffect(() => {
    if (initialDocumentation.length === 0) {
      fetchDocumentation();
    }
  }, [taskId]);
  
  // Fetch documentation from API
  const fetchDocumentation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/tasks/documentation?id=${taskId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch documentation: ${response.status}`);
      }
      
      const data = await response.json();
      setDocumentation(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching documentation:', err);
      setError('Failed to load documentation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add new documentation
  const handleAddDocumentation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDocContent.trim()) {
      setError('Documentation content is required');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/tasks/documentation?id=${taskId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newDocTitle || 'Build Documentation',
          content: newDocContent,
          format: 'markdown'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add documentation: ${response.status}`);
      }
      
      const newEntry = await response.json();
      
      // Update state
      setDocumentation(prev => [...prev, newEntry]);
      setNewDocTitle('');
      setNewDocContent('');
      setShowAddForm(false);
      
      // Expand the newly added documentation
      setExpandedIds(prev => [...prev, newEntry.id]);
    } catch (err) {
      console.error('Error adding documentation:', err);
      setError('Failed to add documentation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete documentation
  const handleDeleteDocumentation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this documentation?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/tasks/documentation?id=${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete documentation: ${response.status}`);
      }
      
      // Update state
      setDocumentation(prev => prev.filter(doc => doc.id !== id));
      
      // Remove from expanded IDs
      setExpandedIds(prev => prev.filter(expandedId => expandedId !== id));
    } catch (err) {
      console.error('Error deleting documentation:', err);
      setError('Failed to delete documentation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Toggle expand/collapse state for a documentation item
  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) 
        ? prev.filter(expandedId => expandedId !== id) 
        : [...prev, id]
    );
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (err) {
      return dateString;
    }
  };
  
  // Render documentation content based on format
  const renderContent = (doc: BuildDocumentationItem) => {
    switch (doc.format) {
      case 'markdown':
        return <ReactMarkdown>{doc.content}</ReactMarkdown>;
      case 'html':
        return <div dangerouslySetInnerHTML={{ __html: doc.content }} />;
      default:
        return <pre>{doc.content}</pre>;
    }
  };
  
  // If still loading initial data, show loading state
  if (isLoading && documentation.length === 0) {
    return (
      <div className={`rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-24 bg-gray-100 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Build Documentation</h3>
        {!readOnly && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500"
          >
            {showAddForm ? 'Cancel' : 'Add Documentation'}
          </button>
        )}
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {showAddForm && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleAddDocumentation}>
            <div className="mb-4">
              <label htmlFor="doc-title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="doc-title"
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="Build Documentation"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="doc-content" className="block text-sm font-medium text-gray-700">
                Content (Markdown supported)
              </label>
              <textarea
                id="doc-content"
                value={newDocContent}
                onChange={(e) => setNewDocContent(e.target.value)}
                rows={8}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                placeholder="# Documentation\n\nEnter your build documentation here..."
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isLoading ? 'Saving...' : 'Save Documentation'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="divide-y divide-gray-200">
        {documentation.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No build documentation available for this task.
          </div>
        ) : (
          documentation.map((doc) => (
            <div key={doc.id} className="p-4">
              <div 
                className="flex justify-between items-start cursor-pointer"
                onClick={() => toggleExpand(doc.id)}
              >
                <div>
                  <h4 className="text-md font-medium text-gray-900">{doc.title}</h4>
                  <p className="text-xs text-gray-500">
                    Created: {formatDate(doc.createdAt)}
                    {doc.updatedAt && ` • Updated: ${formatDate(doc.updatedAt)}`}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(doc.id);
                    }}
                  >
                    {expandedIds.includes(doc.id) ? (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  
                  {!readOnly && (
                    <button
                      className="text-red-400 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocumentation(doc.id);
                      }}
                    >
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {expandedIds.includes(doc.id) && (
                <div className="mt-4 bg-gray-50 p-4 rounded prose prose-sm max-w-none">
                  {renderContent(doc)}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}