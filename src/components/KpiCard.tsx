import React, { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { FaTrash, FaPencilAlt } from 'react-icons/fa';
import { KPI } from '@/types';

interface KpiCardProps {
  kpi: KPI;
  onDelete?: (id: number) => Promise<void>;
  onEdit?: (kpi: KPI) => void;
}

export default function KpiCard({ kpi, onDelete, onEdit }: KpiCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    // If target and current values are numbers, calculate percentage
    const current = parseFloat(kpi.currentValue);
    const target = parseFloat(kpi.targetValue);
    
    if (isNaN(current) || isNaN(target) || target === 0) {
      return 0;
    }
    
    // Handle both increasing and decreasing targets
    // If current > target, we may be trying to decrease a metric (like bug resolution time)
    if (current < target) {
      return Math.min(100, (current / target) * 100);
    } else {
      return Math.min(100, (target / current) * 100);
    }
  };
  
  const getProgressColor = () => {
    const progress = calculateProgress();
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion
    if (onDelete) {
      // No confirmation dialog - delete immediately
      await onDelete(kpi.id);
    }
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion
    if (onEdit) {
      onEdit(kpi);
    }
  };

  const handleCardClick = () => {
    setExpanded(!expanded);
  };
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 ${hovering ? 'shadow-md' : ''} cursor-pointer`}
      onClick={handleCardClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{kpi.name}</h3>
          
          <span className={`badge ${getStatusBadgeClass(kpi.status)}`}>
            {kpi.status}
          </span>
        </div>
        
        <p className={`mt-2 text-sm text-gray-600 ${!expanded ? 'line-clamp-2' : ''}`}>
          {kpi.description}
        </p>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress: {kpi.currentValue} / {kpi.targetValue} {kpi.unit}</span>
            <span>{calculateProgress().toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${getProgressColor()}`} 
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-gray-500">
          <span>Updated {formatTimeAgo(kpi.lastUpdated)}</span>
          {kpi.nextReview && (
            <span className="ml-3">
              Next review: {formatDate(kpi.nextReview)}
            </span>
          )}
        </div>

        {/* Quick action buttons that appear on hover when not expanded */}
        {hovering && !expanded && (onDelete || onEdit) && (
          <div className="mt-3 flex justify-end space-x-2">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-medium flex items-center hover:bg-blue-200 transition-colors"
              >
                <FaPencilAlt className="mr-1" size={12} />
                Edit
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={handleDelete}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm font-medium flex items-center hover:bg-red-200 transition-colors"
              >
                <FaTrash className="mr-1" size={12} />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-100">
          {/* Target info */}
          <div className="mt-4 text-sm">
            <h4 className="font-medium text-gray-700 mb-1">Target</h4>
            <p className="text-gray-600">{kpi.target}</p>
          </div>
          
          {/* Frequency info */}
          <div className="mt-4 text-sm">
            <h4 className="font-medium text-gray-700 mb-1">Frequency</h4>
            <p className="text-gray-600">Measured {kpi.frequency}</p>
          </div>
          
          {/* Owner info */}
          {kpi.owner && (
            <div className="mt-4 text-sm">
              <h4 className="font-medium text-gray-700 mb-1">Owner</h4>
              <p className="text-gray-600">{kpi.owner}</p>
            </div>
          )}
          
          {/* Tags */}
          {kpi.tags && kpi.tags.length > 0 && (
            <div className="mt-4 text-sm">
              <h4 className="font-medium text-gray-700 mb-1">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {kpi.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Last update */}
          <div className="mt-4 text-xs text-gray-500">
            <p>Last updated: {formatDate(kpi.lastUpdated)}</p>
          </div>
          
          {/* Action buttons */}
          {(onDelete || onEdit) && (
            <div className="mt-4 flex justify-end space-x-2">
              {onEdit && (
                <button
                  onClick={handleEdit}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm font-medium flex items-center hover:bg-blue-200 transition-colors"
                >
                  <FaPencilAlt className="mr-1" size={12} />
                  Edit
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-sm font-medium flex items-center hover:bg-red-200 transition-colors"
                >
                  <FaTrash className="mr-1" size={12} />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}