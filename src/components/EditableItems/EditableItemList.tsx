import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaPlus, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

// Import API functions for proper integration
import { updateRequirementItem, deleteRequirementItem } from '@/services/taskApiService';

interface EditableItemWithStatus {
  content: string;
  approved?: boolean;
  id?: string;
  status?: 'proposed' | 'approved';
}

interface EditableItemListProps {
  items: string[];
  label: string;
  onUpdate: (newItems: string[]) => void;
  taskId?: string; // Add taskId for API integration
}

const EditableItemList: React.FC<EditableItemListProps> = ({
  items = [],
  label,
  onUpdate,
  taskId
}) => {
  // Convert string items to enhanced items with approval status
  const [parsedItems, setParsedItems] = useState<EditableItemWithStatus[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemValue, setNewItemValue] = useState('');
  
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const newInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Convert string items to items with status on initial render and when items change
  useEffect(() => {
    if (Array.isArray(items)) {
      // Convert string items to objects with status
      const enhancedItems = items.map(item => ({
        content: item,
        approved: false,
        status: 'proposed' as const,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));
      setParsedItems(enhancedItems);
    } else {
      // Default to empty array
      setParsedItems([]);
    }
  }, [items]);
  
  // Auto-focus the edit input when editing starts
  useEffect(() => {
    if (editIndex !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editIndex]);
  
  // Auto-focus the new item input when adding
  useEffect(() => {
    if (isAddingNew && newInputRef.current) {
      newInputRef.current.focus();
    }
  }, [isAddingNew]);

  // Handle edit start
  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditValue(parsedItems[index].content);
  };
  
  // Handle edit save
  const handleSave = (e?: React.FocusEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event from bubbling to parent elements
    }
    
    if (editIndex === null) return;
    
    // Only update if the content has actually changed - preserve whitespace
    if (editValue !== parsedItems[editIndex].content) {
      const newItems = [...parsedItems];
      newItems[editIndex] = {
        ...newItems[editIndex],
        content: editValue
      };
      
      // Remove if completely empty (allow whitespace-only values)
      if (newItems[editIndex].content.length === 0) {
        newItems.splice(editIndex, 1);
      }
      
      setParsedItems(newItems);
      // Convert back to string array for onUpdate
      onUpdate(newItems.map(item => item.content));
    }
    
    setEditIndex(null);
    setEditValue('');
  };
  
  // Handle edit cancel
  const handleCancel = () => {
    setEditIndex(null);
    setEditValue('');
  };
  
  // Handle delete/veto
  const handleDelete = (index: number) => {
    const newItems = [...parsedItems];
    newItems.splice(index, 1);
    setParsedItems(newItems);
    onUpdate(newItems);
  };
  
  // Handle adding new item
  const handleAddNew = () => {
    setIsAddingNew(true);
    setNewItemValue('');
  };
  
  // Handle saving new item
  const handleSaveNew = (e?: React.FocusEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event from bubbling to parent elements
    }
    
    if (newItemValue.length > 0) {
      const newItem = {
        content: newItemValue,
        approved: false,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      const newItems = [...parsedItems, newItem];
      setParsedItems(newItems);
      // Convert back to string array for onUpdate
      onUpdate(newItems.map(item => item.content));
    }
    setIsAddingNew(false);
    setNewItemValue('');
  };
  
  // Handle cancel adding new item
  const handleCancelNew = () => {
    setIsAddingNew(false);
    setNewItemValue('');
  };
  
  // Handle keyboard navigation
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    // Always stop propagation to prevent affecting parent components
    e.stopPropagation();
    
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent adding a newline
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };
  
  const handleNewKeyDown = (e: React.KeyboardEvent) => {
    // Always stop propagation to prevent affecting parent components
    e.stopPropagation();
    
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent adding a newline
      handleSaveNew();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelNew();
    }
  };

  return (
    <div className="mb-4 editable-item">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-700">{label}</h4>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAddNew();
          }}
          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
          title={`Add new ${label.toLowerCase()} item`}
        >
          <FaPlus size={14} />
        </button>
      </div>
      
      <ul className="space-y-2">
        {parsedItems.map((item, index) => (
          <li key={index} className="flex items-start group relative">
            {editIndex === index ? (
              <div className="flex w-full flex-col sm:flex-row">
                <textarea
                  ref={editInputRef as React.RefObject<HTMLTextAreaElement>}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleEditKeyDown}
                  className="flex-1 w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[60px]"
                  rows={Math.max(2, (editValue.match(/\n/g) || []).length + 1)}
                />
                <div className="flex items-start mt-2 sm:mt-0 sm:ml-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSave();
                    }}
                    className="p-1 text-green-600 hover:text-green-800"
                    title="Save changes"
                  >
                    <FaCheck size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCancel();
                    }}
                    className="p-1 text-red-600 hover:text-red-800 ml-1"
                    title="Cancel editing"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div 
                  className={`flex-1 p-2 rounded hover:bg-gray-50 cursor-pointer whitespace-pre-wrap break-words ${item.approved ? 'border-l-4 border-green-500 pl-2' : ''}`}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEdit(index);
                  }}
                >
                  {item.content}
                  {item.approved && (
                    <span className="ml-2 text-green-600 text-xs">
                      (Approved)
                    </span>
                  )}
                </div>
                {!item.approved && (
                  <div className="flex ml-2">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        try {
                          // Delete locally first
                          handleDelete(index);
                          
                          // If we have a taskId, call the API to persist the change
                          if (taskId && parsedItems[index]?.id) {
                            console.log(`Vetoing item ${parsedItems[index].id} for task ${taskId}`);
                            
                            // Call the API based on the item type (determined by label)
                            if (label === 'Requirements') {
                              await deleteRequirementItem(taskId, parsedItems[index].id);
                            } else if (label === 'Technical Plan') {
                              console.log('This would call deleteTechnicalPlanItem API');
                              // Would call: await deleteTechnicalPlanItem(taskId, parsedItems[index].id);
                            } else if (label === 'Next Steps') {
                              console.log('This would call deleteNextStepItem API');
                              // Would call: await deleteNextStepItem(taskId, parsedItems[index].id);
                            }
                          } else {
                            console.log('No taskId provided - veto is local only');
                          }
                        } catch (error) {
                          console.error('Error vetoing item:', error);
                          alert('Failed to veto item. Please try again.');
                          // We'd need to refresh the list from the server to fix the state
                        }
                      }}
                      className="btn-outline-danger"
                      title="Veto item"
                    >
                      Veto
                    </button>
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        try {
                          // Apply local state change first for immediate UI feedback
                          const newItems = [...parsedItems];
                          newItems[index] = {
                            ...newItems[index],
                            approved: true,
                            status: 'approved'
                          };
                          setParsedItems(newItems);
                          
                          // If we have a taskId, call the API to persist the change
                          if (taskId && newItems[index].id) {
                            console.log(`Approving item ${newItems[index].id} for task ${taskId}`);
                            
                            // Call the API based on the item type (determined by label)
                            if (label === 'Requirements') {
                              await updateRequirementItem(taskId, newItems[index].id, 'approved');
                            } else if (label === 'Technical Plan') {
                              console.log('This would call updateTechnicalPlanItem API');
                              // Would call: await updateTechnicalPlanItem(taskId, newItems[index].id, 'approved');
                            } else if (label === 'Next Steps') {
                              console.log('This would call updateNextStepItem API');
                              // Would call: await updateNextStepItem(taskId, newItems[index].id, 'approved');
                            }
                          } else {
                            console.log('No taskId provided - approval is local only');
                          }
                          
                          // Convert back to string array for onUpdate
                          onUpdate(newItems.map(item => item.content));
                        } catch (error) {
                          console.error('Error approving item:', error);
                          // Revert the optimistic update if the API call fails
                          alert('Failed to approve item. Please try again.');
                        }
                      }}
                      className="ml-1 btn-outline-success"
                      title="Approve item"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
        
        {isAddingNew && (
          <li className="flex items-start">
            <div className="flex w-full flex-col sm:flex-row">
              <textarea
                ref={newInputRef as React.RefObject<HTMLTextAreaElement>}
                value={newItemValue}
                onChange={(e) => setNewItemValue(e.target.value)}
                onBlur={handleSaveNew}
                onKeyDown={handleNewKeyDown}
                placeholder={`Enter new ${label.toLowerCase()} item...`}
                className="flex-1 w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[60px]"
                rows={Math.max(2, (newItemValue.match(/\n/g) || []).length + 1)}
              />
              <div className="flex items-start mt-2 sm:mt-0 sm:ml-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSaveNew();
                  }}
                  className="p-1 text-green-600 hover:text-green-800"
                  title="Save new item"
                >
                  <FaCheck size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCancelNew();
                  }}
                  className="p-1 text-red-600 hover:text-red-800 ml-1"
                  title="Cancel adding"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </div>
          </li>
        )}
        
        {parsedItems.length === 0 && !isAddingNew && (
          <li className="text-gray-500 italic p-2">
            No {label.toLowerCase()} items. Click the + button to add one.
          </li>
        )}
      </ul>
    </div>
  );
};

export default EditableItemList;