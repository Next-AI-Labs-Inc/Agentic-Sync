/**
 * Data Model Item Component
 * 
 * A configurable component for displaying a single item from any data model.
 * Adapts its display based on the data model configuration.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { DataItem, useDataModel } from './DataModelProvider';
import { DataModelConfig } from '@/config/dataModels/baseConfig';

interface DataModelItemProps<T extends DataItem> {
  item: T;
  config?: DataModelConfig; // Optional - will use context if not provided
  onClick?: (item: T) => void;
  onStatusChange?: (item: T, newStatus: string) => Promise<void>;
  onDelete?: (item: T) => void;
  isSelected?: boolean;
  showActions?: boolean;
  className?: string;
}

export default function DataModelItem<T extends DataItem>({
  item,
  config: propConfig,
  onClick,
  onStatusChange,
  onDelete,
  isSelected = false,
  showActions = true,
  className = ''
}: DataModelItemProps<T>) {
  const { config: contextConfig, updateItemStatus } = useDataModel<T>();
  const config = propConfig || contextConfig;
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  
  // Get status display configuration if available
  const getStatusDisplay = () => {
    if (!config.statuses || !item.status) return null;
    
    const statusConfig = config.statuses.display?.[item.status];
    if (!statusConfig) return null;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
    );
  };
  
  // Get field value with proper formatting
  const getFieldValue = (field: string) => {
    if (!item[field]) return null;
    
    const fieldConfig = config.model.fields[field];
    if (!fieldConfig) return String(item[field]);
    
    // Format based on field type
    switch (fieldConfig.type) {
      case 'Date':
        return new Date(item[field]).toLocaleString();
      case 'Array':
        if (Array.isArray(item[field])) {
          return item[field].join(', ');
        }
        return String(item[field]);
      default:
        return String(item[field]);
    }
  };
  
  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    if (onStatusChange) {
      await onStatusChange(item, newStatus);
    } else if (updateItemStatus) {
      await updateItemStatus(item.id, newStatus);
    }
    setIsMenuOpen(false);
  };
  
  // Handle delete
  const handleDelete = () => {
    if (isConfirmingDelete) {
      if (onDelete) {
        onDelete(item);
      }
      setIsConfirmingDelete(false);
    } else {
      setIsConfirmingDelete(true);
    }
  };
  
  // Build actions menu if available
  const renderActions = () => {
    if (!showActions) return null;
    
    const actions = [];
    
    // Add view/edit actions
    actions.push(
      <Link
        key="view"
        href={`${config.routes.base}${config.routes.detail.replace(':id', item.id)}`}
        className="text-indigo-600 hover:text-indigo-900"
      >
        View
      </Link>
    );
    
    actions.push(
      <Link
        key="edit"
        href={`${config.routes.base}${config.routes.edit.replace(':id', item.id)}`}
        className="text-indigo-600 hover:text-indigo-900"
      >
        Edit
      </Link>
    );
    
    // Add status change actions if applicable
    if (config.statuses && item.status && config.statuses.transitions?.[item.status]) {
      const nextStatus = config.statuses.transitions[item.status];
      const actionText = config.statuses.actions?.[item.status] || `Move to ${nextStatus}`;
      
      actions.push(
        <button
          key="status"
          onClick={() => handleStatusChange(nextStatus)}
          className="text-green-600 hover:text-green-900"
        >
          {actionText}
        </button>
      );
    }
    
    // Add delete action
    actions.push(
      <button
        key="delete"
        onClick={handleDelete}
        className={`${isConfirmingDelete ? 'text-red-600 font-bold' : 'text-gray-600'} hover:text-red-900`}
      >
        {isConfirmingDelete ? 'Confirm Delete' : 'Delete'}
      </button>
    );
    
    return (
      <div className="flex items-center space-x-4 mt-2">
        {actions.map((action, i) => (
          <React.Fragment key={`action-${i}`}>
            {action}
            {i < actions.length - 1 && <span className="text-gray-300">|</span>}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  // Determine which fields to display
  const primaryField = config.ui.listView.primaryField || 'title';
  const secondaryField = config.ui.listView.secondaryField;
  const tertiaryField = config.ui.listView.tertiaryField;
  
  // Build the card content
  return (
    <div 
      className={`border rounded-lg p-4 ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'} ${className}`}
      onClick={() => onClick && onClick(item)}
    >
      <div className="flex justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          {getFieldValue(primaryField)}
        </h3>
        {getStatusDisplay()}
      </div>
      
      {secondaryField && item[secondaryField] && (
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {getFieldValue(secondaryField)}
        </p>
      )}
      
      {tertiaryField && item[tertiaryField] && tertiaryField !== 'status' && (
        <p className="mt-1 text-xs text-gray-500">
          {getFieldValue(tertiaryField)}
        </p>
      )}
      
      {renderActions()}
    </div>
  );
}