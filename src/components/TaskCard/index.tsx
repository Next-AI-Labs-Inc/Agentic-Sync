import React, { useState, useEffect } from 'react';
import TaskCardHeader from './TaskCardHeader';
import TaskStatusBadge from './TaskStatusBadge';
import TaskMetadata from './TaskMetadata';
import TaskContent from './TaskContent';
import TaskMarkdown from './TaskMarkdown';
import TaskActions from './TaskActions';
import TaskRequirements from './TaskRequirements';
import TaskTechnicalPlan from './TaskTechnicalPlan';
import TaskNextSteps from './TaskNextSteps';
import TaskVerificationSteps from './TaskVerificationSteps';
import AgentIntegration from './AgentIntegration';
import ItemSection from './ItemSection';
import PopoverComponent from './PopoverComponent';
import { Task, ItemWithStatus } from '@/types';

// Re-export components for use elsewhere
export {
  TaskCardHeader,
  TaskStatusBadge,
  TaskMetadata,
  TaskContent,
  TaskMarkdown,
  TaskActions,
  TaskRequirements,
  TaskTechnicalPlan,
  TaskNextSteps,
  TaskVerificationSteps,
  AgentIntegration,
  PopoverComponent
};

export interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, project: string, status: Task['status']) => Promise<void>;
  onMarkTested: (taskId: string, project: string) => Promise<void>;
  onDelete: (taskId: string, project: string) => Promise<void>;
  onUpdateDate?: (taskId: string, project: string, newDate: string) => Promise<void>;
  onUpdateTask?: (taskId: string, project: string, updates: Partial<Task>) => Promise<void>;
  onToggleStar?: (taskId: string, project: string) => Promise<void>;
  // Item approval functions
  onApproveRequirementItem?: (taskId: string, itemId: string) => Promise<void>;
  onVetoRequirementItem?: (taskId: string, itemId: string) => Promise<void>;
  onUpdateRequirementItems?: (taskId: string, items: ItemWithStatus[]) => Promise<void>;
  onApproveTechnicalPlanItem?: (taskId: string, itemId: string) => Promise<void>;
  onVetoTechnicalPlanItem?: (taskId: string, itemId: string) => Promise<void>;
  onUpdateTechnicalPlanItems?: (taskId: string, items: ItemWithStatus[]) => Promise<void>;
  onApproveNextStepItem?: (taskId: string, itemId: string) => Promise<void>;
  onVetoNextStepItem?: (taskId: string, itemId: string) => Promise<void>;
  onUpdateNextStepItems?: (taskId: string, items: ItemWithStatus[]) => Promise<void>;
  // Agent integration functions
  onAddFeedback?: (taskId: string, content: string) => Promise<void>;
  onLaunchAgent?: (
    taskId: string,
    mode: 'implement' | 'demo' | 'feedback',
    feedback?: string
  ) => Promise<void>;
  expanded?: boolean; // Whether the card is expanded by default
  hideExpand?: boolean; // Whether to hide the expand/collapse button
}

/**
 * TaskCard component displays a task with all its details and interactions
 * This is a refactored version that uses smaller, focused sub-components
 * 
 * IMPORTANT: These modular components are not currently being used by the application.
 * The main TaskCard.tsx file in the parent directory is being used instead.
 * Any changes made here will not be reflected in the UI until the application
 * is migrated to use these modular components.
 * 
 * When implementing new features, make sure to add them to both places:
 * 1. Here in the modular component structure (for future use)
 * 2. In the main TaskCard.tsx file in the parent directory (for current use)
 */
function TaskCard({
  task,
  onStatusChange,
  onMarkTested,
  onDelete,
  onUpdateDate,
  onUpdateTask,
  onToggleStar,
  // Item approval functions
  onApproveRequirementItem,
  onVetoRequirementItem,
  onUpdateRequirementItems,
  onApproveTechnicalPlanItem,
  onVetoTechnicalPlanItem,
  onUpdateTechnicalPlanItems,
  onApproveNextStepItem,
  onVetoNextStepItem,
  onUpdateNextStepItems,
  // Agent integration functions
  onAddFeedback,
  onLaunchAgent,
  expanded: defaultExpanded = false,
  hideExpand = false
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [isNew, setIsNew] = useState(task._isNew || false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Clear the new flag after animation completes
  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => {
        setIsNew(false);
      }, 1000); // Matches animation duration
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  // Handle card click for expansion
  const handleCardClick = (e: React.MouseEvent) => {
    // First check if the click should be ignored
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLFormElement ||
      // Check for editors and interactive elements
      (e.target instanceof HTMLElement &&
        (e.target.closest('.popover') ||
          e.target.closest('.dropdown-menu') ||
          e.target.closest('.editable-item')))
    ) {
      return; // Let interactive elements handle their own clicks
    }

    // Toggle expanded state
    setExpanded(!expanded);
  };

  return (
    <div
      className={`task-card ${expanded ? 'expanded' : ''} ${isNew ? 'new-task' : ''} ${
        isDeleting ? 'deleting' : ''
      } relative bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200`}
      onClick={handleCardClick}
    >
      {/* Task header with title, status badge, and expand/collapse control */}
      <TaskCardHeader
        task={task}
        isExpanded={expanded}
        onToggleExpand={() => setExpanded(!expanded)}
        onTitleEdit={onUpdateTask && ((newTitle) => onUpdateTask(task.id, task.project, { title: newTitle }))}
        hideExpand={hideExpand}
      />

      {/* Task metadata section (initiative, project, dates) */}
      <TaskMetadata
        task={task}
        onUpdateDate={onUpdateDate}
        onUpdateInitiative={onUpdateTask && ((initiative) => onUpdateTask(task.id, task.project, { initiative }))}
        onToggleStar={onToggleStar}
      />

      {/* Main task content (description, user impact) */}
      <TaskContent
        task={task}
        onUpdateTask={onUpdateTask}
        isExpanded={expanded}
      />

      {/* Only show detailed content in expanded state */}
      {expanded && (
        <>
          {/* Markdown content */}
          <TaskMarkdown
            task={task}
            onUpdateTask={onUpdateTask}
            isExpanded={expanded}
          />

          {/* Requirements section with approval controls */}
          {(task.requirements || task.requirementItems?.length > 0 || onUpdateRequirementItems) && (
            <TaskRequirements
              task={task}
              onApproveRequirementItem={onApproveRequirementItem}
              onVetoRequirementItem={onVetoRequirementItem}
              onUpdateRequirementItems={onUpdateRequirementItems}
            />
          )}

          {/* Technical plan section with approval controls */}
          {(task.technicalPlan || task.technicalPlanItems?.length > 0 || onUpdateTechnicalPlanItems) && (
            <TaskTechnicalPlan
              task={task}
              onApproveTechnicalPlanItem={onApproveTechnicalPlanItem}
              onVetoTechnicalPlanItem={onVetoTechnicalPlanItem}
              onUpdateTechnicalPlanItems={onUpdateTechnicalPlanItems}
            />
          )}

          {/* Next steps section with approval controls */}
          {(task.nextSteps || task.nextStepItems?.length > 0 || onUpdateNextStepItems) && (
            <TaskNextSteps
              task={task}
              onApproveNextStepItem={onApproveNextStepItem}
              onVetoNextStepItem={onVetoNextStepItem}
              onUpdateNextStepItems={onUpdateNextStepItems}
            />
          )}
          
          {/* Verification steps section with approval controls */}
          <TaskVerificationSteps
            task={task}
            isExpanded={expanded}
            onApproveItem={onApproveRequirementItem} 
            onVetoItem={onVetoRequirementItem}
            onUpdateItems={(taskId, items) => {
              if (onUpdateTask) {
                onUpdateTask(taskId, task.project, { verificationStepItems: items });
              }
            }}
          />
        </>
      )}

      {/* Task actions section with status change buttons */}
      <TaskActions
        task={task}
        onStatusChange={onStatusChange}
        onMarkTested={onMarkTested}
        onDelete={onDelete}
      />

      {/* Agent integration (buttons for deploying agent, giving feedback, etc.) */}
      {(onAddFeedback || onLaunchAgent) && (
        <AgentIntegration
          task={task}
          onAddFeedback={onAddFeedback}
          onLaunchAgent={onLaunchAgent}
        />
      )}
    </div>
  );
}

export default TaskCard;