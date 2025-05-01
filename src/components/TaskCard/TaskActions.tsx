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
import { TASK_STATUSES, STATUS_ACTION_HELP, STATUS_ACTION_TEXT } from '@/constants/taskStatus';
import DropdownMenu from '../DropdownMenu';

export interface TaskActionsProps {
  task: {
    id: string;
    project: string;
    status: 'inbox' | 'brainstorm' | 'proposed' | 'backlog' | 'maybe' | 'todo' | 'in-progress' | 'on-hold' | 'for-review' | 'done' | 'reviewed' | 'archived'; 
  };
  onStatusChange: (taskId: string, project: string, status: string) => Promise<void>;
  onMarkTested?: (taskId: string, project: string) => Promise<void>;
  onDelete?: (taskId: string, project: string) => Promise<void>;
}

/**
 * Component for task action buttons and status changes
 */
function TaskActions({
  task,
  onStatusChange,
  onMarkTested,
  onDelete
}: TaskActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Find the current status info
  const currentStatus = TASK_STATUSES.find(s => s.key === task.status);
  
  // Get possible next statuses
  const nextStatuses = currentStatus?.nextStatuses || [];
  
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
    return 'Move';
  };

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsLoading(newStatus);
      await onStatusChange(task.id, task.project, newStatus);
    } catch (error) {
      console.error('Failed to change status:', error);
    } finally {
      setIsLoading(null);
    }
  };

  // Handle mark as tested
  const handleMarkTested = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Handle delete
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
    const actionHelp = getActionHelp(nextStatus);
    const actionText = getActionText(nextStatus);
    const isLoading = nextStatus === isLoading;
    
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
            handleStatusChange(nextStatus);
          }}
          disabled={isLoading !== null}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors mr-2 last:mr-0
            ${isLoading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 
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
    const otherStatuses = TASK_STATUSES.filter(
      status => status.key !== task.status && !nextStatuses.includes(status.key)
    );
    
    return [
      ...otherStatuses.map(status => ({
        label: `Move to ${status.label}`,
        onClick: () => handleStatusChange(status.key)
      })),
      onMarkTested && {
        label: 'Mark as tested',
        onClick: handleMarkTested
      },
      onDelete && {
        label: 'Delete task',
        onClick: handleDelete,
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