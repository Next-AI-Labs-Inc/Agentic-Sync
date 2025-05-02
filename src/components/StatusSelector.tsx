import React, { useState, useEffect, useRef } from 'react';
import { FaCog } from 'react-icons/fa';

interface StatusSelectorProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({ currentStatus, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // All available statuses
  const statuses = [
    { id: 'inbox', label: 'Inbox' },
    { id: 'brainstorm', label: 'Brainstorm' },
    { id: 'proposed', label: 'Proposed' },
    { id: 'backlog', label: 'Backlog' },
    { id: 'maybe', label: 'Maybe' },
    { id: 'todo', label: 'Todo' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'on-hold', label: 'On Hold' },
    { id: 'done', label: 'Done' },
    { id: 'reviewed', label: 'Reviewed' },
    { id: 'archived', label: 'Archive' }
  ];

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleStatusClick = (status: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusChange(status);
    setIsOpen(false);
  };

  return (
    <div>
      <button
        className="btn-outline-secondary"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        <FaCog className="mr-1" size={12} />
        Status
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={(e) => e.stopPropagation()}>
          <div ref={modalRef} className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Change Status</h3>
              <button 
                className="text-gray-500 hover:text-gray-700" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                &times;
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Select a new status for this task</p>
            
            <div className="grid grid-cols-1 gap-2">
              {statuses.map(status => (
                <button
                  key={status.id}
                  className={`text-left px-3 py-2 rounded text-sm hover:bg-gray-100 ${
                    currentStatus === status.id ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                  onClick={handleStatusClick(status.id)}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusSelector;