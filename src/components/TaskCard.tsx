import React, { useState, useRef, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  FaCheckCircle,
  FaRegCircle,
  FaTrash,
  FaCheck,
  FaArrowRight,
  FaArrowLeft,
  FaEye,
  FaInfoCircle
} from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onStatusChange: (
    taskId: string,
    project: string,
    status: 'proposed' | 'todo' | 'in-progress' | 'done' | 'reviewed'
  ) => Promise<void>;
  onMarkTested: (taskId: string, project: string) => Promise<void>;
  onDelete: (taskId: string, project: string) => Promise<void>;
  onUpdateDate?: (taskId: string, project: string, newDate: string) => Promise<void>;
}

// Reusable Popover Component
interface PopoverProps {
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  children: React.ReactNode;
  className?: string;
}

function Popover({ content, position = 'top', children, className = '' }: PopoverProps) {
  const [isVisible, setIsVisible] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showPopover = () => setIsVisible(true);
  const hidePopover = () => setIsVisible(false);

  // Calculate and adjust popover position to prevent cutoff
  useEffect(() => {
    if (isVisible && popoverRef.current && triggerRef.current) {
      const popover = popoverRef.current;
      const trigger = triggerRef.current;
      const container = containerRef.current;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Get element dimensions and positions
      const popoverRect = popover.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();

      // Default positions
      let style: Record<string, any> = {};
      let arrowStyle: Record<string, any> = {};

      // Adjust based on position
      switch (position) {
        case 'top':
          style = {
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-8px)'
          };
          arrowStyle = {
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)'
          };

          // Check if popover would be cut off at the top
          if (triggerRect.top < popoverRect.height + 8) {
            // Switch to bottom position
            style = {
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%) translateY(8px)'
            };
            arrowStyle = {
              top: '-6px',
              left: '50%',
              transform: 'translateX(-50%)'
            };
          }

          // Check for horizontal cutoff
          if (triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2 < 0) {
            // Adjust for left edge
            style.left = '0';
            style.transform = 'translateY(-8px)';
            arrowStyle.left = triggerRect.left + triggerRect.width / 2 + 'px';
          } else if (
            triggerRect.left + triggerRect.width / 2 + popoverRect.width / 2 >
            viewportWidth
          ) {
            // Adjust for right edge
            style.left = 'auto';
            style.right = '0';
            style.transform = 'translateY(-8px)';
            arrowStyle.left =
              popoverRect.width - (viewportWidth - triggerRect.left - triggerRect.width / 2) + 'px';
          }
          break;

        case 'right':
          style = {
            top: '50%',
            left: '100%',
            transform: 'translateY(-50%) translateX(8px)'
          };
          arrowStyle = {
            left: '-6px',
            top: '50%',
            transform: 'translateY(-50%)'
          };

          // Check if popover would be cut off on the right
          if (triggerRect.right + popoverRect.width + 8 > viewportWidth) {
            // Switch to left position
            style = {
              top: '50%',
              right: '100%',
              left: 'auto',
              transform: 'translateY(-50%) translateX(-8px)'
            };
            arrowStyle = {
              right: '-6px',
              left: 'auto',
              top: '50%',
              transform: 'translateY(-50%)'
            };
          }

          // Check for vertical cutoff
          if (triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2 < 0) {
            // Adjust for top edge
            style.top = '0';
            style.transform = style.left === '100%' ? 'translateX(8px)' : 'translateX(-8px)';
            arrowStyle.top = triggerRect.top + triggerRect.height / 2 + 'px';
          } else if (
            triggerRect.top + triggerRect.height / 2 + popoverRect.height / 2 >
            viewportHeight
          ) {
            // Adjust for bottom edge
            style.top = 'auto';
            style.bottom = '0';
            style.transform = style.left === '100%' ? 'translateX(8px)' : 'translateX(-8px)';
            arrowStyle.top =
              popoverRect.height -
              (viewportHeight - triggerRect.top - triggerRect.height / 2) +
              'px';
          }
          break;

        case 'bottom':
          style = {
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(8px)'
          };
          arrowStyle = {
            top: '-6px',
            left: '50%',
            transform: 'translateX(-50%)'
          };

          // Check if popover would be cut off at the bottom
          if (triggerRect.bottom + popoverRect.height + 8 > viewportHeight) {
            // Switch to top position
            style = {
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%) translateY(-8px)'
            };
            arrowStyle = {
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)'
            };
          }

          // Check for horizontal cutoff - same as 'top' case
          if (triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2 < 0) {
            style.left = '0';
            style.transform = 'translateY(8px)';
            arrowStyle.left = triggerRect.left + triggerRect.width / 2 + 'px';
          } else if (
            triggerRect.left + triggerRect.width / 2 + popoverRect.width / 2 >
            viewportWidth
          ) {
            style.left = 'auto';
            style.right = '0';
            style.transform = 'translateY(8px)';
            arrowStyle.left =
              popoverRect.width - (viewportWidth - triggerRect.left - triggerRect.width / 2) + 'px';
          }
          break;

        case 'left':
          style = {
            top: '50%',
            right: '100%',
            transform: 'translateY(-50%) translateX(-8px)'
          };
          arrowStyle = {
            right: '-6px',
            top: '50%',
            transform: 'translateY(-50%)'
          };

          // Check if popover would be cut off on the left
          if (triggerRect.left - popoverRect.width - 8 < 0) {
            // Switch to right position
            style = {
              top: '50%',
              left: '100%',
              right: 'auto',
              transform: 'translateY(-50%) translateX(8px)'
            };
            arrowStyle = {
              left: '-6px',
              right: 'auto',
              top: '50%',
              transform: 'translateY(-50%)'
            };
          }

          // Check for vertical cutoff - same as 'right' case
          if (triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2 < 0) {
            style.top = '0';
            style.transform = style.right === '100%' ? 'translateX(-8px)' : 'translateX(8px)';
            arrowStyle.top = triggerRect.top + triggerRect.height / 2 + 'px';
          } else if (
            triggerRect.top + triggerRect.height / 2 + popoverRect.height / 2 >
            viewportHeight
          ) {
            style.top = 'auto';
            style.bottom = '0';
            style.transform = style.right === '100%' ? 'translateX(-8px)' : 'translateX(8px)';
            arrowStyle.top =
              popoverRect.height -
              (viewportHeight - triggerRect.top - triggerRect.height / 2) +
              'px';
          }
          break;
      }

      // Apply the calculated styles
      Object.assign(popover.style, style);

      const arrowElement = popover.querySelector('.popover-arrow');
      if (arrowElement) {
        Object.assign((arrowElement as HTMLElement).style, arrowStyle);
      }
    }
  }, [isVisible, position]);

  return (
    <div
      className={`popover-trigger ${className}`}
      ref={triggerRef}
      onMouseEnter={showPopover}
      onMouseLeave={hidePopover}
    >
      {children}
      <div
        ref={popoverRef}
        className={`popover ${isVisible ? 'show' : ''}`}
        style={{ zIndex: 1000 }} // Ensure popover is always on top of all other elements
      >
        <div className="popover-arrow"></div>
        <div ref={containerRef}>{content}</div>
      </div>
    </div>
  );
}

export default function TaskCard({ task, onStatusChange, onMarkTested, onDelete, onUpdateDate }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isNew, setIsNew] = useState(task._isNew || false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [newDateValue, setNewDateValue] = useState('');
  
  // Initialize date value once when editing starts
  useEffect(() => {
    if (isEditingDate) {
      setNewDateValue(task.createdAt || new Date().toISOString());
    }
  }, [isEditingDate, task.createdAt]);
  
  // Clear the new flag after animation completes
  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => {
        setIsNew(false);
      }, 1000); // Matches animation duration
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  // Format date strings - always use relative time
  const formatTimeAgo = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Format project name for display
  const formatProjectName = (projectId: string) => {
    if (!projectId) return 'Unknown';

    return projectId.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  };
  
  // Handle date edit
  const handleDateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card expansion
    console.log('Date clicked!');
    if (onUpdateDate) {
      setIsEditingDate(true);
    }
  };
  
  // Submit date change
  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card expansion
    if (onUpdateDate) {
      onUpdateDate(task.id, task.project, newDateValue);
      setIsEditingDate(false);
    }
  };

  // Handle card click for expansion
  const handleCardClick = (e: React.MouseEvent) => {
    // Only prevent default if it's a button or form element
    if (e.target instanceof HTMLButtonElement || 
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLFormElement) {
      return; // Let buttons and form inputs handle their own clicks
    }
    setExpanded(!expanded);
  };

  // Status change handlers with transition effects
  const handleStatusChange =
    (newStatus: 'proposed' | 'todo' | 'in-progress' | 'done' | 'reviewed') =>
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card expansion
      
      // Apply a subtle flash effect to indicate the change
      const element = e.currentTarget.closest('.task-card');
      if (element) {
        element.classList.add('status-change-flash');
        setTimeout(() => {
          element.classList.remove('status-change-flash');
        }, 500);
      }
      
      // Trigger the status change immediately
      onStatusChange(task.id, task.project, newStatus);
    };

  // Quick action handlers
  const handleMarkTested = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion
    
    // Apply a subtle flash effect to indicate testing
    const element = e.currentTarget.closest('.task-card');
    if (element) {
      element.classList.add('status-change-flash');
      setTimeout(() => {
        element.classList.remove('status-change-flash');
      }, 500);
    }
    
    onMarkTested(task.id, task.project);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion
    setIsDeleting(true); // Start the delete animation
    
    // Wait for animation to start before actually deleting
    setTimeout(() => {
      onDelete(task.id, task.project);
    }, 100);
  };

  // Get appropriate status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed':
        return 'bg-purple-100 text-purple-800';
      case 'todo':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'reviewed':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Determine stage-appropriate actions
  const renderStageActions = () => {
    const actions = [];

    // Move to next stage button with popover
    if (task.status === 'proposed') {
      actions.push(
        <Popover
          key="move-to-todo-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">Move to Todo</h4>
              <p className="text-xs text-gray-600">
                Move this task from the proposal stage to the todo list. This indicates the task has
                been accepted and is ready to be worked on.
              </p>
            </div>
          }
          position="top"
        >
          <button
            key="move-to-todo"
            onClick={handleStatusChange('todo')}
            className="btn-outline-primary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Move to Todo
          </button>
        </Popover>
      );
    } else if (task.status === 'todo') {
      actions.push(
        <Popover
          key="move-to-in-progress-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">Start Progress</h4>
              <p className="text-xs text-gray-600">
                Move this task to the in-progress stage. This indicates that work on the task has
                begun and is currently active.
              </p>
            </div>
          }
          position="top"
        >
          <button
            key="move-to-in-progress"
            onClick={handleStatusChange('in-progress')}
            className="btn-outline-primary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Start Progress
          </button>
        </Popover>
      );
    } else if (task.status === 'in-progress') {
      actions.push(
        <Popover
          key="move-to-done-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">Mark Done</h4>
              <p className="text-xs text-gray-600">
                Move this task to the done stage. This indicates that all work on the task has been
                completed and it's ready for review.
              </p>
            </div>
          }
          position="top"
        >
          <button
            key="move-to-done"
            onClick={handleStatusChange('done')}
            className="btn-outline-primary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Mark Done
          </button>
        </Popover>
      );
    } else if (task.status === 'done') {
      actions.push(
        <Popover
          key="move-to-reviewed-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">Mark Reviewed</h4>
              <p className="text-xs text-gray-600">
                Mark this task as reviewed. This indicates that the completed work has been checked
                and approved by a reviewer.
              </p>
            </div>
          }
          position="top"
        >
          <button
            key="move-to-reviewed"
            onClick={handleStatusChange('reviewed')}
            className="btn-outline-primary"
          >
            <FaCheck className="mr-1" size={12} />
            Mark Reviewed
          </button>
        </Popover>
      );

      // Move back to in-progress
      actions.push(
        <Popover
          key="move-to-in-progress-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">Still Working</h4>
              <p className="text-xs text-gray-600">
                Move this task back to the in-progress stage. Use this if the task was marked as
                done prematurely or if additional work is needed.
              </p>
            </div>
          }
          position="top"
        >
          <button
            key="move-to-in-progress"
            onClick={handleStatusChange('in-progress')}
            className="btn-outline-secondary"
          >
            <FaArrowLeft className="mr-1" size={12} />
            Still Working
          </button>
        </Popover>
      );
    } else if (task.status === 'reviewed') {
      // Add ability to reopen a reviewed task
      actions.push(
        <Popover
          key="move-to-done-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">Reopen Task</h4>
              <p className="text-xs text-gray-600">
                Move this task back to the done stage. Use this if the task needs additional review
                or adjustments.
              </p>
            </div>
          }
          position="top"
        >
          <button
            key="move-to-done"
            onClick={handleStatusChange('done')}
            className="btn-outline-secondary"
          >
            <FaArrowLeft className="mr-1" size={12} />
            Reopen Task
          </button>
        </Popover>
      );
    }

    // Mark tested button for tasks that aren't done or reviewed
    if (task.status !== 'done' && task.status !== 'reviewed') {
      actions.push(
        <Popover
          key="mark-tested-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">Mark Tested</h4>
              <p className="text-xs text-gray-600">
                Mark this task as tested and complete in a single step. This indicates that the task
                has been completed, tested, and is ready for review.
              </p>
            </div>
          }
          position="top"
        >
          <button key="mark-tested" onClick={handleMarkTested} className="btn-outline-success">
            <FaCheck className="mr-1" size={12} />
            Mark Tested
          </button>
        </Popover>
      );
    }

    // Always show delete button
    actions.push(
      <Popover
        key="delete-popover"
        content={
          <div className="w-64">
            <h4 className="font-medium text-gray-900 mb-1">Delete Task</h4>
            <p className="text-xs text-gray-600">
              Permanently delete this task. This action cannot be undone. Use with caution.
            </p>
          </div>
        }
        position="top"
      >
        <button key="delete" onClick={handleDelete} className="btn-outline-danger">
          <FaTrash className="mr-1" size={12} />
          Delete
        </button>
      </Popover>
    );

    return <div className="mt-3 flex flex-wrap gap-2 justify-end">{actions}</div>;
  };

  return (
    <div
      className={`task-card ${
        task.status === 'reviewed' ? 'bg-gray-50' : 'bg-white'
      } ${isNew ? 'animate-fade-in border-l-4 border-l-blue-500' : ''} 
      ${isDeleting ? 'fade-out pointer-events-none' : ''}
      rounded-lg shadow-sm border border-gray-200 transition-all duration-200`}
    >
      <div className="p-4 cursor-pointer" onClick={(e) => {
          // Only trigger handleCardClick if the card is not already expanded
          if (!expanded) {
            handleCardClick(e);
          }
        }}>
        {/* Close button (top right) */}
        <div className="flex justify-end mb-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setExpanded(false);
            }}
            className={`text-gray-400 hover:text-gray-600 ${!expanded ? 'hidden' : ''}`}
            aria-label="Close details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Header row with title, badges */}
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <h3
                className={`text-xl font-medium ${
                  task.status === 'reviewed' ? 'text-gray-500' : ''
                }`}
              >
                {task.project ? <><span className="text-gray-600">{formatProjectName(task.project)}:</span> </> : ''}{task.title}
              </h3>
              <Popover
                content={
                  <div className="w-72">
                    <h4 className="font-medium text-gray-900 mb-1">Task Details</h4>
                    <div className="text-gray-600 mb-2">
                      <p className="mb-1">{task.description || 'No description provided'}</p>
                      <p className="text-sm mt-2 font-medium">Created {formatTimeAgo(task.createdAt)}</p>
                      <p className="text-sm">Updated {formatTimeAgo(task.updatedAt)}</p>
                      {task.completedAt && (
                        <p className="text-sm">Completed {formatTimeAgo(task.completedAt)}</p>
                      )}
                      {task.initiative && (
                        <p className="text-sm mt-1">{task.initiative}</p>
                      )}
                    </div>
                  </div>
                }
                position="top"
              >
                <FaInfoCircle className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer" />
              </Popover>
            </div>

            <div className="flex items-center space-x-1">

              {/* Status badge with popover */}
              <Popover
                content={
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Status: {task.status}</h4>
                    <p className="text-sm text-gray-600">
                      {task.status === 'proposed' && 'Task has been proposed but not started yet'}
                      {task.status === 'todo' && 'Task is ready to be worked on'}
                      {task.status === 'in-progress' && 'Task is currently being worked on'}
                      {task.status === 'done' && 'Task has been completed'}
                      {task.status === 'reviewed' && 'Task has been completed and reviewed'}
                    </p>
                  </div>
                }
                position="top"
              >
                <span className={`badge ${getStatusColor(task.status)}`}>{task.status}</span>
              </Popover>

              {/* Tested badge with popover */}
              {task.tested && (
                <Popover
                  content={
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Tested</h4>
                      <p className="text-sm text-gray-600">
                        This task has been tested and verified to work correctly
                      </p>
                    </div>
                  }
                  position="top"
                >
                  <span className="badge badge-tested">tested</span>
                </Popover>
              )}
            </div>
          </div>

          {/* Description (always visible) */}
          {task.description && (
            <div className={`text-base text-gray-600 ${expanded ? '' : 'line-clamp-2'}`}>
              {task.description}
            </div>
          )}
          
          {/* Initiative (if exists) */}
          {task.initiative && (
            <div className="mt-1 text-sm text-gray-600">
              {task.initiative}
            </div>
          )}

          {/* Created date with edit button */}
          <div className="mt-1 text-base text-gray-500">
            {isEditingDate ? (
              <div onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleDateSubmit} className="inline-flex items-center">
                  <label className="mr-2">New date:</label>
                  <input
                    type="text"
                    value={newDateValue}
                    onChange={(e) => setNewDateValue(e.target.value)}
                    placeholder="YYYY-MM-DDThh:mm:ss.sssZ"
                    className="px-2 py-1 border border-blue-300 rounded text-xs w-64"
                    autoFocus
                  />
                  <button 
                    type="submit" 
                    className="ml-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                  >
                    Save
                  </button>
                  <button 
                    type="button" 
                    className="ml-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    onClick={() => setIsEditingDate(false)}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center">
                <span>Created {formatTimeAgo(task.createdAt)}</span>
                {expanded && onUpdateDate && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditingDate(true);
                    }}
                    className="ml-2 text-blue-500 hover:text-blue-700 text-xs"
                    title="Edit creation date"
                  >
                    edit
                  </button>
                )}
              </div>
            )}
            
            {/* Show other dates only in expanded view */}
            {expanded && !isEditingDate && (
              <>
                <span className="mx-2">·</span>
                <span>Updated {formatTimeAgo(task.updatedAt)}</span>
                
                {task.status === 'done' && task.completedAt && (
                  <>
                    <span className="mx-2">·</span>
                    <span>Completed {formatTimeAgo(task.completedAt)}</span>
                  </>
                )}
                
                {task.status === 'reviewed' && task.reviewedAt && (
                  <>
                    <span className="mx-2">·</span>
                    <span>Reviewed {formatTimeAgo(task.reviewedAt)}</span>
                  </>
                )}
              </>
            )}
          </div>

          {expanded && (
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                {/* Priority badge */}
                <span
                  className={`badge ${
                    task.priority === 'high'
                      ? 'bg-red-100 text-red-800'
                      : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpanded(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Collapse ↑
              </button>
            </div>
          )}
          
          {/* Stage-appropriate action buttons (always visible) */}
          {renderStageActions()}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          {/* Initiative details are shown in the unexpanded view now */}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="mt-4 text-base">
              <h4 className="font-medium text-gray-700 mb-1">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Verification steps */}
          {task.verificationSteps && task.verificationSteps.length > 0 && (
            <div className="mt-4 text-base">
              <h4 className="font-medium text-gray-700 mb-1">Verification Steps</h4>
              <ul className="list-disc pl-5 text-gray-600">
                {task.verificationSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Next steps */}
          {task.nextSteps && task.nextSteps.length > 0 && (
            <div className="mt-4 text-base">
              <h4 className="font-medium text-gray-700 mb-1">Next Steps</h4>
              <ul className="list-disc pl-5 text-gray-600">
                {task.nextSteps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Files */}
          {task.files && task.files.length > 0 && (
            <div className="mt-4 text-base">
              <h4 className="font-medium text-gray-700 mb-1">Files</h4>
              <ul className="list-disc pl-5 text-gray-600">
                {task.files.map((file, index) => (
                  <li key={index} className="truncate">
                    {file}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Creation details - all in relative time */}
          <div className="mt-4 text-xs text-gray-500">
            <p className="font-medium">Created {formatTimeAgo(task.createdAt)}</p>
            <p>Last updated {formatTimeAgo(task.updatedAt)}</p>
            {task.completedAt && <p>Completed {formatTimeAgo(task.completedAt)}</p>}
            {task.reviewedAt && <p>Reviewed {formatTimeAgo(task.reviewedAt)}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
