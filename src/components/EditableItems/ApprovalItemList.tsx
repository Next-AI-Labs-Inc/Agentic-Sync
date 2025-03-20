import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaPlus, FaTrash, FaCheck, FaTimes, FaCheckCircle, FaBan } from 'react-icons/fa';
import { ItemWithStatus } from '@/types';

interface ApprovalItemListProps {
  items: ItemWithStatus[];
  label: string;
  onUpdate: (newItems: ItemWithStatus[]) => void;
  onApprove: (itemId: string) => void;
  onVeto: (itemId: string) => void;
}

const ApprovalItemList: React.FC<ApprovalItemListProps> = ({
  items = [],
  label,
  onUpdate,
  onApprove,
  onVeto
}) => {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemValue, setNewItemValue] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [processingApprove, setProcessingApprove] = useState<string | null>(null);
  const [processingVeto, setProcessingVeto] = useState<string | null>(null);
  
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const newInputRef = useRef<HTMLTextAreaElement>(null);
  
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

  // Handle item selection
  const handleSelectItem = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedItemId(id === selectedItemId ? null : id);
  };

  // Handle edit start (double click)
  const handleEdit = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditIndex(index);
    setEditValue(items[index].content);
  };
  
  // Handle edit save
  const handleSave = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event from bubbling to parent elements
    }
    
    if (editIndex === null) return;
    
    // Only update if the content has actually changed - preserve whitespace
    if (editValue !== items[editIndex].content) {
      const newItems = [...items];
      newItems[editIndex] = {
        ...newItems[editIndex],
        content: editValue,
        updatedAt: new Date().toISOString()
      };
      
      // Remove if completely empty (allow whitespace-only values)
      if (newItems[editIndex].content.length === 0) {
        newItems.splice(editIndex, 1);
      }
      
      onUpdate(newItems);
    }
    
    setEditIndex(null);
    setEditValue('');
  };
  
  // Handle edit cancel
  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEditIndex(null);
    setEditValue('');
  };
  
  // Handle approve
  const handleApprove = (itemId: string) => async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set processing state
    setProcessingApprove(itemId);
    
    try {
      await onApprove(itemId);
    } catch (error) {
      // Log the error but don't crash
      console.error('Error approving item:', error);
    } finally {
      // Reset processing state
      setProcessingApprove(null);
    }
  };
  
  // Handle veto (delete)
  const handleVeto = (itemId: string) => async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set processing state
    setProcessingVeto(itemId);
    
    try {
      await onVeto(itemId);
    } catch (error) {
      // Log the error but don't crash
      console.error('Error vetoing item:', error);
    } finally {
      // Reset processing state
      setProcessingVeto(null);
    }
  };
  
  // Handle adding new item
  const handleAddNew = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingNew(true);
    setNewItemValue('');
  };
  
  // Handle saving new item
  const handleSaveNew = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event from bubbling to parent elements
    }
    
    if (newItemValue.length > 0) {
      const now = new Date().toISOString();
      const newItem: ItemWithStatus = {
        content: newItemValue,
        status: 'proposed',
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now
      };
      
      onUpdate([...items, newItem]);
    }
    setIsAddingNew(false);
    setNewItemValue('');
  };
  
  // Handle cancel adding new item
  const handleCancelNew = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsAddingNew(false);
    setNewItemValue('');
  };
  
  // Handle keyboard navigation for editing
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    // Always stop propagation to prevent affecting parent components
    e.stopPropagation();
    
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault(); // Prevent adding a newline
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };
  
  // Handle keyboard navigation for new items
  const handleNewKeyDown = (e: React.KeyboardEvent) => {
    // Always stop propagation to prevent affecting parent components
    e.stopPropagation();
    
    if (e.key === 'Enter' && e.ctrlKey) {
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
          onClick={handleAddNew}
          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
          title={`Add new ${label.toLowerCase()} item`}
          data-testid="add-item-btn"
        >
          <FaPlus size={14} />
        </button>
      </div>
      
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li 
            key={item.id} 
            className={`flex items-start group relative transition-colors ${
              selectedItemId === item.id ? 'bg-gray-100' : ''
            } ${
              item.status === 'approved' ? 'border-l-4 border-green-500 pl-2' : ''
            }`}
          >
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
                  data-testid="edit-textarea"
                />
                <div className="flex items-start mt-2 sm:mt-0 sm:ml-2">
                  <button
                    onClick={handleSave}
                    className="p-1 text-green-600 hover:text-green-800"
                    title="Save changes"
                    data-testid="save-edit-btn"
                  >
                    <FaCheck size={14} />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-1 text-red-600 hover:text-red-800 ml-1"
                    title="Cancel editing"
                    data-testid="cancel-edit-btn"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div 
                  className={`flex-1 p-2 rounded hover:bg-gray-50 cursor-pointer whitespace-pre-wrap break-words ${
                    item.status === 'approved' ? 'text-gray-800' : 'text-gray-600'
                  } ${selectedItemId === item.id ? 'bg-gray-100' : ''}`}
                  onClick={handleSelectItem(item.id)}
                  onDoubleClick={handleEdit(index)}
                  data-testid={`item-content-${index}`}
                >
                  {item.content}
                  {item.status === 'approved' && (
                    <span className="ml-2 text-green-600 text-xs" data-testid="approved-badge">
                      (Approved)
                    </span>
                  )}
                </div>
                <div className="flex ml-2">
                  {/* For proposed items, show Approve and Veto buttons */}
                  {item.status === 'proposed' && (
                    <>
                      <button
                        onClick={handleApprove(item.id)}
                        className="btn-outline-primary"
                        title="Approve item"
                        data-testid={`approve-btn-${index}`}
                        disabled={processingApprove === item.id}
                      >
                        {processingApprove === item.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={handleVeto(item.id)}
                        className="ml-1 btn-outline-danger"
                        title="Veto (remove) item"
                        data-testid={`veto-btn-${index}`}
                        disabled={processingVeto === item.id}
                      >
                        {processingVeto === item.id ? 'Processing...' : 'Veto'}
                      </button>
                    </>
                  )}
                  
                  {/* Approved items don't show any buttons */}
                </div>
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
                data-testid="new-item-textarea"
              />
              <div className="flex items-start mt-2 sm:mt-0 sm:ml-2">
                <button
                  onClick={handleSaveNew}
                  className="p-1 text-green-600 hover:text-green-800"
                  title="Save new item"
                  data-testid="save-new-btn"
                >
                  <FaCheck size={14} />
                </button>
                <button
                  onClick={handleCancelNew}
                  className="p-1 text-red-600 hover:text-red-800 ml-1"
                  title="Cancel adding"
                  data-testid="cancel-new-btn"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </div>
          </li>
        )}
        
        {items.length === 0 && !isAddingNew && (
          <li className="text-gray-500 italic p-2" data-testid="empty-message">
            No {label.toLowerCase()} items. Click the + button to add one.
          </li>
        )}
      </ul>
      
      {/* Help text */}
      <div className="mt-2 text-xs text-gray-500 block">
        <p>• Single click to select an item</p>
        <p>• Double click to edit an item</p>
        <p>• Press Ctrl+Enter to save while editing</p>
      </div>
    </div>
  );
};

export default ApprovalItemList;