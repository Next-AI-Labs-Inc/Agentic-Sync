import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaPlus, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

interface EditableItemListProps {
  items: string[];
  label: string;
  onUpdate: (newItems: string[]) => void;
}

const EditableItemList: React.FC<EditableItemListProps> = ({
  items = [],
  label,
  onUpdate
}) => {
  // Parse items from string if it's in a list format
  const [parsedItems, setParsedItems] = useState<string[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemValue, setNewItemValue] = useState('');
  
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const newInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Parse the items on initial render and when items change
  useEffect(() => {
    if (Array.isArray(items)) {
      setParsedItems(items);
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
    setEditValue(parsedItems[index]);
  };
  
  // Handle edit save
  const handleSave = () => {
    if (editIndex === null) return;
    
    const newItems = [...parsedItems];
    newItems[editIndex] = editValue.trim();
    
    // Remove if empty
    if (!newItems[editIndex]) {
      newItems.splice(editIndex, 1);
    }
    
    setParsedItems(newItems);
    onUpdate(newItems);
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
  const handleSaveNew = () => {
    if (newItemValue.trim()) {
      const newItems = [...parsedItems, newItemValue.trim()];
      setParsedItems(newItems);
      onUpdate(newItems);
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
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
  const handleNewKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveNew();
    } else if (e.key === 'Escape') {
      handleCancelNew();
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-700">{label}</h4>
        <button
          onClick={handleAddNew}
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
                    onClick={handleSave}
                    className="p-1 text-green-600 hover:text-green-800"
                    title="Save changes"
                  >
                    <FaCheck size={14} />
                  </button>
                  <button
                    onClick={handleCancel}
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
                  className="flex-1 p-2 rounded hover:bg-gray-50 cursor-pointer whitespace-pre-wrap break-words"
                  onClick={() => handleEdit(index)}
                >
                  {item}
                </div>
                <div className="flex ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(index)}
                    className="p-1 text-gray-600 hover:text-blue-600"
                    title="Edit item"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="p-1 text-gray-600 hover:text-red-600 ml-1"
                    title="Delete item"
                  >
                    <FaTrash size={14} />
                  </button>
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
              />
              <div className="flex items-start mt-2 sm:mt-0 sm:ml-2">
                <button
                  onClick={handleSaveNew}
                  className="p-1 text-green-600 hover:text-green-800"
                  title="Save new item"
                >
                  <FaCheck size={14} />
                </button>
                <button
                  onClick={handleCancelNew}
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