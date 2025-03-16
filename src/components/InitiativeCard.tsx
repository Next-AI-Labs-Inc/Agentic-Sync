import React, { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { FaTrash, FaPencilAlt, FaEye, FaInfoCircle, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { Initiative } from '@/types';

interface InitiativeCardProps {
  initiative: Initiative;
  onDelete?: (id: number) => Promise<void>;
  onEdit?: (initiative: Initiative) => void;
  onUpdateStatus?: (id: number, status: Initiative['status']) => Promise<void>;
  onUpdatePriority?: (id: number, priority: Initiative['priority']) => Promise<void>;
}

// Reusable Popover Component similar to TaskCard
interface PopoverProps {
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  children: React.ReactNode;
  className?: string;
}

function Popover({ content, position = 'top', children, className = '' }: PopoverProps) {
  const [isVisible, setIsVisible] = useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const showPopover = () => setIsVisible(true);
  const hidePopover = () => setIsVisible(false);

  // Basic positioning without complex calculations for simplicity
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return {
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%) translateY(-8px)'
        };
      case 'right':
        return {
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%) translateX(8px)'
        };
      case 'bottom':
        return {
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%) translateY(8px)'
        };
      case 'left':
        return {
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%) translateX(-8px)'
        };
      default:
        return {
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%) translateY(-8px)'
        };
    }
  };

  return (
    <div
      className={`popover-trigger ${className}`}
      ref={triggerRef}
      onMouseEnter={showPopover}
      onMouseLeave={hidePopover}
    >
      {children}
      <div
        ref={popoverRef}
        className={`popover ${isVisible ? 'show' : ''}`}
        style={{ 
          position: 'absolute', 
          zIndex: 1000, 
          width: 'max-content', 
          maxWidth: '250px',
          padding: '0.5rem',
          background: 'white',
          borderRadius: '0.375rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          opacity: isVisible ? 1 : 0,
          visibility: isVisible ? 'visible' : 'hidden',
          transition: 'opacity 0.2s ease, visibility 0.2s ease',
          ...getPositionStyles()
        }}
      >
        <div className="popover-arrow" style={{
          position: 'absolute',
          width: '8px',
          height: '8px',
          background: 'white',
          transform: 'rotate(45deg)',
          borderLeft: position === 'right' ? '1px solid #e2e8f0' : 'none',
          borderBottom: position === 'top' ? '1px solid #e2e8f0' : 'none',
          borderTop: position === 'bottom' ? '1px solid #e2e8f0' : 'none',
          borderRight: position === 'left' ? '1px solid #e2e8f0' : 'none',
          ...(position === 'top' ? { bottom: '-4px', left: '50%', marginLeft: '-4px' } :
             position === 'right' ? { left: '-4px', top: '50%', marginTop: '-4px' } :
             position === 'bottom' ? { top: '-4px', left: '50%', marginLeft: '-4px' } :
             { right: '-4px', top: '50%', marginTop: '-4px' })
        }}></div>
        <div>{content}</div>
      </div>
    </div>
  );
}

export default function InitiativeCard({ 
  initiative, 
  onDelete, 
  onEdit,
  onUpdateStatus,
  onUpdatePriority
}: InitiativeCardProps) {
  // Start collapsed by default
  const [expanded, setExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isNew, setIsNew] = useState(false);
  
  // Clear the new flag after animation completes
  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => {
        setIsNew(false);
      }, 1000); // Matches animation duration
      return () => clearTimeout(timer);
    }
  }, [isNew]);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on-hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion
    if (onDelete) {
      setIsDeleting(true); // Start the delete animation
      
      // Wait for animation to start before actually deleting
      setTimeout(() => {
        onDelete(initiative.id);
      }, 100);
    }
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion
    if (onEdit) {
      onEdit(initiative);
    }
  };

  const handleCardClick = () => {
    setExpanded(!expanded);
  };
  
  const handleUpdateStatus = (status: Initiative['status']) => (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion
    if (onUpdateStatus) {
      onUpdateStatus(initiative.id, status);
    }
  };
  
  const handleUpdatePriority = (priority: Initiative['priority']) => (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion
    if (onUpdatePriority) {
      onUpdatePriority(initiative.id, priority);
    }
  };
  
  // Render status action buttons
  const renderStatusActions = () => {
    const availableStatuses: Initiative['status'][] = ['not-started', 'planning', 'in-progress', 'completed', 'on-hold'];
    
    // Filter out current status
    const otherStatuses = availableStatuses.filter(status => status !== initiative.status);
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {otherStatuses.map(status => (
          <Popover
            key={`status-${status}`}
            content={
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Update Status</h4>
                <p className="text-xs text-gray-600">
                  Change initiative status to {status.replace('-', ' ')}
                </p>
              </div>
            }
            position="top"
          >
            <button
              onClick={handleUpdateStatus(status)}
              className="px-2 py-1 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              → {status.replace('-', ' ')}
            </button>
          </Popover>
        ))}
      </div>
    );
  };
  
  // Render priority action buttons
  const renderPriorityActions = () => {
    const availablePriorities: Initiative['priority'][] = ['high', 'medium', 'low'];
    
    // Filter out current priority
    const otherPriorities = availablePriorities.filter(priority => priority !== initiative.priority);
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {otherPriorities.map(priority => (
          <Popover
            key={`priority-${priority}`}
            content={
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Update Priority</h4>
                <p className="text-xs text-gray-600">
                  Change initiative priority to {priority}
                </p>
              </div>
            }
            position="top"
          >
            <button
              onClick={handleUpdatePriority(priority)}
              className={`px-2 py-1 rounded text-xs font-medium hover:opacity-80 transition-colors ${
                priority === 'high' ? 'bg-red-50 text-red-700' : 
                priority === 'medium' ? 'bg-yellow-50 text-yellow-700' : 
                'bg-blue-50 text-blue-700'
              }`}
            >
              {priority === 'high' ? <FaArrowUp className="inline mr-1" size={10} /> : 
               priority === 'low' ? <FaArrowDown className="inline mr-1" size={10} /> : null}
              {priority}
            </button>
          </Popover>
        ))}
      </div>
    );
  };
  
  return (
    <div 
      className={`initiative-card ${
        initiative.status === 'completed' ? 'bg-gray-50' : 'bg-white'
      } ${isNew ? 'animate-fade-in border-l-4 border-l-blue-500' : ''} 
      ${isDeleting ? 'fade-out pointer-events-none' : ''}
      rounded-lg shadow-sm border border-gray-200 transition-all duration-200 cursor-pointer`}
      onClick={handleCardClick}
    >
      <div className="p-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <h3 className={`text-lg font-medium ${
                initiative.status === 'completed' ? 'text-gray-500' : ''
              }`}>
                {initiative.name}
              </h3>
              <Popover
                content={
                  <div className="w-72">
                    <h4 className="font-medium text-gray-900 mb-1">Initiative Details</h4>
                    <div className="text-gray-600 mb-2">
                      <p className="mb-1">{initiative.description || 'No description provided'}</p>
                      <p className="text-xs mt-2">Created {formatTimeAgo(initiative.createdAt)}</p>
                      <p className="text-xs">Updated {formatTimeAgo(initiative.updatedAt)}</p>
                      {initiative.completedAt && (
                        <p className="text-xs">Completed {formatTimeAgo(initiative.completedAt)}</p>
                      )}
                    </div>
                  </div>
                }
                position="top"
              >
                <FaInfoCircle className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer" />
              </Popover>
            </div>

            <div className="flex items-center space-x-1">
              {/* Priority badge with popover */}
              <Popover
                content={
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Priority: {initiative.priority}</h4>
                    <p className="text-xs text-gray-600">
                      {initiative.priority === 'high'
                        ? 'High priority initiatives need immediate attention'
                        : initiative.priority === 'medium'
                        ? 'Medium priority initiatives should be addressed soon'
                        : 'Low priority initiatives can be addressed when time permits'}
                    </p>
                  </div>
                }
                position="top"
              >
                <span className={`badge ${getPriorityBadgeClass(initiative.priority)}`}>
                  {initiative.priority}
                </span>
              </Popover>

              {/* Status badge with popover */}
              <Popover
                content={
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Status: {initiative.status}</h4>
                    <p className="text-xs text-gray-600">
                      {initiative.status === 'not-started' && 'Initiative has been created but not started yet'}
                      {initiative.status === 'planning' && 'Initiative is in the planning phase'}
                      {initiative.status === 'in-progress' && 'Initiative is currently being worked on'}
                      {initiative.status === 'completed' && 'Initiative has been completed'}
                      {initiative.status === 'on-hold' && 'Initiative is temporarily on hold'}
                    </p>
                  </div>
                }
                position="top"
              >
                <span className={`badge ${getStatusBadgeClass(initiative.status)}`}>
                  {initiative.status}
                </span>
              </Popover>
            </div>
          </div>

          {/* Description (always visible) */}
          {initiative.description && (
            <div className={`text-sm text-gray-600 ${expanded ? '' : 'line-clamp-2'}`}>
              {initiative.description}
            </div>
          )}

          {/* Dates and timeframes */}
          <div className="mt-1 text-sm text-gray-500">
            {initiative.startDate && (
              <span className="mr-3">
                Started {formatTimeAgo(initiative.startDate)}
              </span>
            )}
            {initiative.targetDate && (
              <>
                <span>·</span>
                <span className="mx-2">Target {formatTimeAgo(initiative.targetDate)}</span>
              </>
            )}
            
            <span>·</span>
            <span className="mx-2">Updated {formatTimeAgo(initiative.updatedAt)}</span>
            
            {initiative.status === 'completed' && initiative.completedAt && (
              <>
                <span>·</span>
                <span className="mx-2">Completed {formatTimeAgo(initiative.completedAt)}</span>
              </>
            )}
          </div>

          {/* Action buttons - always visible */}
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="btn-outline-primary"
              >
                <FaPencilAlt className="mr-1" size={12} />
                Edit
              </button>
            )}
            
            {expanded && (
              <button
                onClick={() => setExpanded(false)}
                className="btn-outline-secondary"
              >
                <FaEye className="mr-1" size={12} />
                Collapse
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={handleDelete}
                className="btn-outline-danger"
              >
                <FaTrash className="mr-1" size={12} />
                Delete
              </button>
            )}
          </div>
          
          {/* Status and priority change buttons - show when not expanded */}
          {!expanded && (
            <div className="mt-2">
              {onUpdateStatus && renderStatusActions()}
              {onUpdatePriority && renderPriorityActions()}
            </div>
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          {/* Key risks */}
          {initiative.keyRisks && initiative.keyRisks.length > 0 && (
            <div className="mt-4 text-sm">
              <h4 className="font-medium text-gray-700 mb-1">Key Risks</h4>
              <ul className="list-disc pl-5 text-gray-600">
                {initiative.keyRisks.map((risk, index) => (
                  <li key={index}>{risk}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Tags */}
          {initiative.tags && initiative.tags.length > 0 && (
            <div className="mt-4 text-sm">
              <h4 className="font-medium text-gray-700 mb-1">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {initiative.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Linked projects */}
          {initiative.linkedProjects && initiative.linkedProjects.length > 0 && (
            <div className="mt-4 text-sm">
              <h4 className="font-medium text-gray-700 mb-1">Linked Projects</h4>
              <div className="flex flex-wrap gap-1">
                {initiative.linkedProjects.map(project => (
                  <span key={project} className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs">
                    {project}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Status and priority change options - show when expanded */}
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-1">Update Status</h4>
            {onUpdateStatus && renderStatusActions()}
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-1">Change Priority</h4>
            {onUpdatePriority && renderPriorityActions()}
          </div>
          
          {/* Creation details - all in relative time */}
          <div className="mt-4 text-xs text-gray-500">
            <p>Created {formatTimeAgo(initiative.createdAt)}</p>
            <p>Last updated {formatTimeAgo(initiative.updatedAt)}</p>
            {initiative.completedAt && <p>Completed {formatTimeAgo(initiative.completedAt)}</p>}
          </div>
        </div>
      )}
    </div>
  );
}