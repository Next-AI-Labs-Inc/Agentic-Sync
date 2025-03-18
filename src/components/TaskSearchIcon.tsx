import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTasks } from '@/contexts/TaskContext';

/**
 * Task search icon component that expands to a search input
 * Allows direct navigation to a task by ID or filtering tasks by any search term
 */
export default function TaskSearchIcon() {
  const [expanded, setExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { searchTerm, setSearchTerm } = useTasks();
  
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
        // Only collapse if there's no active search
        if (!searchTerm) {
          setExpanded(false);
        }
        setError(null);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchTerm]);
  
  // Update input value when searchTerm changes externally
  useEffect(() => {
    setInputValue(searchTerm);
    // Keep expanded if there is a search term
    if (searchTerm) {
      setExpanded(true);
    }
  }, [searchTerm]);
  
  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputValue.trim()) {
      setError('Please enter a search term');
      return;
    }
    
    // Reset error
    setError(null);
    
    const trimmedInput = inputValue.trim();
    
    // Check if input looks like a MongoDB ID (24 hex chars)
    const isMongoId = /^[0-9a-f]{24}$/i.test(trimmedInput);
    
    // If it looks like a MongoDB ID, navigate to task detail
    if (isMongoId) {
      router.push({
        pathname: '/task-detail',
        query: { id: trimmedInput }
      });
      
      // Reset search term and input
      setSearchTerm('');
      setInputValue('');
      setExpanded(false);
    } else {
      // Otherwise, set search term for filtering
      setSearchTerm(trimmedInput);
      // Keep expanded to show active search
    }
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    // If input is cleared, also clear the search term
    if (!e.target.value.trim()) {
      setSearchTerm('');
    }
  };
  
  // Clear search
  const handleClearSearch = () => {
    setInputValue('');
    setSearchTerm('');
    // Focus the input when cleared
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Determine if search is active
  const isSearchActive = searchTerm !== '';
  
  return (
    <div className="relative ml-2">
      {expanded ? (
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Search tasks or enter ID..."
            className={`w-52 py-1 px-2 pr-14 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${
              error ? 'border-red-300' : isSearchActive ? 'border-blue-400' : 'border-gray-300'
            }`}
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-8 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          <button
            type="submit"
            className={`absolute right-2 ${isSearchActive ? 'text-blue-500' : 'text-gray-500'} hover:text-primary-600`}
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
            <div className="absolute top-full left-0 mt-1 text-xs text-red-500 bg-white p-1 rounded border border-red-200 shadow-sm z-10">
              {error}
            </div>
          )}
        </form>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className={`p-1.5 rounded-full ${isSearchActive ? 'text-blue-500 bg-blue-50' : 'text-gray-500'} hover:text-primary-600 hover:bg-gray-100`}
          aria-label="Search tasks"
          title="Search tasks or navigate to task by ID"
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
      {/* Display active search indicator when collapsed but search is active */}
      {!expanded && isSearchActive && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white"></span>
      )}
    </div>
  );
}