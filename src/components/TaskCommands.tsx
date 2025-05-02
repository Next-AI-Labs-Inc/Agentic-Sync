import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronUp, FaTrash, FaArrowRight } from 'react-icons/fa';
import { Task } from '@/types/Task';
import { STATUS_ACTION_HELP } from '@/config/taskStatus';
import Popover, { POPOVER_POSITIONS } from './Popover';

// LocalStorage key for commands visibility
const COMMANDS_VISIBILITY_KEY = 'task_commands_visibility';

export interface TaskCommandsProps {
  task: Task;
  onStatusChange: (taskId: string, projectId: string, status: Task['status']) => void;
  onDelete: (taskId: string, projectId: string) => void;
  onMarkTested?: (taskId: string, projectId: string) => void;
}

const TaskCommands: React.FC<TaskCommandsProps> = ({
  task,
  onStatusChange,
  onDelete,
  onMarkTested
}) => {
  // State for commands visibility
  const [commandsVisible, setCommandsVisible] = useState<boolean>(true);

  // Load visibility state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(COMMANDS_VISIBILITY_KEY);
      if (savedState !== null) {
        setCommandsVisible(savedState === 'true');
      }
    } catch (error) {
      console.error('Error loading commands visibility state:', error);
    }
  }, []);

  // Save visibility state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(COMMANDS_VISIBILITY_KEY, String(commandsVisible));
    } catch (error) {
      console.error('Error saving commands visibility state:', error);
    }
  }, [commandsVisible]);

  // Toggle commands visibility
  const toggleCommandsVisibility = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion
    setCommandsVisible(prev => !prev);
  };

  // Status change handlers with transition effects
  const handleStatusChange =
    (newStatus: Task['status']) =>
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

    if (onMarkTested) {
      onMarkTested(task.id, task.project);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion
    onDelete(task.id, task.project);
  };

  // Render appropriate commands based on task status
  const renderCommands = () => {
    if (!commandsVisible) return null;

    const commands = [];

    // Commands vary based on task status
    switch (task.status) {
      case 'todo':
        commands.push(
          <Popover
            key="start-progress-popover"
            content={
              <div className="w-64">
                <h4 className="font-medium text-gray-900 mb-1">
                  {STATUS_ACTION_HELP.START_PROGRESS.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {STATUS_ACTION_HELP.START_PROGRESS.description}
                </p>
              </div>
            }
            position={POPOVER_POSITIONS.TOP}
          >
            <button
              key="start-progress"
              onClick={handleStatusChange('in-progress')}
              className="btn-outline-primary"
            >
              <FaArrowRight className="mr-1" size={12} />
              Start Progress
            </button>
          </Popover>
        );
        break;

      case 'in-progress':
        commands.push(
          <Popover
            key="mark-done-popover"
            content={
              <div className="w-64">
                <h4 className="font-medium text-gray-900 mb-1">
                  {STATUS_ACTION_HELP.MARK_DONE.title}
                </h4>
                <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.MARK_DONE.description}</p>
              </div>
            }
            position={POPOVER_POSITIONS.TOP}
          >
            <button
              key="mark-done"
              onClick={handleStatusChange('done')}
              className="btn-outline-primary"
            >
              <FaArrowRight className="mr-1" size={12} />
              Mark Done
            </button>
          </Popover>
        );

        commands.push(
          <Popover
            key="put-on-hold-popover"
            content={
              <div className="w-64">
                <h4 className="font-medium text-gray-900 mb-1">
                  {STATUS_ACTION_HELP.PUT_ON_HOLD.title}
                </h4>
                <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.PUT_ON_HOLD.description}</p>
              </div>
            }
            position={POPOVER_POSITIONS.TOP}
          >
            <button
              key="put-on-hold"
              onClick={handleStatusChange('on-hold')}
              className="btn-outline-secondary"
            >
              <FaArrowRight className="mr-1" size={12} />
              Put On Hold
            </button>
          </Popover>
        );
        break;

      case 'on-hold':
        commands.push(
          <Popover
            key="resume-progress-popover"
            content={
              <div className="w-64">
                <h4 className="font-medium text-gray-900 mb-1">
                  {STATUS_ACTION_HELP.RESUME_PROGRESS.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {STATUS_ACTION_HELP.RESUME_PROGRESS.description}
                </p>
              </div>
            }
            position={POPOVER_POSITIONS.TOP}
          >
            <button
              key="resume-progress"
              onClick={handleStatusChange('in-progress')}
              className="btn-outline-primary"
            >
              <FaArrowRight className="mr-1" size={12} />
              Resume Progress
            </button>
          </Popover>
        );
        break;

      case 'done':
        commands.push(
          <Popover
            key="move-to-review-popover"
            content={
              <div className="w-64">
                <h4 className="font-medium text-gray-900 mb-1">
                  {STATUS_ACTION_HELP.MOVE_TO_REVIEW.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {STATUS_ACTION_HELP.MOVE_TO_REVIEW.description}
                </p>
              </div>
            }
            position={POPOVER_POSITIONS.TOP}
          >
            <button
              key="move-to-review"
              onClick={handleStatusChange('reviewed')}
              className="btn-outline-primary"
            >
              <FaArrowRight className="mr-1" size={12} />
              Move to Review
            </button>
          </Popover>
        );

        if (onMarkTested) {
          commands.push(
            <Popover
              key="mark-tested-popover"
              content={
                <div className="w-64">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {STATUS_ACTION_HELP.MARK_TESTED.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {STATUS_ACTION_HELP.MARK_TESTED.description}
                  </p>
                </div>
              }
              position={POPOVER_POSITIONS.TOP}
            >
              <button
                key="mark-tested"
                onClick={handleMarkTested}
                className="btn-outline-secondary"
              >
                <FaArrowRight className="mr-1" size={12} />
                Mark Tested
              </button>
            </Popover>
          );
        }
        break;

      default:
        break;
    }

    // Add Delete button for most statuses
    if (!['archived', 'reviewed'].includes(task.status as string)) {
      commands.push(
        <Popover
          key="delete-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">{STATUS_ACTION_HELP.DELETE.title}</h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.DELETE.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button key="delete" onClick={handleDelete} className="btn-outline-danger">
            <FaTrash className="mr-1" size={12} />
            Delete
          </button>
        </Popover>
      );
    }

    return commands;
  };

  return (
    <div className="mt-3 relative">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={toggleCommandsVisibility}
          className="text-gray-500 hover:text-gray-700 transition-colors flex items-center text-sm"
          title={commandsVisible ? "Hide commands" : "Show commands"}
        >
          {commandsVisible ? (
            <>
              <FaChevronUp className="mr-1" size={12} /> Hide Commands
            </>
          ) : (
            <>
              <FaChevronDown className="mr-1" size={12} /> Show Commands
            </>
          )}
        </button>
      </div>
      
      {/* Render commands if visible */}
      {commandsVisible && (
        <div className="flex flex-wrap gap-2">
          {renderCommands()}
        </div>
      )}
    </div>
  );
};

export default TaskCommands;