import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { formatDate } from './helpers';
import PopoverComponent from './PopoverComponent';

export interface TaskMetadataProps {
  task: {
    id: string;
    project: string;
    initiative?: string;
    createdAt?: string;
    updatedAt?: string;
    completedAt?: string;
    starred?: boolean;
  };
  onUpdateDate?: (taskId: string, project: string, newDate: string) => Promise<void>;
  onUpdateInitiative?: (taskId: string, initiative: string) => Promise<void>;
  onToggleStar?: (taskId: string, project: string) => Promise<void>;
}

/**
 * Component for displaying and editing task metadata
 * Includes initiative, project, creation date, and star toggle
 */
function TaskMetadata({
  task,
  onUpdateDate,
  onUpdateInitiative,
  onToggleStar
}: TaskMetadataProps) {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dateValue, setDateValue] = useState(
    task.createdAt ? format(parseISO(task.createdAt), 'yyyy-MM-dd') : ''
  );
  const [isEditingInitiative, setIsEditingInitiative] = useState(false);
  const [initiativeValue, setInitiativeValue] = useState(task.initiative || '');

  // Handle star toggle
  const handleStarToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleStar) {
      await onToggleStar(task.id, task.project);
    }
  };

  // Handle date edit
  const handleDateEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingDate(true);
  };

  // Save edited date
  const handleDateSave = async () => {
    if (onUpdateDate) {
      try {
        await onUpdateDate(task.id, task.project, dateValue);
      } catch (error) {
        console.error('Failed to update date:', error);
      }
    }
    setIsEditingDate(false);
  };

  // Cancel date editing
  const handleDateCancel = () => {
    setDateValue(task.createdAt ? format(parseISO(task.createdAt), 'yyyy-MM-dd') : '');
    setIsEditingDate(false);
  };

  // Handle initiative edit
  const handleInitiativeEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingInitiative(true);
  };

  // Save edited initiative
  const handleInitiativeSave = async () => {
    if (onUpdateInitiative) {
      try {
        await onUpdateInitiative(task.id, initiativeValue);
      } catch (error) {
        console.error('Failed to update initiative:', error);
      }
    }
    setIsEditingInitiative(false);
  };

  // Cancel initiative editing
  const handleInitiativeCancel = () => {
    setInitiativeValue(task.initiative || '');
    setIsEditingInitiative(false);
  };

  return (
    <div className="task-metadata px-4 pb-2">
      <div className="flex justify-between items-center text-xs text-gray-500">
        <div className="flex-grow">
          {/* Initiative */}
          <div className="initiative mb-1">
            <span className="font-semibold mr-1">Initiative:</span>
            {isEditingInitiative ? (
              <div className="inline-block" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={initiativeValue}
                  onChange={e => setInitiativeValue(e.target.value)}
                  className="p-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleInitiativeSave();
                    if (e.key === 'Escape') handleInitiativeCancel();
                  }}
                  autoFocus
                />
                <div className="flex mt-1 space-x-1">
                  <button
                    onClick={handleInitiativeSave}
                    className="text-xs px-1 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleInitiativeCancel}
                    className="text-xs px-1 py-0.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <span
                className={`${onUpdateInitiative ? 'cursor-pointer hover:text-blue-600 hover:underline' : ''}`}
                onClick={onUpdateInitiative ? handleInitiativeEdit : undefined}
              >
                {task.initiative || 'None'}
              </span>
            )}
          </div>

          {/* Project */}
          <div className="project mb-1">
            <span className="font-semibold mr-1">Project:</span>
            <span>{task.project || 'None'}</span>
          </div>

          {/* Created date */}
          <div className="created-date">
            <span className="font-semibold mr-1">Created:</span>
            {isEditingDate ? (
              <div className="inline-block" onClick={e => e.stopPropagation()}>
                <input
                  type="date"
                  value={dateValue}
                  onChange={e => setDateValue(e.target.value)}
                  className="p-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleDateSave();
                    if (e.key === 'Escape') handleDateCancel();
                  }}
                  autoFocus
                />
                <div className="flex mt-1 space-x-1">
                  <button
                    onClick={handleDateSave}
                    className="text-xs px-1 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleDateCancel}
                    className="text-xs px-1 py-0.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <span
                className={`${onUpdateDate ? 'cursor-pointer hover:text-blue-600 hover:underline' : ''}`}
                onClick={onUpdateDate ? handleDateEdit : undefined}
              >
                {formatDate(task.createdAt, true)}
              </span>
            )}
          </div>

          {/* Completed date (if available) */}
          {task.completedAt && (
            <div className="completed-date">
              <span className="font-semibold mr-1">Completed:</span>
              <span>{formatDate(task.completedAt, true)}</span>
            </div>
          )}
        </div>

        {/* Star button */}
        {onToggleStar && (
          <div className="flex-shrink-0 ml-2">
            <PopoverComponent
              content={task.starred ? "Unstar task" : "Star task"}
              position="left"
            >
              <button
                onClick={handleStarToggle}
                className={`text-xl ${task.starred ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-gray-400'}`}
                aria-label={task.starred ? "Unstar task" : "Star task"}
              >
                {task.starred ? <FaStar /> : <FaRegStar />}
              </button>
            </PopoverComponent>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskMetadata;