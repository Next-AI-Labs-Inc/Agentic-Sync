import React from 'react';
import { ItemWithStatus } from '@/types';
import ItemSection from './ItemSection';

export interface TaskNextStepsProps {
  task: {
    id: string;
    nextSteps?: string;
    nextStepItems?: ItemWithStatus[];
  };
  onApproveNextStepItem?: (taskId: string, itemId: string) => Promise<void>;
  onVetoNextStepItem?: (taskId: string, itemId: string) => Promise<void>;
  onUpdateNextStepItems?: (taskId: string, items: ItemWithStatus[]) => Promise<void>;
}

/**
 * Task next steps section with approval functionality
 */
function TaskNextSteps({
  task,
  onApproveNextStepItem,
  onVetoNextStepItem,
  onUpdateNextStepItems
}: TaskNextStepsProps) {
  return (
    <ItemSection
      title="Next Steps"
      description="Future work that should follow after this task is completed."
      sectionKey="nextSteps"
      itemsKey="nextStepItems"
      task={task}
      items={task.nextStepItems || []}
      rawText={task.nextSteps || ''}
      onApproveItem={onApproveNextStepItem}
      onVetoItem={onVetoNextStepItem}
      onUpdateItems={onUpdateNextStepItems}
    />
  );
}

export default TaskNextSteps;