import React from 'react';
import { ItemWithStatus } from '@/types';
import { getProgressPercentage, countItemsByStatus } from './helpers';
import EditableItemList from '../EditableItems/EditableItemList';

export interface ItemSectionProps {
  title: string;
  description?: string;
  sectionKey: 'requirements' | 'technicalPlan' | 'nextSteps';
  itemsKey: 'requirementItems' | 'technicalPlanItems' | 'nextStepItems';
  task: any;
  items?: ItemWithStatus[];
  rawText?: string;
  onApproveItem?: (taskId: string, itemId: string) => Promise<void>;
  onVetoItem?: (taskId: string, itemId: string) => Promise<void>;
  onUpdateItems?: (taskId: string, items: ItemWithStatus[]) => Promise<void>;
}

/**
 * Common component for item sections (requirements, technical plan, next steps)
 * with progress tracking and approval functionality
 */
function ItemSection({
  title,
  description,
  sectionKey,
  itemsKey,
  task,
  items = [],
  rawText = '',
  onApproveItem,
  onVetoItem,
  onUpdateItems
}: ItemSectionProps) {
  // Count approvals
  const counts = countItemsByStatus(items);
  const progress = getProgressPercentage(items);
  
  return (
    <div className={`${sectionKey}-section mb-4 px-4`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold">{title}</h4>
        
        {/* Progress stats */}
        {items.length > 0 && (
          <div className="text-xs text-gray-500">
            {counts.approved}/{counts.total} approved
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      {items.length > 0 && (
        <div className="w-full h-1 bg-gray-200 rounded-full mb-3">
          <div
            className="h-1 bg-green-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {/* Description */}
      {description && <p className="text-sm text-gray-600 mb-2">{description}</p>}
      
      {/* Items list */}
      <EditableItemList
        taskId={task.id}
        items={items}
        rawText={rawText || task[sectionKey] || ''}
        onApproveItem={onApproveItem}
        onVetoItem={onVetoItem}
        onUpdateItems={onUpdateItems}
      />
    </div>
  );
}

export default ItemSection;