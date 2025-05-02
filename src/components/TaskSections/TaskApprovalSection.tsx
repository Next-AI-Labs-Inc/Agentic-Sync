import React from 'react';
import ApprovalItemList from '../EditableItems/ApprovalItemList';
import { ItemWithStatus } from '@/types';

/**
 * TaskApprovalSection Component
 * 
 * This component encapsulates an approval section within a task, providing a consistent
 * interface for displaying and interacting with approval items (requirements, technical plan, or next steps).
 * 
 * User Experience:
 * - In interactive mode, users can add, edit, approve, and veto items
 * - In readOnly mode, users see the same visual layout but with non-functional buttons
 * - When users view a task in list view, they get fully functional approval buttons
 * - When users view a task in detail view, they see disabled buttons that visually indicate
 *   they're in view-only mode
 */
interface TaskApprovalSectionProps {
  label: string;                     // Section title (e.g., "Requirements", "Technical Plan", "Next Steps")
  sectionKey: string;                // Unique identifier for this section type
  items: ItemWithStatus[] | undefined; // The list of items to display
  taskId: string;                   // ID of the parent task
  onUpdateItems: (taskId: string, newItems: ItemWithStatus[]) => void; // Handler to update all items
  onApproveItem: (taskId: string, itemId: string) => void; // Handler to approve a specific item
  onVetoItem: (taskId: string, itemId: string) => void;   // Handler to veto (remove) a specific item
  isVisible: boolean;               // Whether this section should be displayed
  setEditingSections?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>; // Optional state setter
  readOnly?: boolean;               // Whether the component should be in read-only mode
}

const TaskApprovalSection: React.FC<TaskApprovalSectionProps> = ({
  label,
  sectionKey,
  items,
  taskId,
  onUpdateItems,
  onApproveItem,
  onVetoItem,
  isVisible,
  setEditingSections,
  readOnly = false,
}) => {
  if (!isVisible || !items) return null;
  
  return (
    <div 
      id={`${sectionKey}-${taskId}`} 
      className="mt-4 text-base block" 
      style={{display: 'block'}} 
      onClick={(e) => e.stopPropagation()}
    >
      <ApprovalItemList
        label={label}
        items={items}
        readOnly={readOnly}
        onUpdate={(newItems) => {
          console.log('TASK_SECTION: onUpdate called with items:', newItems);
          console.log('TASK_SECTION: calling onUpdateItems with taskId:', taskId);
          onUpdateItems(taskId, newItems);
          
          // If items are empty, reset editing state for this section
          if (setEditingSections && newItems.length === 0) {
            console.log('TASK_SECTION: Resetting editing section state for:', sectionKey);
            setEditingSections(prev => ({
              ...prev,
              [sectionKey]: false
            }));
          }
        }}
        onApprove={(itemId) => {
          console.log('TASK_SECTION: onApprove called with itemId:', itemId);
          console.log('TASK_SECTION: calling onApproveItem with taskId:', taskId, 'and itemId:', itemId);
          console.log('TASK_SECTION: onApproveItem type:', typeof onApproveItem);
          onApproveItem(taskId, itemId);
        }}
        onVeto={(itemId) => {
          console.log('TASK_SECTION: onVeto called with itemId:', itemId);
          console.log('TASK_SECTION: calling onVetoItem with taskId:', taskId, 'and itemId:', itemId);
          console.log('TASK_SECTION: onVetoItem type:', typeof onVetoItem);
          onVetoItem(taskId, itemId);
        }}
      />
    </div>
  );
};

export default TaskApprovalSection;