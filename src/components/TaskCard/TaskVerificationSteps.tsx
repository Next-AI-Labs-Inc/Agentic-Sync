import React from 'react';
import { Task } from '@/types';

interface TaskVerificationStepsProps {
  task: Task;
  isExpanded: boolean;
}

/**
 * Displays verification steps for a task
 * Shows how to verify that the task has been completed correctly
 */
function TaskVerificationSteps({ task, isExpanded }: TaskVerificationStepsProps) {
  if (!isExpanded || !task.verificationSteps || task.verificationSteps.length === 0) {
    return null;
  }

  return (
    <div className="verification-steps p-4 border-t border-gray-100">
      <h4 className="text-sm font-semibold mb-2 text-gray-700">
        Verification Steps
      </h4>
      <ol className="list-decimal pl-5 space-y-1">
        {task.verificationSteps.map((step, index) => (
          <li key={index} className="text-sm text-gray-600">{step}</li>
        ))}
      </ol>
    </div>
  );
}

export default TaskVerificationSteps;