import React from 'react';
import { ItemWithStatus } from '@/types';
import ItemSection from './ItemSection';

export interface TaskTechnicalPlanProps {
  task: {
    id: string;
    technicalPlan?: string;
    technicalPlanItems?: ItemWithStatus[];
  };
  onApproveTechnicalPlanItem?: (taskId: string, itemId: string) => Promise<void>;
  onVetoTechnicalPlanItem?: (taskId: string, itemId: string) => Promise<void>;
  onUpdateTechnicalPlanItems?: (taskId: string, items: ItemWithStatus[]) => Promise<void>;
}

/**
 * Task technical plan section with approval functionality
 */
function TaskTechnicalPlan({
  task,
  onApproveTechnicalPlanItem,
  onVetoTechnicalPlanItem,
  onUpdateTechnicalPlanItems
}: TaskTechnicalPlanProps) {
  return (
    <ItemSection
      title="Technical Plan"
      description="How the requirements will be implemented. Approve steps that have been completed."
      sectionKey="technicalPlan"
      itemsKey="technicalPlanItems"
      task={task}
      items={task.technicalPlanItems || []}
      rawText={task.technicalPlan || ''}
      onApproveItem={onApproveTechnicalPlanItem}
      onVetoItem={onVetoTechnicalPlanItem}
      onUpdateItems={onUpdateTechnicalPlanItems}
    />
  );
}

export default TaskTechnicalPlan;