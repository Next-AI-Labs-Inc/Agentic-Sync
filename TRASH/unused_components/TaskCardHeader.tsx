import React, { useState } from 'react';
import { FaCopy, FaLink, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import TaskStatusBadge from './TaskStatusBadge';
import PopoverComponent from './PopoverComponent';

export interface TaskCardHeaderProps {
  task: {
    id: string;
    title: string;
    status: 'inbox' | 'brainstorm' | 'proposed' | 'backlog' | 'maybe' | 'todo' | 'in-progress' | 'on-hold' | 'for-review' | 'done' | 'reviewed' | 'archived';
    priority: 'high' | 'medium' | 'low';
  };
  isExpanded: boolean;
  onToggleExpand: () => void;
  onTitleEdit?: (taskId: string, newTitle: string) => Promise<void>;
  hideExpand?: boolean;
}

/**
 * Header section of the TaskCard component
 * Contains title, status badge, and expand/collapse controls
 */
function TaskCardHeader({
  task,
  isExpanded,
  onToggleExpand,
  onTitleEdit,
  hideExpand = false
}: TaskCardHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleValue, setTitleValue] = useState(task.title);
  const [isCopied, setIsCopied] = useState({ id: false, url: false });

  // Priority indicator styling based on priority level
  const getPriorityIndicator = () => {
    switch (task.priority) {
      case 'high':
        return <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" title="High Priority"></div>;
      case 'medium':
        return <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500" title="Medium Priority"></div>;
      case 'low':
        return <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" title="Low Priority"></div>;
      default:
        return null;
    }
  };

  // Copy task ID to clipboard
  const copyTaskId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.id) return;
    
    navigator.clipboard.writeText(task.id);
    setIsCopied({ ...isCopied, id: true });
    setTimeout(() => {
      setIsCopied(prev => ({ ...prev, id: false }));
    }, 1500);
  };

  // Copy task URL to clipboard
  const copyTaskUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task?.id) return;
    
    const url = `${window.location.origin}/task-detail?id=${task.id}`;
    navigator.clipboard.writeText(url);
    setIsCopied({ ...isCopied, url: true });
    setTimeout(() => {
      setIsCopied(prev => ({ ...prev, url: false }));
    }, 1500);
  };

  // Handle title edit
  const handleTitleEdit = () => {
    if (!onTitleEdit) return;
    setIsEditing(true);
  };

  // Save edited title
  const handleTitleSave = async () => {
    if (!onTitleEdit) return;
    
    if (titleValue.trim() !== task.title) {
      await onTitleEdit(task.id, titleValue);
    }
    
    setIsEditing(false);
  };

  // Cancel title editing
  const handleTitleCancel = () => {
    setTitleValue(task.title);
    setIsEditing(false);
  };

  return (
    <div className="task-card-header relative px-4 pt-3 pb-2 flex items-start">
      {/* Priority indicator stripe */}
      {getPriorityIndicator()}
      
      <div className="flex-grow mr-3">
        {isEditing ? (
          // Title editing mode
          <div className="mb-1 title-edit-container" onClick={e => e.stopPropagation()}>
            <input
              type="text"
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              className="w-full p-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={e => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') handleTitleCancel();
              }}
              autoFocus
            />
            <div className="flex mt-1 gap-2">
              <button
                onClick={handleTitleSave}
                className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={handleTitleCancel}
                className="text-xs px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          // Title display mode
          <h3 
            className="text-base font-medium leading-tight mb-1 group"
            onDoubleClick={handleTitleEdit}
          >
            {task.title}
            {onTitleEdit && (
              <button
                className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={e => {
                  e.stopPropagation();
                  handleTitleEdit();
                }}
                title="Edit title"
              >
                ✏️
              </button>
            )}
          </h3>
        )}
        
        <div className="flex items-center text-xs text-gray-500 space-x-2">
          {/* Task ID with copy button */}
          <div className="task-id flex items-center">
            <span className="font-mono">
              {task?.id ? `${task.id.substring(0, 8)}...` : 'ID unavailable'}
            </span>
            <PopoverComponent
              content={isCopied.id ? "Copied!" : "Copy ID"}
              position="top"
            >
              <button
                onClick={copyTaskId}
                className="ml-1 text-gray-400 hover:text-gray-600"
                aria-label="Copy task ID"
                disabled={!task?.id}
              >
                <FaCopy size={12} />
              </button>
            </PopoverComponent>
          </div>
          
          {/* Task URL copy button */}
          <PopoverComponent
            content={isCopied.url ? "Copied!" : "Copy URL"}
            position="top"
          >
            <button
              onClick={copyTaskUrl}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Copy task URL"
              disabled={!task?.id}
            >
              <FaLink size={12} />
            </button>
          </PopoverComponent>
          
          {/* Status badge */}
          <TaskStatusBadge status={task.status} />
        </div>
      </div>
      
      {/* Expand/collapse button */}
      {!hideExpand && (
        <button
          onClick={e => {
            e.stopPropagation();
            onToggleExpand();
          }}
          className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label={isExpanded ? "Collapse task" : "Expand task"}
        >
          {isExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
        </button>
      )}
    </div>
  );
}

export default TaskCardHeader;