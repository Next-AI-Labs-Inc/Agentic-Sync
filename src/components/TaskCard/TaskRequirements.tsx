import React from 'react';
import { ItemWithStatus } from '@/types';
import ItemSection from './ItemSection';

export interface TaskRequirementsProps {
  task: {
    id: string;
    requirements?: string;
    requirementItems?: ItemWithStatus[];
  };
  onApproveRequirementItem?: (taskId: string, itemId: string) => Promise<void>;
  onVetoRequirementItem?: (taskId: string, itemId: string) => Promise<void>;
  onUpdateRequirementItems?: (taskId: string, items: ItemWithStatus[]) => Promise<void>;
}

/**
 * Task requirements section with approval functionality
 */
function TaskRequirements({
  task,
  onApproveRequirementItem,
  onVetoRequirementItem,
  onUpdateRequirementItems
}: TaskRequirementsProps) {
  return (
    <ItemSection
      title="Requirements"
      description="What this task aims to accomplish. Approve items that meet the objectives."
      sectionKey="requirements"
      itemsKey="requirementItems"
      task={task}
      items={task.requirementItems || []}
      rawText={task.requirements || ''}
      onApproveItem={onApproveRequirementItem}
      onVetoItem={onVetoRequirementItem}
      onUpdateItems={onUpdateRequirementItems}
    />
  );
}

export default TaskRequirements;