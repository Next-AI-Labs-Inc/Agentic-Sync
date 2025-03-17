import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Task search icon component that expands to a search input
 * Allows direct navigation to a task by ID
 */
export default function TaskSearchIcon() {
  const [expanded, setExpanded] = useState(false);
  const [taskId, setTaskId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Focus the input when expanded
  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);
  
  // Handle outside clicks to collapse the search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setExpanded(false);
        setError(null);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!taskId.trim()) {
      setError('Please enter a task ID');
      return;
    }
    
    // Reset error
    setError(null);
    
    // Navigate to the task detail page with the ID as a query parameter
    const trimmedId = taskId.trim();
    router.push({
      pathname: '/task-detail',
      query: { id: trimmedId }
    });
    
    // Reset the search
    setTaskId('');
    setExpanded(false);
  };
  
  return (
    <div className="relative ml-2">
      {expanded ? (
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            placeholder="Enter task ID..."
            className={`w-48 py-1 px-2 pr-8 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          <button
            type="submit"
            className="absolute right-2 text-gray-500 hover:text-primary-600"
            aria-label="Search task"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          {error && (
            <div className="absolute top-full left-0 mt-1 text-xs text-red-500 bg-white p-1 rounded border border-red-200 shadow-sm">
              {error}
            </div>
          )}
        </form>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="p-1.5 rounded-full text-gray-500 hover:text-primary-600 hover:bg-gray-100"
          aria-label="Search task by ID"
          title="Search task by ID"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}