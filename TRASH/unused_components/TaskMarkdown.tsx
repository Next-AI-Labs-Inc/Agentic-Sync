import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export interface TaskMarkdownProps {
  task: {
    id: string;
    project: string;
    markdown?: string;
  };
  onUpdateTask?: (taskId: string, project: string, updates: Partial<any>) => Promise<void>;
  isExpanded: boolean;
}

/**
 * Component for displaying and editing task markdown content
 * Renders rich markdown content for tasks
 * 
 * IMPORTANT: This modular component is not currently being used by the application.
 * The main TaskCard.tsx file in the parent directory is being used instead.
 * Any changes made here will not be reflected in the UI until the application
 * is migrated to use these modular components.
 * 
 * To implement markdown rendering in the current application, add the component's
 * functionality directly to /Users/jedi/react_projects/ix/tasks/src/components/TaskCard.tsx
 */
function TaskMarkdown({
  task,
  onUpdateTask,
  isExpanded
}: TaskMarkdownProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState(task.markdown || '');

  // Only show when expanded and has content
  if (!isExpanded) {
    return null;
  }
  
  // For debugging - always show even if no content
  console.log('TaskMarkdown rendering:', { taskId: task.id, hasMarkdown: !!task.markdown, markdown: task.markdown });

  // Start editing the markdown
  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  // Cancel editing and reset to original value
  const cancelEditing = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEditValue(task.markdown || '');
    setIsEditing(false);
  };

  // Save edited markdown
  const saveMarkdown = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!onUpdateTask) return;
    
    if (editValue !== task.markdown) {
      try {
        await onUpdateTask(task.id, task.project, { markdown: editValue });
      } catch (error) {
        console.error('Failed to update markdown:', error);
      }
    }
    
    setIsEditing(false);
  };

  // Handle textarea change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditValue(e.target.value);
  };

  // Handle keyboard navigation for editing
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    
    // Use Ctrl+Enter to save (not just Enter, to allow multiline editing)
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      saveMarkdown();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  return (
    <div className="task-markdown px-4 py-2 mb-4">
      {isEditing ? (
        <div onClick={e => e.stopPropagation()}>
          <h4 className="text-sm font-semibold mb-1">Markdown Content</h4>
          <textarea
            value={editValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] font-mono text-sm"
            autoFocus
            placeholder="Enter markdown content here..."
          />
          <div className="flex mt-2 space-x-2">
            <button
              onClick={saveMarkdown}
              className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              title="Press Ctrl+Enter to save"
            >
              Save
            </button>
            <button
              onClick={cancelEditing}
              className="px-2 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
              title="Press Esc to cancel"
            >
              Cancel
            </button>
            <span className="text-xs text-gray-500 self-center ml-2">
              Tip: Press Ctrl+Enter to save
            </span>
          </div>
        </div>
      ) : (
        <div
          className={`${onUpdateTask ? 'group cursor-pointer' : ''}`}
          onDoubleClick={onUpdateTask ? (e => startEditing(e)) : undefined}
        >
          <h4 className="text-sm font-semibold mb-2 flex items-center">
            Markdown Content
            {onUpdateTask && (
              <button
                className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={startEditing}
                title="Edit markdown content"
              >
                ✏️
              </button>
            )}
          </h4>
          <div className="prose prose-sm max-w-none border p-4 rounded bg-gray-50">
            {task.markdown ? (
              <ReactMarkdown>{task.markdown}</ReactMarkdown>
            ) : (
              <p className="text-gray-500 italic">No markdown content available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskMarkdown;