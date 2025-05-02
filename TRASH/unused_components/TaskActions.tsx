import React, { useState } from 'react';
import {
  FaCheck,
  FaArrowRight,
  FaArrowLeft,
  FaTrash,
  FaPause,
  FaListAlt,
  FaArchive,
  FaCog
} from 'react-icons/fa';
import PopoverComponent from './PopoverComponent';
import { TASK_STATUSES, STATUS_ACTION_HELP, STATUS_ACTION_TEXT, NEXT_STATUS } from '@/constants/taskStatus';
import DropdownMenu from '../DropdownMenu';

export interface TaskActionsProps {
  task: {
    id: string;
    project: string;
    status: 'inbox' | 'brainstorm' | 'proposed' | 'backlog' | 'maybe' | 'todo' | 'in-progress' | 'on-hold' | 'for-review' | 'done' | 'reviewed' | 'archived'; 
  };
  onStatusChange: (taskId: string, project: string, status: string) => Promise<void>;
  onMarkTested?: (taskId: string, project: string) => Promise<void>;
  onMarkActionable?: (taskId: string, project: string) => Promise<void>;
  onDelete?: (taskId: string, project: string) => Promise<void>;
}

/**
 * Component for task action buttons and status changes
 */
function TaskActions({
  task,
  onStatusChange,
  onMarkTested,
  onMarkActionable,
  onDelete
}: TaskActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  // Get next status for the current task status
  const nextStatus = NEXT_STATUS[task.status];
  
  // Define possible next statuses based on current status
  let nextStatuses: string[] = [];
  if (nextStatus) {
    nextStatuses = [nextStatus];
    
    // Add additional common actions based on status
    if (task.status === 'proposed' || task.status === 'backlog' || task.status === 'maybe') {
      // For these statuses, "Mark Actionable" (move to todo) is a common action
      if (nextStatus !== TASK_STATUSES.TODO) {
        nextStatuses.push(TASK_STATUSES.TODO);
      }
    }
  }
  
  // Get action help text
  const getActionHelp = (statusKey: string) => {
    const key = statusKey as keyof typeof STATUS_ACTION_HELP;
    if (key in STATUS_ACTION_HELP) {
      return STATUS_ACTION_HELP[key];
    }
    return { title: 'Action', description: 'Click to perform this action' };
  };

  // Get action text
  const getActionText = (statusKey: string) => {
    const key = statusKey as keyof typeof STATUS_ACTION_TEXT;
    if (key in STATUS_ACTION_TEXT) {
      return STATUS_ACTION_TEXT[key];
    }
    
    // Special case for making tasks actionable
    if (statusKey === TASK_STATUSES.TODO && 
       (task.status === 'proposed' || task.status === 'backlog' || task.status === 'maybe')) {
      return STATUS_ACTION_TEXT.MARK_ACTIONABLE;
    }
    
    return 'Move';
  };

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    try {
      // If newStatus is todo and we have an onMarkActionable handler, use that instead
      if (newStatus === TASK_STATUSES.TODO && 
          (task.status === 'proposed' || task.status === 'backlog' || task.status === 'maybe') && 
          onMarkActionable) {
        return handleMarkActionable();
      }
      
      setIsLoading(newStatus);
      await onStatusChange(task.id, task.project, newStatus);
    } catch (error) {
      console.error('Failed to change status:', error);
    } finally {
      setIsLoading(null);
    }
  };

  // Handle mark as tested
  const handleMarkTested = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!onMarkTested) return;
    
    try {
      setIsLoading('tested');
      await onMarkTested(task.id, task.project);
    } catch (error) {
      console.error('Failed to mark as tested:', error);
    } finally {
      setIsLoading(null);
    }
  };
  
  // Handle mark as actionable
  const handleMarkActionable = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!onMarkActionable) {
      // Fallback to regular status change if no dedicated handler
      return handleStatusChange(TASK_STATUSES.TODO);
    }
    
    try {
      setIsLoading('actionable');
      await onMarkActionable(task.id, task.project);
    } catch (error) {
      console.error('Failed to mark as actionable:', error);
    } finally {
      setIsLoading(null);
    }
  };

  // Handle delete
  const handleDelete = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!onDelete || isDeleting) return;
    
    // Confirm deletion
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this task? This action cannot be undone.'
    );
    
    if (confirmDelete) {
      try {
        setIsDeleting(true);
        await onDelete(task.id, task.project);
      } catch (error) {
        console.error('Failed to delete task:', error);
        setIsDeleting(false);
      }
    }
  };

  // Render status change button
  const renderStatusButton = (nextStatus: string) => {
    // Special case for "Mark as Actionable"
    const isMarkActionable = nextStatus === TASK_STATUSES.TODO && 
      (task.status === 'proposed' || task.status === 'backlog' || task.status === 'maybe');
    
    const actionHelpKey = isMarkActionable ? 'MARK_ACTIONABLE' : nextStatus;
    const actionHelp = getActionHelp(actionHelpKey);
    const actionText = getActionText(nextStatus);
    const isButtonLoading = nextStatus === isLoading || 
                          (isMarkActionable && isLoading === 'actionable');
    
    let icon;
    switch (nextStatus) {
      case 'in-progress':
        icon = <FaArrowRight />;
        break;
      case 'for-review':
      case 'done':
      case 'reviewed':
        icon = <FaCheck />;
        break;
      case 'on-hold':
        icon = <FaPause />;
        break;
      case 'backlog':
        icon = <FaListAlt />;
        break;
      case 'archived':
        icon = <FaArchive />;
        break;
      default:
        icon = <FaArrowRight />;
    }
    
    // For actionable, always show check icon
    if (isMarkActionable) {
      icon = <FaCheck />;
    }
    
    return (
      <PopoverComponent
        key={nextStatus}
        content={
          <div>
            <h4 className="font-semibold mb-1">{actionHelp.title}</h4>
            <p>{actionHelp.description}</p>
          </div>
        }
        position="top"
      >
        <button
          onClick={e => {
            e.stopPropagation();
            if (isMarkActionable && onMarkActionable) {
              handleMarkActionable(e);
            } else {
              handleStatusChange(nextStatus);
            }
          }}
          disabled={isLoading !== null}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors mr-2 last:mr-0
            ${isButtonLoading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 
              'bg-blue-500 text-white hover:bg-blue-600'}`}
        >
          <span className="flex items-center">
            {icon}
            <span className="ml-1">{actionText}</span>
          </span>
        </button>
      </PopoverComponent>
    );
  };

  // Render dropdown menu items
  const renderDropdownItems = () => {
    // Get all statuses except the current one and the primary next ones
    const otherStatusKeys = Object.values(TASK_STATUSES)
      .filter(status => 
        // Filter out non-relevant statuses
        ![TASK_STATUSES.ALL, TASK_STATUSES.PENDING, TASK_STATUSES.RECENT_COMPLETED, 
           TASK_STATUSES.SOURCE_TASKS, TASK_STATUSES.ENGAGED, TASK_STATUSES.REVIEW, 
           TASK_STATUSES.COMPLETIONS, TASK_STATUSES.TODAY].includes(status) &&
        // Filter out current status
        status !== task.status && 
        // Filter out statuses already in the primary buttons
        !nextStatuses.includes(status)
      );
    
    return [
      ...otherStatusKeys.map(status => ({
        label: `Move to ${STATUS_ACTION_TEXT[status] || status}`,
        onClick: () => handleStatusChange(status)
      })),
      onMarkTested && {
        label: STATUS_ACTION_TEXT.MARK_TESTED,
        onClick: (e: React.MouseEvent) => handleMarkTested(e)
      },
      (!nextStatuses.includes(TASK_STATUSES.TODO) && 
       !['todo', 'in-progress', 'for-review', 'done', 'reviewed', 'archived'].includes(task.status)) && {
        label: STATUS_ACTION_TEXT.MARK_ACTIONABLE,
        onClick: (e: React.MouseEvent) => handleMarkActionable(e)
      },
      onDelete && {
        label: STATUS_ACTION_TEXT.DELETE,
        onClick: (e: React.MouseEvent) => handleDelete(e),
        className: 'text-red-600 hover:bg-red-50'
      }
    ].filter(Boolean);
  };

  return (
    <div className="task-actions px-4 py-3 border-t flex flex-wrap items-center justify-between">
      <div className="primary-actions flex flex-wrap mb-2 sm:mb-0">
        {/* Primary status change buttons */}
        {nextStatuses.slice(0, 2).map(renderStatusButton)}
      </div>
      
      <div className="secondary-actions">
        {/* More actions dropdown */}
        <DropdownMenu
          trigger={
            <button
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200"
              disabled={isLoading !== null}
            >
              <span className="flex items-center">
                <FaCog />
                <span className="ml-1">More</span>
              </span>
            </button>
          }
          items={renderDropdownItems() as any}
        />
      </div>
    </div>
  );
}

export default TaskActions;