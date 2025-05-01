import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { getFirstParagraph } from './helpers';

export interface TaskContentProps {
  task: {
    id: string;
    project: string;
    description: string;
    userImpact?: string;
    impactedFunctionality?: string;
  };
  onUpdateTask?: (taskId: string, project: string, updates: Partial<any>) => Promise<void>;
  isExpanded: boolean;
}

/**
 * Component for displaying and editing task content
 * Includes description, user impact, etc., with markdown support
 */
function TaskContent({
  task,
  onUpdateTask,
  isExpanded
}: TaskContentProps) {
  const [isEditing, setIsEditing] = useState<{
    description: boolean;
    userImpact: boolean;
    impactedFunctionality: boolean;
  }>({
    description: false,
    userImpact: false,
    impactedFunctionality: false
  });
  
  const [editValues, setEditValues] = useState({
    description: task.description,
    userImpact: task.userImpact || '',
    impactedFunctionality: task.impactedFunctionality || ''
  });

  // Start editing a field
  const startEditing = (field: 'description' | 'userImpact' | 'impactedFunctionality') => {
    setIsEditing(prev => ({ ...prev, [field]: true }));
  };

  // Cancel editing and reset to original value
  const cancelEditing = (field: 'description' | 'userImpact' | 'impactedFunctionality') => {
    setEditValues(prev => ({
      ...prev,
      [field]: field === 'description' 
        ? task.description 
        : field === 'userImpact' 
          ? task.userImpact || ''
          : task.impactedFunctionality || ''
    }));
    setIsEditing(prev => ({ ...prev, [field]: false }));
  };

  // Save edited field
  const saveField = async (field: 'description' | 'userImpact' | 'impactedFunctionality') => {
    if (!onUpdateTask) return;
    
    const updatedValue = editValues[field];
    if (
      (field === 'description' && updatedValue !== task.description) ||
      (field === 'userImpact' && updatedValue !== task.userImpact) ||
      (field === 'impactedFunctionality' && updatedValue !== task.impactedFunctionality)
    ) {
      try {
        await onUpdateTask(task.id, task.project, { [field]: updatedValue });
      } catch (error) {
        console.error(`Failed to update ${field}:`, error);
      }
    }
    
    setIsEditing(prev => ({ ...prev, [field]: false }));
  };

  // Handle textarea change
  const handleChange = (field: 'description' | 'userImpact' | 'impactedFunctionality', value: string) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="task-content px-4 py-2">
      {/* Description */}
      <div className="description mb-3">
        {isEditing.description ? (
          <div onClick={e => e.stopPropagation()}>
            <h4 className="text-sm font-semibold mb-1">Description</h4>
            <textarea
              value={editValues.description}
              onChange={e => handleChange('description', e.target.value)}
              className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              autoFocus
            />
            <div className="flex mt-2 space-x-2">
              <button
                onClick={() => saveField('description')}
                className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={() => cancelEditing('description')}
                className="px-2 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`${onUpdateTask ? 'group cursor-pointer' : ''}`}
            onClick={onUpdateTask && !isExpanded ? (e => {
              e.stopPropagation();
              startEditing('description');
            }) : undefined}
            onDoubleClick={onUpdateTask && isExpanded ? (e => {
              e.stopPropagation();
              startEditing('description');
            }) : undefined}
          >
            <h4 className="text-sm font-semibold mb-1 flex items-center">
              Description
              {onUpdateTask && (
                <button
                  className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={e => {
                    e.stopPropagation();
                    startEditing('description');
                  }}
                  title="Edit description"
                >
                  ✏️
                </button>
              )}
            </h4>
            <div className="prose prose-sm max-w-none">
              {isExpanded ? (
                <ReactMarkdown>{task.description}</ReactMarkdown>
              ) : (
                <p>{getFirstParagraph(task.description)}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Only show these sections in expanded view or when editing */}
      {(isExpanded || isEditing.userImpact || isEditing.impactedFunctionality) && (
        <>
          {/* User Impact */}
          {(task.userImpact || isEditing.userImpact) && (
            <div className="user-impact mb-3">
              {isEditing.userImpact ? (
                <div onClick={e => e.stopPropagation()}>
                  <h4 className="text-sm font-semibold mb-1">User Impact</h4>
                  <textarea
                    value={editValues.userImpact}
                    onChange={e => handleChange('userImpact', e.target.value)}
                    className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    autoFocus
                  />
                  <div className="flex mt-2 space-x-2">
                    <button
                      onClick={() => saveField('userImpact')}
                      className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => cancelEditing('userImpact')}
                      className="px-2 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`${onUpdateTask ? 'group cursor-pointer' : ''}`}
                  onClick={onUpdateTask ? (e => {
                    e.stopPropagation();
                    startEditing('userImpact');
                  }) : undefined}
                >
                  <h4 className="text-sm font-semibold mb-1 flex items-center">
                    User Impact
                    {onUpdateTask && (
                      <button
                        className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={e => {
                          e.stopPropagation();
                          startEditing('userImpact');
                        }}
                        title="Edit user impact"
                      >
                        ✏️
                      </button>
                    )}
                  </h4>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{task.userImpact || ''}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Impacted Functionality */}
          {(task.impactedFunctionality || isEditing.impactedFunctionality) && (
            <div className="impacted-functionality mb-3">
              {isEditing.impactedFunctionality ? (
                <div onClick={e => e.stopPropagation()}>
                  <h4 className="text-sm font-semibold mb-1">Impacted Functionality</h4>
                  <textarea
                    value={editValues.impactedFunctionality}
                    onChange={e => handleChange('impactedFunctionality', e.target.value)}
                    className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    autoFocus
                  />
                  <div className="flex mt-2 space-x-2">
                    <button
                      onClick={() => saveField('impactedFunctionality')}
                      className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => cancelEditing('impactedFunctionality')}
                      className="px-2 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`${onUpdateTask ? 'group cursor-pointer' : ''}`}
                  onClick={onUpdateTask ? (e => {
                    e.stopPropagation();
                    startEditing('impactedFunctionality');
                  }) : undefined}
                >
                  <h4 className="text-sm font-semibold mb-1 flex items-center">
                    Impacted Functionality
                    {onUpdateTask && (
                      <button
                        className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={e => {
                          e.stopPropagation();
                          startEditing('impactedFunctionality');
                        }}
                        title="Edit impacted functionality"
                      >
                        ✏️
                      </button>
                    )}
                  </h4>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{task.impactedFunctionality || ''}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TaskContent;