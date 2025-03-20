import React, { useState } from 'react';
import { Task, ItemWithStatus } from '@/types';
import EditableItemList from '../EditableItems/EditableItemList';
import { getProgressPercentage, countItemsByStatus } from './helpers';

interface TaskVerificationStepsProps {
  task: Task;
  isExpanded: boolean;
  onApproveItem?: (taskId: string, itemId: string) => Promise<void>;
  onVetoItem?: (taskId: string, itemId: string) => Promise<void>;
  onUpdateItems?: (taskId: string, items: ItemWithStatus[]) => Promise<void>;
}

/**
 * Displays verification steps for a task
 * Shows how to verify that the task has been completed correctly
 * Now supports structured item status tracking like other task sections
 */
function TaskVerificationSteps({ 
  task, 
  isExpanded,
  onApproveItem,
  onVetoItem,
  onUpdateItems 
}: TaskVerificationStepsProps) {
  if (!isExpanded) {
    return null;
  }
  
  // Use structured verification items if available, otherwise fallback to string array
  const hasVerificationItems = task.verificationStepItems && task.verificationStepItems.length > 0;
  const hasVerificationSteps = task.verificationSteps && task.verificationSteps.length > 0;
  
  // If we have neither, don't render anything
  if (!hasVerificationItems && !hasVerificationSteps) {
    return null;
  }
  
  // Show progress stats for structured items
  const counts = hasVerificationItems ? countItemsByStatus(task.verificationStepItems!) : { total: 0, approved: 0 };
  const progress = hasVerificationItems ? getProgressPercentage(task.verificationStepItems!) : 0;

  return (
    <div className="verification-steps p-4 border-t border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-700">
          Verification Steps
        </h4>
        
        {/* Progress stats */}
        {hasVerificationItems && (
          <div className="text-xs text-gray-500">
            {counts.approved}/{counts.total} verified
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      {hasVerificationItems && (
        <div className="w-full h-1 bg-gray-200 rounded-full mb-3">
          <div
            className="h-1 bg-green-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {/* Render using EditableItemList for structured verification items */}
      {hasVerificationItems && (
        <EditableItemList
          taskId={task.id}
          items={task.verificationStepItems!}
          rawText={task.verificationSteps?.join('\n') || ''}
          label="Verification Steps"
          onApproveItem={onApproveItem}
          onVetoItem={onVetoItem}
          onUpdateItems={onUpdateItems}
        />
      )}
      
      {/* Fallback to simple list for legacy string-based verification steps */}
      {!hasVerificationItems && hasVerificationSteps && (
        <ol className="list-decimal pl-5 space-y-1">
          {task.verificationSteps!.map((step, index) => (
            <li key={index} className="text-sm text-gray-600">{step}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default TaskVerificationSteps;