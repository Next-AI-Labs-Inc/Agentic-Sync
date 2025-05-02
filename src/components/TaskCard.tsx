import React, { useState, useRef, useEffect, useCallback } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  FaCheckCircle,
  FaRegCircle,
  FaTrash,
  FaCheck,
  FaArrowRight,
  FaArrowLeft,
  FaEye,
  FaInfoCircle,
  FaCog,
  FaPause,
  FaListAlt,
  FaArchive,
  FaStar,
  FaRegStar,
  FaCopy,
  FaLink
} from 'react-icons/fa';
import StatusSelector from './StatusSelector';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { Task, ItemWithStatus } from '@/types';
import DropdownMenu from './DropdownMenu';
import ApprovalItemList2 from './EditableItems/ApprovalItemList';
// Using our fixed component that properly handles undefined handlers
import AgentLauncher from './AgentLauncher';
import FeedbackForm from './FeedbackForm';
import CommandToggle from './CommandToggle';
import { ClickableId } from '@/utils/clickable-id';

// Utility function to safely get action help content
const getActionHelp = (
  statusKey: keyof typeof STATUS_ACTION_HELP | string,
  defaultTitle = 'Action',
  defaultDescription = 'Click to perform this action'
) => {
  if (!statusKey || !(statusKey in STATUS_ACTION_HELP)) {
    return { title: defaultTitle, description: defaultDescription };
  }
  return STATUS_ACTION_HELP[statusKey as keyof typeof STATUS_ACTION_HELP];
};
import { parseListString, formatBulletedList, formatNumberedList } from '@/utils/listParser';
import { POPOVER_POSITIONS, UI_STORAGE_KEYS } from '@/constants/ui';
import {
  TASK_STATUSES,
  STATUS_ACTION_HELP,
  STATUS_ACTION_TEXT,
  STATUS_COACHING
} from '@/constants/taskStatus';

/**
 * TaskCard Props Interface
 * 
 * Defines all the properties that can be passed to the TaskCard component.
 * 
 * User Experience:
 * - In interactive mode, all action buttons (status, approve, veto, etc.) are fully functional
 * - In readOnly mode (detail view), buttons are visually disabled and show tooltips indicating view-only mode
 * - Users can still view all task information in both modes
 */
interface TaskCardProps {
  task: Task;
  onStatusChange: (
    taskId: string,
    project: string,
    status:
      | 'inbox'
      | 'brainstorm'
      | 'proposed'
      | 'backlog'
      | 'maybe'
      | 'todo'
      | 'in-progress'
      | 'on-hold'
      | 'done'
      | 'reviewed'
      | 'archived'
  ) => Promise<void>;
  onMarkTested: (taskId: string, project: string) => Promise<void>;
  onDelete: (taskId: string, project: string) => Promise<void>;
  onUpdateDate?: (taskId: string, project: string, newDate: string) => Promise<void>;
  onUpdateTask?: (taskId: string, project: string, updates: Partial<Task>) => Promise<void>;
  onToggleStar?: (taskId: string, project: string) => Promise<void>;
  // Item approval functions
  onApproveRequirementItem?: (taskId: string, itemId: string) => Promise<void>;
  onVetoRequirementItem?: (taskId: string, itemId: string) => Promise<void>;
  onUpdateRequirementItems?: (taskId: string, items: ItemWithStatus[]) => Promise<void>;
  onApproveTechnicalPlanItem?: (taskId: string, itemId: string) => Promise<void>;
  onVetoTechnicalPlanItem?: (taskId: string, itemId: string) => Promise<void>;
  onUpdateTechnicalPlanItems?: (taskId: string, items: ItemWithStatus[]) => Promise<void>;
  onApproveNextStepItem?: (taskId: string, itemId: string) => Promise<void>;
  onVetoNextStepItem?: (taskId: string, itemId: string) => Promise<void>;
  onUpdateNextStepItems?: (taskId: string, items: ItemWithStatus[]) => Promise<void>;
  // Agent integration functions
  onAddFeedback?: (taskId: string, content: string) => Promise<void>;
  onLaunchAgent?: (
    taskId: string,
    mode: 'implement' | 'demo' | 'feedback',
    feedback?: string
  ) => Promise<void>;
  expanded?: boolean; // Whether the card is expanded by default
  hideExpand?: boolean; // Whether to hide the expand/collapse button
  readOnly?: boolean; // Whether the card is in read-only mode (disables approve/veto buttons)
}

// Reusable Popover Component
interface PopoverProps {
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  children: React.ReactNode;
  className?: string;
}

function Popover({ content, position = 'top', children, className = '' }: PopoverProps) {
  const [isVisible, setIsVisible] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showPopover = () => setIsVisible(true);
  const hidePopover = () => setIsVisible(false);

  // Calculate and adjust popover position to prevent cutoff
  useEffect(() => {
    if (isVisible && popoverRef.current && triggerRef.current) {
      const popover = popoverRef.current;
      const trigger = triggerRef.current;
      const container = containerRef.current;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Get element dimensions and positions
      const popoverRect = popover.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();

      // Default positions
      let style: Record<string, any> = {};
      let arrowStyle: Record<string, any> = {};

      // Adjust based on position
      switch (position) {
        case 'top':
          style = {
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-8px)'
          };
          arrowStyle = {
            bottom: '-6px',
            left: '50%',
            transform: 'translateX(-50%)'
          };

          // Check if popover would be cut off at the top
          if (triggerRect.top < popoverRect.height + 8) {
            // Switch to bottom position
            style = {
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%) translateY(8px)'
            };
            arrowStyle = {
              top: '-6px',
              left: '50%',
              transform: 'translateX(-50%)'
            };
          }

          // Check for horizontal cutoff
          if (triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2 < 0) {
            // Adjust for left edge
            style.left = '0';
            style.transform = 'translateY(-8px)';
            arrowStyle.left = triggerRect.left + triggerRect.width / 2 + 'px';
          } else if (
            triggerRect.left + triggerRect.width / 2 + popoverRect.width / 2 >
            viewportWidth
          ) {
            // Adjust for right edge
            style.left = 'auto';
            style.right = '0';
            style.transform = 'translateY(-8px)';
            arrowStyle.left =
              popoverRect.width - (viewportWidth - triggerRect.left - triggerRect.width / 2) + 'px';
          }
          break;

        case 'right':
          style = {
            top: '50%',
            left: '100%',
            transform: 'translateY(-50%) translateX(8px)'
          };
          arrowStyle = {
            left: '-6px',
            top: '50%',
            transform: 'translateY(-50%)'
          };

          // Check if popover would be cut off on the right
          if (triggerRect.right + popoverRect.width + 8 > viewportWidth) {
            // Switch to left position
            style = {
              top: '50%',
              right: '100%',
              left: 'auto',
              transform: 'translateY(-50%) translateX(-8px)'
            };
            arrowStyle = {
              right: '-6px',
              left: 'auto',
              top: '50%',
              transform: 'translateY(-50%)'
            };
          }

          // Check for vertical cutoff
          if (triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2 < 0) {
            // Adjust for top edge
            style.top = '0';
            style.transform = style.left === '100%' ? 'translateX(8px)' : 'translateX(-8px)';
            arrowStyle.top = triggerRect.top + triggerRect.height / 2 + 'px';
          } else if (
            triggerRect.top + triggerRect.height / 2 + popoverRect.height / 2 >
            viewportHeight
          ) {
            // Adjust for bottom edge
            style.top = 'auto';
            style.bottom = '0';
            style.transform = style.left === '100%' ? 'translateX(8px)' : 'translateX(-8px)';
            arrowStyle.top =
              popoverRect.height -
              (viewportHeight - triggerRect.top - triggerRect.height / 2) +
              'px';
          }
          break;

        case 'bottom':
          style = {
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(8px)'
          };
          arrowStyle = {
            top: '-6px',
            left: '50%',
            transform: 'translateX(-50%)'
          };

          // Check if popover would be cut off at the bottom
          if (triggerRect.bottom + popoverRect.height + 8 > viewportHeight) {
            // Switch to top position
            style = {
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%) translateY(-8px)'
            };
            arrowStyle = {
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)'
            };
          }

          // Check for horizontal cutoff - same as 'top' case
          if (triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2 < 0) {
            style.left = '0';
            style.transform = 'translateY(8px)';
            arrowStyle.left = triggerRect.left + triggerRect.width / 2 + 'px';
          } else if (
            triggerRect.left + triggerRect.width / 2 + popoverRect.width / 2 >
            viewportWidth
          ) {
            style.left = 'auto';
            style.right = '0';
            style.transform = 'translateY(8px)';
            arrowStyle.left =
              popoverRect.width - (viewportWidth - triggerRect.left - triggerRect.width / 2) + 'px';
          }
          break;

        case 'left':
          style = {
            top: '50%',
            right: '100%',
            transform: 'translateY(-50%) translateX(-8px)'
          };
          arrowStyle = {
            right: '-6px',
            top: '50%',
            transform: 'translateY(-50%)'
          };

          // Check if popover would be cut off on the left
          if (triggerRect.left - popoverRect.width - 8 < 0) {
            // Switch to right position
            style = {
              top: '50%',
              left: '100%',
              right: 'auto',
              transform: 'translateY(-50%) translateX(8px)'
            };
            arrowStyle = {
              left: '-6px',
              right: 'auto',
              top: '50%',
              transform: 'translateY(-50%)'
            };
          }

          // Check for vertical cutoff - same as 'right' case
          if (triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2 < 0) {
            style.top = '0';
            style.transform = style.right === '100%' ? 'translateX(-8px)' : 'translateX(8px)';
            arrowStyle.top = triggerRect.top + triggerRect.height / 2 + 'px';
          } else if (
            triggerRect.top + triggerRect.height / 2 + popoverRect.height / 2 >
            viewportHeight
          ) {
            style.top = 'auto';
            style.bottom = '0';
            style.transform = style.right === '100%' ? 'translateX(-8px)' : 'translateX(8px)';
            arrowStyle.top =
              popoverRect.height -
              (viewportHeight - triggerRect.top - triggerRect.height / 2) +
              'px';
          }
          break;
      }

      // Apply the calculated styles
      Object.assign(popover.style, style);

      const arrowElement = popover.querySelector('.popover-arrow');
      if (arrowElement) {
        Object.assign((arrowElement as HTMLElement).style, arrowStyle);
      }
    }
  }, [isVisible, position]);

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
        style={{ zIndex: 1000 }} // Ensure popover is always on top of all other elements
      >
        <div className="popover-arrow"></div>
        <div ref={containerRef}>{content}</div>
      </div>
    </div>
  );
}

// Centralized function to handle task section visibility and button visibility
// Returns an object with:
// - visible: boolean - if the section should be shown
// - showButton: boolean - if the "add" button should be shown
const determineTaskSectionVisibility = (sectionName, task, isEditing, activeSections) => {
  // Check if section has content
  let hasContent = false;
  
  switch(sectionName) {
    case 'verificationSteps':
      hasContent = task.verificationSteps && task.verificationSteps.length > 0;
      break;
    case 'requirements':
      hasContent = (task.requirementItems && task.requirementItems.length > 0) || 
                  (task.requirements && task.requirements.length > 0);
      break;
    case 'technicalPlan':
      hasContent = (task.technicalPlanItems && task.technicalPlanItems.length > 0) || 
                  (task.technicalPlan && task.technicalPlan.length > 0);
      break;
    case 'nextSteps':
      hasContent = (task.nextStepItems && task.nextStepItems.length > 0) || 
                  (task.nextSteps && task.nextSteps.length > 0);
      break;
    default:
      // For other sections like markdown, just return true to not affect them
      return { visible: true, showButton: false };
  }
  
  // Section is visible if:
  // - It has content, OR
  // - User has explicitly clicked to edit it (tracked in activeSections)
  const isActive = activeSections && activeSections[sectionName];
  const visible = hasContent || isActive;
  
  // Show add button if:
  // - Edit mode is enabled, AND
  // - Section has no content, AND
  // - Section is not being actively edited
  const showButton = isEditing && !hasContent && !isActive;
  
  return {
    visible,
    showButton
  };
};

function TaskCard({
  task,
  onStatusChange,
  onMarkTested,
  onDelete,
  onUpdateDate,
  onUpdateTask,
  onToggleStar,
  // Item approval functions
  onApproveRequirementItem,
  onVetoRequirementItem,
  onUpdateRequirementItems,
  onApproveTechnicalPlanItem,
  onVetoTechnicalPlanItem,
  onUpdateTechnicalPlanItems,
  onApproveNextStepItem,
  onVetoNextStepItem,
  onUpdateNextStepItems,
  expanded: defaultExpanded = false,
  hideExpand = false,
  readOnly = false
}: TaskCardProps) {
  // Initialize expanded state from localStorage if available
  const [expanded, setExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(`task_expanded_${task.id}`);
      if (savedState !== null) {
        return savedState === 'true';
      }
    }
    return defaultExpanded;
  });
  
  // Save expanded state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`task_expanded_${task.id}`, String(expanded));
    }
  }, [expanded, task.id]);
  
  const [isNew, setIsNew] = useState(task._isNew || false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [newDateValue, setNewDateValue] = useState('');

  // Inline editing states
  const [isEditingInitiative, setIsEditingInitiative] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingUserImpact, setIsEditingUserImpact] = useState(false);
  const [isEditingMarkdown, setIsEditingMarkdown] = useState(false);
  const [editedInitiative, setEditedInitiative] = useState(task.initiative || '');
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const [editedUserImpact, setEditedUserImpact] = useState(task.userImpact || '');
  const [editedMarkdown, setEditedMarkdown] = useState(task.markdown || '');
  
  // Commands expanded state (for action buttons)
  const [commandsExpanded, setCommandsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(`${UI_STORAGE_KEYS.COMMANDS_EXPANDED}_${task.id}`);
      if (savedState !== null) {
        return savedState === 'true';
      }
    }
    // Default to expanded for tasks in review status
    return task.status === TASK_STATUSES.FOR_REVIEW;
  });
  
  // Save commands expanded state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${UI_STORAGE_KEYS.COMMANDS_EXPANDED}_${task.id}`, String(commandsExpanded));
    }
  }, [commandsExpanded, task.id]);

  // Copy feedback states
  const [showIdCopied, setShowIdCopied] = useState(false);
  const [showUrlCopied, setShowUrlCopied] = useState(false);
  
  // Command visibility state
  const [commandsVisible, setCommandsVisible] = useState(true);
  
  // Create callback at component level, not inside renderStageActions
  const handleCommandToggle = useCallback((isVisible: boolean) => {
    setCommandsVisible(isVisible);
  }, []);
  
  // Track which sections are being actively edited
  const [editingSections, setEditingSections] = useState({
    verificationSteps: false,
    requirements: false,
    technicalPlan: false,
    nextSteps: false
  });
  
  // Reset editing state when task ID changes
  useEffect(() => {
    setEditingSections({
      verificationSteps: false,
      requirements: false,
      technicalPlan: false,
      nextSteps: false
    });
  }, [task.id]);

  // Initialize date value once when editing starts
  useEffect(() => {
    if (isEditingDate) {
      setNewDateValue(task.createdAt || new Date().toISOString());
    }
  }, [isEditingDate, task.createdAt]);

  // Clear the new flag after animation completes
  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => {
        setIsNew(false);
      }, 1000); // Matches animation duration
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  // Format date strings - always use relative time
  const formatTimeAgo = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  // Format project name for display
  const formatProjectName = (projectId: string) => {
    if (!projectId) return 'Unknown';
    
    // Extract just the label part if it contains numbers that look like an ID
    if (projectId.match(/\d{8,}/)) {
      // If there's a space or underscore before numbers, keep only what's before
      const match = projectId.match(/^([a-zA-Z\s-]+)[\s_-]?\d+/);
      if (match && match[1]) {
        return match[1].replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()).trim();
      }
    }

    return projectId.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // Get task URL for copying
  const getTaskUrl = () => {
    // Use window.location to build the full URL
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin;
      return `${baseUrl}/task/${task.id}`;
    }
    // Fallback to relative URL if not in browser context
    return `/task/${task.id}`;
  };

  // Copy task ID to clipboard
  const copyTaskId = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card expansion

    navigator.clipboard
      .writeText(task.id)
      .then(() => {
        setShowIdCopied(true);
        setTimeout(() => setShowIdCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy task ID:', err);
      });
  };

  // Copy task URL to clipboard
  const copyTaskUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card expansion

    navigator.clipboard
      .writeText(getTaskUrl())
      .then(() => {
        setShowUrlCopied(true);
        setTimeout(() => setShowUrlCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy task URL:', err);
      });
  };

  // Handle date edit
  const handleDateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card expansion
    console.log('Date clicked!');
    if (onUpdateDate) {
      setIsEditingDate(true);
    }
  };

  // Submit date change
  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card expansion
    if (onUpdateDate) {
      onUpdateDate(task.id, task.project, newDateValue);
      setIsEditingDate(false);
    }
  };

  // Handle inline editing
  const handleInlineEdit = (field: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card expansion

    switch (field) {
      case 'initiative':
        setIsEditingInitiative(true);
        break;
      case 'title':
        setIsEditingTitle(true);
        break;
      case 'description':
        setIsEditingDescription(true);
        break;
      case 'userImpact':
        setIsEditingUserImpact(true);
        break;
      case 'markdown':
        setIsEditingMarkdown(true);
        break;
    }
  };

  // Submit inline edits
  const handleInlineSubmit = (field: string) => (e: React.FormEvent | React.FocusEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card expansion

    if (!onUpdateTask) return;

    let updates: Partial<Task> = {};

    switch (field) {
      case 'initiative':
        updates.initiative = editedInitiative; // Preserve whitespace
        setIsEditingInitiative(false);
        break;
      case 'title':
        updates.title = editedTitle; // Preserve whitespace
        setIsEditingTitle(false);
        break;
      case 'description':
        updates.description = editedDescription; // Preserve whitespace
        setIsEditingDescription(false);
        break;
      case 'userImpact':
        updates.userImpact = editedUserImpact; // Preserve whitespace
        setIsEditingUserImpact(false);
        break;
      case 'markdown':
        updates.markdown = editedMarkdown; // Preserve whitespace
        setIsEditingMarkdown(false);
        break;
    }

    if (Object.keys(updates).length > 0) {
      onUpdateTask(task.id, task.project, updates);
    }
  };

  // Handle keyboard events for inline editing
  const handleInlineKeyDown = (field: string) => (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Cancel editing and reset to original value
      switch (field) {
        case 'initiative':
          setEditedInitiative(task.initiative || '');
          setIsEditingInitiative(false);
          break;
        case 'title':
          setEditedTitle(task.title);
          setIsEditingTitle(false);
          break;
        case 'description':
          setEditedDescription(task.description || '');
          setIsEditingDescription(false);
          break;
        case 'userImpact':
          setEditedUserImpact(task.userImpact || '');
          setIsEditingUserImpact(false);
          break;
        case 'markdown':
          setEditedMarkdown(task.markdown || '');
          setIsEditingMarkdown(false);
          break;
      }
      e.preventDefault();
      e.stopPropagation();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      // Submit on Enter but not with Shift (for multiline text areas)
      if (field !== 'description' && field !== 'userImpact' && field !== 'markdown') {
        handleInlineSubmit(field)(e as unknown as React.FormEvent);
      }
    }
  };

  // Handle card click for expansion
  const handleCardClick = (e: React.MouseEvent) => {
    // First check if the click should be ignored
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLFormElement ||
      // Check for editors and interactive elements
      (e.target instanceof HTMLElement &&
        (e.target.closest('.popover') ||
          e.target.closest('.dropdown-menu') ||
          e.target.closest('.editable-item')))
    ) {
      return; // Let interactive elements handle their own clicks
    }

    // Only expand, never collapse on click
    if (!expanded) {
      setExpanded(true);
    }
  };

  // Status change handlers with transition effects
  const handleStatusChange =
    (
      newStatus:
        | 'inbox'
        | 'brainstorm'
        | 'proposed'
        | 'backlog'
        | 'maybe'
        | 'todo'
        | 'in-progress'
        | 'on-hold'
        | 'done'
        | 'reviewed'
        | 'archived'
    ) =>
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent card expansion

      // Apply a subtle flash effect to indicate the change
      const element = e.currentTarget.closest('.task-card');
      if (element) {
        element.classList.add('status-change-flash');
        setTimeout(() => {
          element.classList.remove('status-change-flash');
        }, 500);
      }

      // Trigger the status change immediately
      onStatusChange(task.id, task.project, newStatus);
    };

  // Quick action handlers
  const handleMarkTested = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion

    // Apply a subtle flash effect to indicate testing
    const element = e.currentTarget.closest('.task-card');
    if (element) {
      element.classList.add('status-change-flash');
      setTimeout(() => {
        element.classList.remove('status-change-flash');
      }, 500);
    }

    onMarkTested(task.id, task.project);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion
    setIsDeleting(true); // Start the delete animation

    // Wait for animation to start before actually deleting
    setTimeout(() => {
      onDelete(task.id, task.project);
    }, 100);
  };

  // Get appropriate status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed':
        return 'bg-purple-100 text-purple-800';
      case 'backlog':
        return 'bg-slate-100 text-slate-800';
      case 'todo':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'on-hold':
        return 'bg-amber-100 text-amber-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'reviewed':
        return 'bg-indigo-100 text-indigo-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // State for agent integration
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState('');

  // Handle feedback submission
  const handleFeedbackSubmit = async (feedbackData: { content: string }) => {
    if (!onAddFeedback) return;

    try {
      setIsSubmittingFeedback(true);
      await onAddFeedback(task.id, feedbackData.content);
      setFeedbackContent(feedbackData.content);
      setShowFeedbackForm(false);
    } catch (error) {
      console.error('Error adding feedback:', error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Render agent action buttons
  const renderAgentActions = () => {
    const agentActions = [];

    // Don't show agent actions for archived or reviewed tasks
    if (['archived', 'reviewed'].includes(task.status as string)) {
      return [];
    }

    // For 'for-review' status, show Give Feedback button
    if (task.status === 'for-review') {
      agentActions.push(
        <button
          key="give-feedback"
          onClick={() => setShowFeedbackForm(true)}
          className="btn-outline-primary ml-2"
        >
          Give Feedback
        </button>
      );
    }

    // Show Deploy Agent button for all tasks except done/archived/reviewed
    if (task.status !== 'done' && !['archived', 'reviewed'].includes(task.status as string)) {
      agentActions.push(
        <AgentLauncher
          key="deploy-agent"
          taskId={task.id}
          mode="implement"
          buttonText="Deploy Agent"
          buttonClass="ml-2 btn-outline-secondary"
        />
      );
    }

    // Show "Show Me" button for tasks in for-review or done status
    if (task.status === 'for-review' || task.status === 'done') {
      agentActions.push(
        <AgentLauncher
          key="show-me"
          taskId={task.id}
          mode="demo"
          buttonText="Show Me"
          buttonClass="ml-2 btn-outline-secondary"
        />
      );
    }

    // If we have feedback content, add a button to launch agent with feedback
    if (feedbackContent && task.status === 'for-review') {
      agentActions.push(
        <AgentLauncher
          key="address-feedback"
          taskId={task.id}
          mode="feedback"
          feedback={feedbackContent}
          buttonText="Address Feedback"
          buttonClass="ml-2 btn-outline-secondary"
        />
      );
    }

    return agentActions;
  };

  // Determine stage-appropriate actions
  const renderStageActions = () => {
    const actions = [];

    // Import coaching message from constants
    const renderCoachingMessage = () => {
      if (STATUS_COACHING && STATUS_COACHING[task.status]) {
        // Only show when expanded, but it's part of the expanded content
        return expanded ? (
          <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-100 text-sm text-blue-700">
            {STATUS_COACHING[task.status]}
          </div>
        ) : null;
      }
      return null;
    };

    // Inbox actions
    if (task.status === 'inbox') {
      // Primary actions
      actions.push(
        <Popover
          key="mark-actionable-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MARK_ACTIONABLE.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.MARK_ACTIONABLE.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="mark-actionable"
            onClick={handleStatusChange('todo')}
            className="btn-outline-primary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Mark Actionable
          </button>
        </Popover>
      );

      actions.push(
        <Popover
          key="move-to-brainstorm-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MOVE_TO_BRAINSTORM.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.MOVE_TO_BRAINSTORM.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-brainstorm"
            onClick={handleStatusChange('brainstorm')}
            className="btn-outline-primary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Move to Brainstorm
          </button>
        </Popover>
      );

      actions.push(
        <Popover
          key="move-to-someday-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MOVE_TO_SOMEDAY.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.MOVE_TO_SOMEDAY.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-someday"
            onClick={handleStatusChange('maybe')}
            className="btn-outline-secondary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Move to Someday/Maybe
          </button>
        </Popover>
      );
    }

    // Brainstorm actions
    else if (task.status === 'brainstorm') {
      actions.push(
        <Popover
          key="mark-actionable-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MARK_ACTIONABLE.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.MARK_ACTIONABLE.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="mark-actionable"
            onClick={handleStatusChange('todo')}
            className="btn-outline-primary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Mark Actionable
          </button>
        </Popover>
      );

      actions.push(
        <Popover
          key="move-to-proposed-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MOVE_TO_PROPOSED.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.MOVE_TO_PROPOSED.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-proposed"
            onClick={handleStatusChange('proposed')}
            className="btn-outline-primary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Move to Proposed
          </button>
        </Popover>
      );

      // Add move to Someday/Maybe option
      actions.push(
        <Popover
          key="move-to-someday-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MOVE_TO_SOMEDAY.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.MOVE_TO_SOMEDAY.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-someday"
            onClick={handleStatusChange('maybe')}
            className="btn-outline-secondary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Move to Someday/Maybe
          </button>
        </Popover>
      );

      // Secondary action - Move to Inbox
      actions.push(
        <Popover
          key="move-to-inbox-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MOVE_TO_INBOX.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.MOVE_TO_INBOX.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-inbox"
            onClick={handleStatusChange('inbox')}
            className="btn-outline-secondary"
          >
            <FaArrowLeft className="mr-1" size={12} />
            Move to Inbox
          </button>
        </Popover>
      );
    }

    // Proposed actions
    else if (task.status === 'proposed') {
      actions.push(
        <Popover
          key="mark-actionable-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MARK_ACTIONABLE.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.MARK_ACTIONABLE.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="mark-actionable"
            onClick={handleStatusChange('todo')}
            className="btn-outline-primary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Mark Actionable
          </button>
        </Popover>
      );

      // Add To Backlog button
      actions.push(
        <Popover
          key="move-to-backlog-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.TO_BACKLOG.title}
              </h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.TO_BACKLOG.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-backlog"
            onClick={handleStatusChange('backlog')}
            className="btn-outline-primary"
          >
            <FaListAlt className="mr-1" size={12} />
            To Backlog
          </button>
        </Popover>
      );

      // Reject button removed per requirements

      // Secondary action - Move to Someday/Maybe
      actions.push(
        <Popover
          key="move-to-someday-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MOVE_TO_SOMEDAY.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.MOVE_TO_SOMEDAY.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-someday"
            onClick={handleStatusChange('maybe')}
            className="btn-outline-secondary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Move to Someday/Maybe
          </button>
        </Popover>
      );
    }

    // Backlog actions
    else if (task.status === 'backlog') {
      actions.push(
        <Popover
          key="mark-actionable-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MARK_ACTIONABLE.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.MARK_ACTIONABLE.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="mark-actionable"
            onClick={handleStatusChange('todo')}
            className="btn-outline-primary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Mark Actionable
          </button>
        </Popover>
      );

      // Add Move to Someday/Maybe button
      actions.push(
        <Popover
          key="move-to-someday-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MOVE_TO_SOMEDAY.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.MOVE_TO_SOMEDAY.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-someday"
            onClick={handleStatusChange('maybe')}
            className="btn-outline-primary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Move to Someday/Maybe
          </button>
        </Popover>
      );

      // Add Archive button
      actions.push(
        <Popover
          key="move-to-archived-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">{STATUS_ACTION_HELP.ARCHIVE.title}</h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.ARCHIVE.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-archived"
            onClick={handleStatusChange('archived')}
            className="btn-outline-secondary"
          >
            <FaArchive className="mr-1" size={12} />
            Archive
          </button>
        </Popover>
      );

      // Secondary action - Move to Proposed
      actions.push(
        <Popover
          key="move-to-proposed-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MOVE_TO_PROPOSED.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.MOVE_TO_PROPOSED.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-proposed"
            onClick={handleStatusChange('proposed')}
            className="btn-outline-secondary"
          >
            <FaArrowLeft className="mr-1" size={12} />
            Move to Proposed
          </button>
        </Popover>
      );
    }

    // Maybe (Someday/Maybe) actions
    else if (task.status === 'maybe') {
      actions.push(
        <Popover
          key="mark-actionable-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MARK_ACTIONABLE.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.MARK_ACTIONABLE.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="mark-actionable"
            onClick={handleStatusChange('todo')}
            className="btn-outline-primary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Mark Actionable
          </button>
        </Popover>
      );

      // Add Move to Backlog button
      actions.push(
        <Popover
          key="move-to-backlog-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.TO_BACKLOG.title}
              </h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.TO_BACKLOG.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-backlog"
            onClick={handleStatusChange('backlog')}
            className="btn-outline-primary"
          >
            <FaListAlt className="mr-1" size={12} />
            To Backlog
          </button>
        </Popover>
      );

      // Add Archive button
      actions.push(
        <Popover
          key="move-to-archived-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">{STATUS_ACTION_HELP.ARCHIVE.title}</h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.ARCHIVE.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-archived"
            onClick={handleStatusChange('archived')}
            className="btn-outline-secondary"
          >
            <FaArchive className="mr-1" size={12} />
            Archive
          </button>
        </Popover>
      );

      // Secondary action - Move to Brainstorm
      actions.push(
        <Popover
          key="move-to-brainstorm-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MOVE_TO_BRAINSTORM.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.MOVE_TO_BRAINSTORM.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-brainstorm"
            onClick={handleStatusChange('brainstorm')}
            className="btn-outline-secondary"
          >
            <FaArrowLeft className="mr-1" size={12} />
            Move to Brainstorm
          </button>
        </Popover>
      );
    }

    // Todo actions
    else if (task.status === 'todo') {
      actions.push(
        <Popover
          key="move-to-in-progress-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {getActionHelp(TASK_STATUSES.TODO, 'Starting work on this?').title}
              </h4>
              <p className="text-sm text-gray-600">
                {
                  getActionHelp(
                    TASK_STATUSES.TODO,
                    'Starting work on this?',
                    "Click this button when you begin working on this task so your team knows it's actively being worked on."
                  ).description
                }
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-in-progress"
            onClick={handleStatusChange('in-progress')}
            className="btn-outline-primary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Start Progress
          </button>
        </Popover>
      );

      // Add On Hold button
      actions.push(
        <Popover
          key="move-to-on-hold-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">{STATUS_ACTION_HELP.ON_HOLD.title}</h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.ON_HOLD.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-on-hold"
            onClick={handleStatusChange('on-hold')}
            className="btn-outline-primary"
          >
            <FaPause className="mr-1" size={12} />
            Put On Hold
          </button>
        </Popover>
      );

      // Add To Backlog button
      actions.push(
        <Popover
          key="move-to-backlog-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.TO_BACKLOG.title}
              </h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.TO_BACKLOG.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-backlog"
            onClick={handleStatusChange('backlog')}
            className="btn-outline-secondary"
          >
            <FaListAlt className="mr-1" size={12} />
            To Backlog
          </button>
        </Popover>
      );

      // Secondary action - Move to Someday/Maybe
      actions.push(
        <Popover
          key="move-to-someday-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MOVE_TO_SOMEDAY.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.MOVE_TO_SOMEDAY.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-someday"
            onClick={handleStatusChange('maybe')}
            className="btn-outline-secondary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Move to Someday/Maybe
          </button>
        </Popover>
      );
    }

    // In Progress actions
    else if (task.status === 'in-progress') {
      actions.push(
        <Popover
          key="move-to-done-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {getActionHelp(TASK_STATUSES.IN_PROGRESS, 'Finished the work?').title}
              </h4>
              <p className="text-sm text-gray-600">
                {
                  getActionHelp(
                    TASK_STATUSES.IN_PROGRESS,
                    'Finished the work?',
                    "Click this button when you've completed all the work for this task and it's ready for someone to review it."
                  ).description
                }
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-done"
            onClick={handleStatusChange('done')}
            className="btn-outline-primary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Mark Done
          </button>
        </Popover>
      );

      // Add Move to Review button
      actions.push(
        <Popover
          key="move-to-review-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MOVE_TO_REVIEW.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.MOVE_TO_REVIEW.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-review"
            onClick={handleStatusChange('done')}
            className="btn-outline-primary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Move to Review
          </button>
        </Popover>
      );

      // Add On Hold button
      actions.push(
        <Popover
          key="move-to-on-hold-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">{STATUS_ACTION_HELP.ON_HOLD.title}</h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.ON_HOLD.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-on-hold"
            onClick={handleStatusChange('on-hold')}
            className="btn-outline-primary"
          >
            <FaPause className="mr-1" size={12} />
            Put On Hold
          </button>
        </Popover>
      );

      // Secondary action - Move to Todo
      actions.push(
        <Popover
          key="move-to-todo-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">Move back to Todo?</h4>
              <p className="text-sm text-gray-600">
                If you need to reprioritize this task, move it back to Todo status.
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-todo"
            onClick={handleStatusChange('todo')}
            className="btn-outline-secondary"
          >
            <FaArrowLeft className="mr-1" size={12} />
            Move to Todo
          </button>
        </Popover>
      );
    }

    // On Hold actions
    else if (task.status === 'on-hold') {
      actions.push(
        <Popover
          key="resume-progress-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {getActionHelp(TASK_STATUSES.ON_HOLD, 'Ready to resume work?').title}
              </h4>
              <p className="text-sm text-gray-600">
                {
                  getActionHelp(
                    TASK_STATUSES.ON_HOLD,
                    'Ready to resume work?',
                    'Click this button to resume work on this task that was previously put on hold.'
                  ).description
                }
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="resume-progress"
            onClick={handleStatusChange('in-progress')}
            className="btn-outline-primary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Resume Progress
          </button>
        </Popover>
      );

      // Add Move to Backlog button
      actions.push(
        <Popover
          key="move-to-backlog-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.TO_BACKLOG.title}
              </h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.TO_BACKLOG.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-backlog"
            onClick={handleStatusChange('backlog')}
            className="btn-outline-primary"
          >
            <FaListAlt className="mr-1" size={12} />
            Move to Backlog
          </button>
        </Popover>
      );

      // Add Move to Todo button
      actions.push(
        <Popover
          key="move-to-todo-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">Move to Todo?</h4>
              <p className="text-sm text-gray-600">
                Move this task back to Todo status if it's no longer blocked but you're not ready to
                work on it yet.
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-todo"
            onClick={handleStatusChange('todo')}
            className="btn-outline-primary"
          >
            <FaArrowRight className="mr-1" size={12} />
            Move to Todo
          </button>
        </Popover>
      );

      // Secondary action - Archive
      actions.push(
        <Popover
          key="move-to-archived-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">{STATUS_ACTION_HELP.ARCHIVE.title}</h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.ARCHIVE.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-archived"
            onClick={handleStatusChange('archived')}
            className="btn-outline-secondary"
          >
            <FaArchive className="mr-1" size={12} />
            Archive
          </button>
        </Popover>
      );
    }

    // Done actions (For Review)
    else if (task.status === 'done') {
      actions.push(
        <Popover
          key="move-to-reviewed-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {getActionHelp(TASK_STATUSES.DONE, 'Reviewed this work?').title}
              </h4>
              <p className="text-sm text-gray-600">
                {
                  getActionHelp(
                    TASK_STATUSES.DONE,
                    'Reviewed this work?',
                    'After checking this completed task and confirming everything looks good, click this button to mark it as reviewed.'
                  ).description
                }
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-reviewed"
            onClick={handleStatusChange('reviewed')}
            className="btn-outline-primary"
          >
            <FaCheck className="mr-1" size={12} />
            Mark Reviewed
          </button>
        </Popover>
      );

      // Add Archive button
      actions.push(
        <Popover
          key="archive-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">{STATUS_ACTION_HELP.ARCHIVE.title}</h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.ARCHIVE.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="archive"
            onClick={handleStatusChange('archived')}
            className="btn-outline-primary"
          >
            <FaArchive className="mr-1" size={12} />
            Archive
          </button>
        </Popover>
      );

      // Move back to Todo
      actions.push(
        <Popover
          key="reopen-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">{STATUS_ACTION_HELP.REOPEN.title}</h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.REOPEN.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="reopen"
            onClick={handleStatusChange('todo')}
            className="btn-outline-secondary"
          >
            <FaArrowLeft className="mr-1" size={12} />
            Reopen Task
          </button>
        </Popover>
      );

      // Move back to in-progress
      actions.push(
        <Popover
          key="move-to-in-progress-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.STILL_WORKING.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.STILL_WORKING.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-in-progress"
            onClick={handleStatusChange('in-progress')}
            className="btn-outline-secondary"
          >
            <FaArrowLeft className="mr-1" size={12} />
            Still Working
          </button>
        </Popover>
      );
    }

    // Reviewed (Done) actions
    else if (task.status === 'reviewed') {
      // Add Archive button for reviewed tasks
      actions.push(
        <Popover
          key="move-to-archived-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">{STATUS_ACTION_HELP.ARCHIVE.title}</h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.ARCHIVE.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-archived"
            onClick={handleStatusChange('archived')}
            className="btn-outline-primary"
          >
            <FaArchive className="mr-1" size={12} />
            Archive Task
          </button>
        </Popover>
      );

      // Add ability to reopen a reviewed task
      actions.push(
        <Popover
          key="reopen-task-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">{STATUS_ACTION_HELP.REOPEN.title}</h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.REOPEN.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="reopen-task"
            onClick={handleStatusChange('todo')}
            className="btn-outline-primary"
          >
            <FaArrowLeft className="mr-1" size={12} />
            Reopen Task
          </button>
        </Popover>
      );

      // Move back to done
      actions.push(
        <Popover
          key="move-to-done-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MOVE_TO_DONE.title}
              </h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.MOVE_TO_DONE.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-done"
            onClick={handleStatusChange('done')}
            className="btn-outline-secondary"
          >
            <FaArrowLeft className="mr-1" size={12} />
            Move to Done
          </button>
        </Popover>
      );

      // Add Move to For Review
      actions.push(
        <Popover
          key="move-to-review-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MOVE_TO_REVIEW.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.MOVE_TO_REVIEW.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-review"
            onClick={handleStatusChange('done')}
            className="btn-outline-secondary"
          >
            <FaArrowLeft className="mr-1" size={12} />
            Move to For Review
          </button>
        </Popover>
      );
    }

    // Archived actions
    else if (task.status === 'archived') {
      // Add ability to unarchive a task
      actions.push(
        <Popover
          key="unarchive-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.UNARCHIVE.title}
              </h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.UNARCHIVE.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="unarchive"
            onClick={handleStatusChange('backlog')}
            className="btn-outline-primary"
          >
            <FaArrowLeft className="mr-1" size={12} />
            Unarchive
          </button>
        </Popover>
      );

      // Move to Reviewed
      actions.push(
        <Popover
          key="move-to-reviewed-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">Move to Reviewed?</h4>
              <p className="text-sm text-gray-600">
                This will move the task back to the reviewed state, making it visible in the active
                task lists again.
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-reviewed"
            onClick={handleStatusChange('reviewed')}
            className="btn-outline-primary"
          >
            <FaArrowLeft className="mr-1" size={12} />
            Move to Reviewed
          </button>
        </Popover>
      );

      // Move to Done
      actions.push(
        <Popover
          key="move-to-done-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MOVE_TO_DONE.title}
              </h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.MOVE_TO_DONE.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button
            key="move-to-done"
            onClick={handleStatusChange('done')}
            className="btn-outline-primary"
          >
            <FaArrowLeft className="mr-1" size={12} />
            Move to Done
          </button>
        </Popover>
      );

      // Delete Permanently
      actions.push(
        <Popover
          key="delete-permanently-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.DELETE_PERMANENTLY.title}
              </h4>
              <p className="text-sm text-gray-600">
                {STATUS_ACTION_HELP.DELETE_PERMANENTLY.description}
              </p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button key="delete-permanently" onClick={handleDelete} className="btn-outline-danger">
            <FaTrash className="mr-1" size={12} />
            Delete Permanently
          </button>
        </Popover>
      );
    }

    // Mark tested button for tasks that aren't done or reviewed
    if (task.status !== 'done' && task.status !== 'reviewed' && task.status !== 'archived') {
      actions.push(
        <Popover
          key="mark-tested-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">
                {STATUS_ACTION_HELP.MARK_TESTED.title}
              </h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.MARK_TESTED.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button key="mark-tested" onClick={handleMarkTested} className="btn-outline-success">
            <FaCheck className="mr-1" size={12} />
            Mark Tested
          </button>
        </Popover>
      );
    }

    // Add status selector before delete button
    actions.push(
      <StatusSelector 
        key="status-selector"
        currentStatus={task.status}
        onStatusChange={(newStatus) => {
          // Direct call to update status without trying to invoke handleStatusChange with an event
          onStatusChange(task.id, task.project, newStatus as Task['status']);
        }}
      />
    );
    
    // We'll add the command toggle at the end after all other buttons

    // Always show delete button except for archived tasks (which have Delete Permanently)
    if (task.status !== 'archived') {
      actions.push(
        <Popover
          key="delete-popover"
          content={
            <div className="w-64">
              <h4 className="font-medium text-gray-900 mb-1">{STATUS_ACTION_HELP.DELETE.title}</h4>
              <p className="text-sm text-gray-600">{STATUS_ACTION_HELP.DELETE.description}</p>
            </div>
          }
          position={POPOVER_POSITIONS.TOP}
        >
          <button key="delete" onClick={handleDelete} className="btn-outline-danger">
            <FaTrash className="mr-1" size={12} />
            Delete
          </button>
        </Popover>
      );
    }

    // Get agent actions
    const agentActionButtons = renderAgentActions();
    
    // Add command toggle as the last button
    actions.push(
      <CommandToggle 
        key="command-toggle"
        initialVisible={commandsVisible}
        onChange={handleCommandToggle}
      />
    );

    // Filter actions to only show status selector and command toggle when commands are hidden
    const visibleActions = commandsVisible 
      ? actions 
      : actions.filter(action => {
          const key = action?.key;
          return key === 'status-selector' || key === 'command-toggle';
        });

    return (
      <>
        {expanded && renderCoachingMessage()}
        <div className="mt-3 flex flex-wrap gap-2 justify-end">
          {visibleActions}
          {/* Add agent actions after regular actions */}
          {commandsVisible && agentActionButtons.length > 0 && agentActionButtons}
        </div>

        {/* Feedback form when expanded and show form is true */}
        {expanded && showFeedbackForm && (
          <div className="mt-4">
            <FeedbackForm
              taskId={task.id}
              onSubmit={handleFeedbackSubmit}
              onCancel={() => setShowFeedbackForm(false)}
              isSubmitting={isSubmittingFeedback}
            />
          </div>
        )}

        {/* Display feedback content if available */}
        {expanded && feedbackContent && !showFeedbackForm && (
          <div className="mt-4 text-base">
            <h4 className="font-medium text-gray-700 mb-1">Feedback</h4>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-gray-800">
              {feedbackContent}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div
      data-testid="task-card"
      className={`task-card ${task.status === 'reviewed' ? 'bg-gray-50' : 'bg-white'} ${
        isNew ? 'animate-fade-in border-l-4 border-l-blue-500' : ''
      } 
      ${isDeleting ? 'fade-out pointer-events-none' : ''}
      ${expanded ? 'expanded' : ''}
      rounded-lg shadow-sm border border-gray-200 transition-all duration-200`}
    >
      <div
        className="p-4"
        onClick={handleCardClick}
      >
        {/* Top row with controls */}
        <div className="flex justify-between mb-1">
        </div>

        {/* Header row with initiative, title, badges */}
        <div className="flex flex-col gap-1">
          {/* Initiative at the top (if exists) - with inline editing */}
          {(task.initiative || isEditingInitiative) && (
            <div className="flex items-start justify-between mb-1">
              {isEditingInitiative ? (
                <div onClick={(e) => e.stopPropagation()} className="w-full">
                  <textarea
                    value={editedInitiative}
                    onChange={(e) => setEditedInitiative(e.target.value)}
                    onBlur={handleInlineSubmit('initiative')}
                    onKeyDown={handleInlineKeyDown('initiative')}
                    className="w-full px-2 py-1 text-lg font-semibold text-gray-800 font-anthropic border border-blue-300 rounded"
                    rows={(editedInitiative.match(/\n/g) || []).length + 1}
                    autoFocus
                  />
                </div>
              ) : (
                <h2
                  className="text-lg font-semibold text-gray-800 font-anthropic group cursor-pointer whitespace-pre-wrap break-words"
                  onDoubleClick={(e) => onUpdateTask && handleInlineEdit('initiative')(e)}
                >
                  {task.initiative}
                  {onUpdateTask && (
                    <span className="ml-2 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      edit
                    </span>
                  )}
                </h2>
              )}

              <div className="flex items-center space-x-1">
                <ClickableId 
                  id="CO_9106" 
                  filePath="/src/components/TaskCard.tsx" 
                  className="mr-2"
                />
                <Link
                  href={`/task/${task.id}`}
                  className="btn-icon"
                  title="View task details"
                  onClick={(e) => e.stopPropagation()} // Prevent card expansion
                >
                  <FaEye size={14} />
                </Link>

                {/* Star button for Today filter */}
                <button
                  className="btn-icon"
                  title={task.starred ? 'Remove from Today' : 'Add to Today'}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card expansion
                    if (onToggleStar) {
                      onToggleStar(task.id, task.project);
                    }
                  }}
                >
                  {task.starred ? (
                    <FaStar size={14} className="text-rose-500" />
                  ) : (
                    <FaRegStar size={14} />
                  )}
                </button>
                <DropdownMenu
                  trigger={
                    <button className="btn-icon">
                      <FaCog size={14} />
                    </button>
                  }
                  items={[
                    {
                      id: 'delete-task',
                      label: 'Delete Task',
                      icon: <FaTrash size={14} />,
                      onClick: handleDelete,
                      description: 'Permanently remove this task'
                    }
                  ]}
                  label="Task actions"
                />
              </div>
            </div>
          )}

          {/* Title row - with inline editing */}
          <div className={`flex items-start justify-between ${!task.initiative ? 'mb-1' : ''}`}>
            <div className="flex items-start w-full">
              {isEditingTitle ? (
                <div onClick={(e) => e.stopPropagation()} className="w-full">
                  <textarea
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={handleInlineSubmit('title')}
                    onKeyDown={handleInlineKeyDown('title')}
                    className="w-full px-2 py-1 text-lg font-normal font-anthropic border border-blue-300 rounded"
                    rows={(editedTitle.match(/\n/g) || []).length + 1}
                    autoFocus
                  />
                </div>
              ) : (
                <h3
                  data-testid="task-title"
                  className={`text-lg font-normal font-anthropic group cursor-pointer whitespace-pre-wrap break-words ${
                    task.status === 'reviewed' ? 'text-gray-500' : 'text-gray-800'
                  }`}
                  onDoubleClick={(e) => onUpdateTask && handleInlineEdit('title')(e)}
                >
                  {task.title}
                  {onUpdateTask && (
                    <span className="ml-2 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      edit
                    </span>
                  )}
                </h3>
              )}
            </div>

            {/* Only show gear if no initiative */}
            {!task.initiative && (
              <div className="flex items-center space-x-1">
                <ClickableId 
                  id="CO_9106" 
                  filePath="/src/components/TaskCard.tsx" 
                  className="mr-2"
                />
                <Link
                  href={`/task/${task.id}`}
                  className="btn-icon"
                  title="View task details"
                  onClick={(e) => e.stopPropagation()} // Prevent card expansion
                >
                  <FaEye size={14} />
                </Link>

                {/* Star button for Today filter */}
                <button
                  className="btn-icon"
                  title={task.starred ? 'Remove from Today' : 'Add to Today'}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card expansion
                    if (onToggleStar) {
                      onToggleStar(task.id, task.project);
                    }
                  }}
                >
                  {task.starred ? (
                    <FaStar size={14} className="text-rose-500" />
                  ) : (
                    <FaRegStar size={14} />
                  )}
                </button>
                <DropdownMenu
                  trigger={
                    <button className="btn-icon">
                      <FaCog size={14} />
                    </button>
                  }
                  items={[
                    {
                      id: 'delete-task',
                      label: 'Delete Task',
                      icon: <FaTrash size={14} />,
                      onClick: handleDelete,
                      description: 'Permanently remove this task'
                    }
                  ]}
                  label="Task actions"
                />
              </div>
            )}
          </div>

          {/* User Impact (always shown in collapsed view) or Description */}
          {task.userImpact || task.description ? (
            <>
              {/* Show userImpact in collapsed view when available */}
              {!expanded ? (
                <div className="text-base text-gray-600 line-clamp-2">
                  {isEditingUserImpact ? (
                    <div onClick={(e) => e.stopPropagation()} className="w-full">
                      <textarea
                        value={editedUserImpact}
                        onChange={(e) => setEditedUserImpact(e.target.value)}
                        onBlur={handleInlineSubmit('userImpact')}
                        onKeyDown={handleInlineKeyDown('userImpact')}
                        className="w-full px-2 py-1 text-base text-gray-600 border border-blue-300 rounded"
                        rows={2}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div
                      className="group cursor-pointer whitespace-pre-wrap break-words"
                      onDoubleClick={(e) => onUpdateTask && handleInlineEdit('userImpact')(e)}
                    >
                      {task.userImpact || task.description || 'No description provided'}
                      {onUpdateTask && (
                        <span className="ml-2 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          edit
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* In expanded view, show description if available */
                task.description && (
                  <div className="text-base text-gray-600">
                    {isEditingDescription ? (
                      <div onClick={(e) => e.stopPropagation()} className="w-full">
                        <textarea
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          onBlur={handleInlineSubmit('description')}
                          onKeyDown={handleInlineKeyDown('description')}
                          className="w-full px-2 py-1 text-base text-gray-600 border border-blue-300 rounded"
                          rows={3}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div
                        className="group cursor-pointer whitespace-pre-wrap break-words"
                        onDoubleClick={(e) => onUpdateTask && handleInlineEdit('description')(e)}
                      >
                        {task.description}
                        {onUpdateTask && (
                          <span className="ml-2 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            edit
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </>
          ) : null}

          {/* Project name and status badges */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center">
            </div>

            <div className="flex items-center space-x-1">
              {/* Status badge */}
              <span data-testid="task-status" className={`badge ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
              
              {/* Project badge */}
              {task.project && (
                <span className="badge bg-purple-100 text-purple-800">
                  {formatProjectName(task.project)}
                </span>
              )}

              {/* Tested badge with popover */}
              {task.tested && (
                <Popover
                  content={
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Tested</h4>
                      <p className="text-sm text-gray-600">
                        This task has been tested and verified to work correctly
                      </p>
                    </div>
                  }
                  position={POPOVER_POSITIONS.TOP}
                >
                  <span className="badge badge-tested">tested</span>
                </Popover>
              )}
            </div>
          </div>

          {/* Created date with edit button */}
          <div className="mt-1 text-xs text-gray-500">
            {isEditingDate ? (
              <div onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleDateSubmit} className="inline-flex items-center">
                  <label className="mr-2">New date:</label>
                  <input
                    type="text"
                    value={newDateValue}
                    onChange={(e) => setNewDateValue(e.target.value)}
                    placeholder="YYYY-MM-DDThh:mm:ss.sssZ"
                    className="px-2 py-1 border border-blue-300 rounded text-xs w-64"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="ml-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="ml-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    onClick={() => setIsEditingDate(false)}
                  >
                    Cancel
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center">
                <span>Created {formatTimeAgo(task.createdAt)}</span>
                {expanded && onUpdateDate && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditingDate(true);
                    }}
                    className="ml-2 text-blue-500 hover:text-blue-700 text-xs"
                    title="Edit creation date"
                  >
                    edit
                  </button>
                )}
              </div>
            )}
          </div>

          {expanded && (
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
              </div>

              {!hideExpand && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setExpanded(false);
                  }}
                  className="btn-outline-secondary py-1 px-3 text-sm"
                >
                  Collapse ↑
                </button>
              )}
            </div>
          )}

          {/* Stage-appropriate action buttons with collapsible container */}
          <div className="relative">
            {task.status === TASK_STATUSES.FOR_REVIEW && (
              <div className="flex items-center mt-3">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCommandsExpanded(!commandsExpanded);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                >
                  {commandsExpanded ? (
                    <>
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Hide actions
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Show actions
                    </>
                  )}
                </button>
              </div>
            )}
            
            {/* Conditional rendering of coaching message and actions based on commandsExpanded state */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
              task.status !== TASK_STATUSES.FOR_REVIEW || commandsExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              {renderStageActions()}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          {/* User Impact (when expanded and it exists) */}
          {(task.userImpact || isEditingUserImpact) && (
            <div className="mt-4 text-base">
              <h4 className="font-medium text-gray-700 mb-1">User Impact</h4>
              {isEditingUserImpact ? (
                <div onClick={(e) => e.stopPropagation()} className="w-full">
                  <textarea
                    value={editedUserImpact}
                    onChange={(e) => setEditedUserImpact(e.target.value)}
                    onBlur={handleInlineSubmit('userImpact')}
                    onKeyDown={handleInlineKeyDown('userImpact')}
                    className="w-full px-2 py-1 text-base text-gray-600 border border-blue-300 rounded"
                    rows={3}
                    autoFocus
                  />
                </div>
              ) : (
                <div
                  className="text-gray-600 group cursor-pointer whitespace-pre-wrap break-words"
                  onDoubleClick={(e) => onUpdateTask && handleInlineEdit('userImpact')(e)}
                >
                  {task.userImpact}
                  {onUpdateTask && (
                    <span className="ml-2 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      edit
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Description (when no user impact is shown in collapsed view) */}
          {task.userImpact && task.description && (
            <div className="mt-4 text-base">
              <h4 className="font-medium text-gray-700 mb-1">Description</h4>
              {isEditingDescription ? (
                <div onClick={(e) => e.stopPropagation()} className="w-full">
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    onBlur={handleInlineSubmit('description')}
                    onKeyDown={handleInlineKeyDown('description')}
                    className="w-full px-2 py-1 text-base text-gray-600 border border-blue-300 rounded"
                    rows={3}
                    autoFocus
                  />
                </div>
              ) : (
                <div
                  className="text-gray-600 group cursor-pointer whitespace-pre-wrap break-words"
                  onClick={(e) => onUpdateTask && handleInlineEdit('description')(e)}
                >
                  {task.description}
                  {onUpdateTask && (
                    <span className="ml-2 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      edit
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="mt-4 text-base">
              <h4 className="font-medium text-gray-700 mb-1">Tags</h4>
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Markdown Content */}
          {((task.markdown && task.markdown.length > 0) || isEditingMarkdown || expanded) && (
            <div id={`markdown-${task.id}`} className="mt-4 text-base block" style={{display: 'block'}} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-700 mb-1 block" style={{display: 'block'}}>Details</h4>
                {!isEditingMarkdown && !task.markdown && onUpdateTask && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditingMarkdown(true);
                    }}
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    + Add details
                  </button>
                )}
              </div>
              <div
                className="prose prose-sm max-w-none text-gray-600 group cursor-pointer whitespace-pre-wrap break-words min-h-[48px] block"
                style={{display: 'block'}}
                onClick={(e) => {
                  if (onUpdateTask && !isEditingMarkdown) {
                    e.stopPropagation();
                    handleInlineEdit('markdown')(e);
                  }
                }}
              >
                {isEditingMarkdown ? (
                  <div 
                    className="relative w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Semi-transparent textarea for editing */}
                    <textarea
                      value={editedMarkdown}
                      onChange={(e) => setEditedMarkdown(e.target.value)}
                      onBlur={handleInlineSubmit('markdown')}
                      onKeyDown={handleInlineKeyDown('markdown')}
                      className="absolute inset-0 w-full h-full opacity-100 z-10 resize-none cursor-text border-0 outline-none"
                      style={{ 
                        minHeight: '100px',
                        caretColor: 'black', 
                        color: 'black',
                        backgroundColor: 'white'
                      }}
                      autoFocus
                    />
                    
                    {/* Live preview that looks identical to the non-editing view */}
                    <div className="relative z-0 pointer-events-none min-h-[48px] block" style={{display: 'block'}}>
                      {editedMarkdown ? (
                        <ReactMarkdown className="prose prose-sm max-w-none block" style={{display: 'block'}}>{editedMarkdown}</ReactMarkdown>
                      ) : (
                        <p className="text-gray-400 italic block" style={{display: 'block'}}>Start typing to add markdown content...</p>
                      )}
                    </div>
                    
                    {/* Small indicator that we're in edit mode */}
                    <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-xs px-1 py-0.5 rounded-bl">
                      editing
                    </div>
                  </div>
                ) : (
                  <>
                    {task.markdown ? (
                      <>
                        <ReactMarkdown className="prose prose-sm max-w-none block" style={{display: 'block'}}>{task.markdown}</ReactMarkdown>
                        {onUpdateTask && (
                          <span className="ml-2 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            click to edit
                          </span>
                        )}
                      </>
                    ) : (
                    <p className="text-gray-400 italic">No details added yet. Click to add markdown details.</p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Quick Add Section - Buttons to add various items */}
          {onUpdateTask && expanded && (
            <div className="mt-6 mb-2 flex flex-wrap gap-x-2 gap-y-2 border-t border-gray-100 pt-3 pb-1">
              {determineTaskSectionVisibility('verificationSteps', task, onUpdateTask, editingSections).showButton && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Mark this section as being edited
                    setEditingSections(prev => ({
                      ...prev,
                      verificationSteps: true
                    }));
                    
                    // Focus on verification steps section
                    setTimeout(() => {
                      const verificationSection = document.getElementById(`verification-steps-${task.id}`);
                      if (verificationSection) {
                        verificationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                  }}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium transition px-3 py-1 rounded-md hover:bg-blue-50"
                >
                  + Verification Steps
                </button>
              )}
              
              {determineTaskSectionVisibility('requirements', task, onUpdateTask, editingSections).showButton && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Mark this section as being edited
                    setEditingSections(prev => ({
                      ...prev,
                      requirements: true
                    }));
                    
                    // Focus on requirements section
                    setTimeout(() => {
                      const requirementsSection = document.getElementById(`requirements-${task.id}`);
                      if (requirementsSection) {
                        requirementsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                  }}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium transition px-3 py-1 rounded-md hover:bg-blue-50"
                >
                  + Requirements
                </button>
              )}
              
              {determineTaskSectionVisibility('technicalPlan', task, onUpdateTask, editingSections).showButton && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Mark this section as being edited
                    setEditingSections(prev => ({
                      ...prev,
                      technicalPlan: true
                    }));
                    
                    // Focus on technical plan section
                    setTimeout(() => {
                      const technicalSection = document.getElementById(`technical-plan-${task.id}`);
                      if (technicalSection) {
                        technicalSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                  }}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium transition px-3 py-1 rounded-md hover:bg-blue-50"
                >
                  + Technical Plan
                </button>
              )}
              
              {determineTaskSectionVisibility('nextSteps', task, onUpdateTask, editingSections).showButton && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Mark this section as being edited
                    setEditingSections(prev => ({
                      ...prev,
                      nextSteps: true
                    }));
                    
                    // Focus on next steps section
                    setTimeout(() => {
                      const nextStepsSection = document.getElementById(`next-steps-${task.id}`);
                      if (nextStepsSection) {
                        nextStepsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                  }}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium transition px-3 py-1 rounded-md hover:bg-blue-50"
                >
                  + Next Steps
                </button>
              )}
            </div>
          )}

          {/* Verification Steps - Handled by centralized layout logic */}
          {determineTaskSectionVisibility('verificationSteps', task, onUpdateTask, editingSections).visible && (
            <div id={`verification-steps-${task.id}`} className="mt-4 text-base block" style={{display: 'block'}} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-end">
                <ClickableId 
                  id="CO_9108" 
                  filePath="/src/components/EditableItems/ApprovalItemList.tsx (Fixed approve/veto buttons with readOnly prop and error handling)"
                  className="mb-1" 
                  text="And specifically, the location in the code which has the header Verification Steps followed by <ul className='list-disc pl-5 text-gray-600 block'> so that agents can find that exact place"
                />
              </div>
              {onUpdateTask ? (
                <ApprovalItemList2
                  label="Verification Steps"
                  items={task.verificationSteps?.map(step => ({
                    id: `step-${Math.random().toString(36).substr(2, 9)}`,
                    content: step,
                    status: 'proposed',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  })) || []}
                  onUpdate={(newItems) => {
                    if (onUpdateTask) {
                      onUpdateTask(task.id, task.project, {
                        verificationSteps: newItems.map(item => item.content)
                      });
                      
                      // If items are empty, reset editing state for this section
                      if (newItems.length === 0) {
                        setEditingSections(prev => ({
                          ...prev,
                          verificationSteps: false
                        }));
                      }
                    }
                  }}
                />
              ) : (
                <div className="text-gray-600 block" style={{display: 'block'}}>
                  <h4 className="font-medium text-gray-700 mb-1 block" style={{display: 'block'}}>Verification Steps</h4>
                  <ul className="list-disc pl-5 text-gray-600 block">
                    {task.verificationSteps?.map((step, index) => (
                      <li key={index} className="block">{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Requirements - With Approval Status - Handled by centralized layout logic */}
          {determineTaskSectionVisibility('requirements', task, onUpdateTask, editingSections).visible && (
            <div id={`requirements-${task.id}`} className="mt-4 text-base block" style={{display: 'block'}} onClick={(e) => e.stopPropagation()}>
              {typeof onUpdateTask === 'function' &&
              typeof onApproveRequirementItem === 'function' &&
              typeof onVetoRequirementItem === 'function' &&
              typeof onUpdateRequirementItems === 'function' &&
              task.requirementItems ? (
                <ApprovalItemList
                  label="Requirements"
                  items={task.requirementItems}
                  readOnly={readOnly}
                  onUpdate={(newItems) => {
                    if (onUpdateRequirementItems) {
                      onUpdateRequirementItems(task.id, newItems);
                      
                      // If items are empty, reset editing state for this section
                      if (newItems.length === 0) {
                        setEditingSections(prev => ({
                          ...prev,
                          requirements: false
                        }));
                      }
                    }
                  }}
                  onApprove={(itemId) => {
                    console.log(`[TaskCard] Requirements - onApprove handler triggered for task ${task.id}, item ${itemId}`);
                    if (onApproveRequirementItem) {
                      console.log(`[TaskCard] Requirements - Calling onApproveRequirementItem handler`);
                      onApproveRequirementItem(task.id, itemId)
                        .then(() => console.log(`[TaskCard] Requirements - onApproveRequirementItem completed successfully for item ${itemId}`))
                        .catch(error => console.error(`[TaskCard] Requirements - Error in onApproveRequirementItem:`, error));
                    } else {
                      console.log(`[TaskCard] Requirements - onApproveRequirementItem handler not available`);
                    }
                  }}
                  onVeto={(itemId) => {
                    console.log(`[TaskCard] Requirements - onVeto handler triggered for task ${task.id}, item ${itemId}`);
                    if (onVetoRequirementItem) {
                      console.log(`[TaskCard] Requirements - Calling onVetoRequirementItem handler`);
                      onVetoRequirementItem(task.id, itemId)
                        .then(() => console.log(`[TaskCard] Requirements - onVetoRequirementItem completed successfully for item ${itemId}`))
                        .catch(error => console.error(`[TaskCard] Requirements - Error in onVetoRequirementItem:`, error));
                    } else {
                      console.log(`[TaskCard] Requirements - onVetoRequirementItem handler not available`);
                    }
                  }}
                />
              ) : onUpdateTask ? (
                // Using our fixed component that handles undefined callbacks
                <ApprovalItemList2
                  label="Requirements"
                  items={parseListString(task.requirements).map(content => ({
                    id: `req-${Math.random().toString(36).substr(2, 9)}`,
                    content,
                    status: 'proposed',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }))}
                  onUpdate={(newItems) => {
                    if (onUpdateTask) {
                      onUpdateTask(task.id, task.project, {
                        requirements: formatBulletedList(newItems.map(item => item.content))
                      });
                    }
                  }}
                />
              ) : (
                <div className="text-gray-600 block" style={{display: 'block'}}>
                  <h4 className="font-medium text-gray-700 mb-1 block" style={{display: 'block'}}>Requirements</h4>
                  {task.requirementItems ? (
                    <ul className="space-y-2 block">
                      {task.requirementItems.map((item) => (
                        <li
                          key={item.id}
                          className={`p-2 rounded block ${
                            item.status === 'approved'
                              ? 'border-l-4 border-green-500 pl-2 bg-green-50'
                              : ''
                          }`}
                        >
                          {item.content}
                          {item.status === 'approved' && (
                            <span className="ml-2 text-green-600 text-xs">(Approved)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="block">
                      <ReactMarkdown>{task.requirements}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Technical Plan - With Approval Status - Handled by centralized layout logic */}
          {determineTaskSectionVisibility('technicalPlan', task, onUpdateTask, editingSections).visible && (
            <div id={`technical-plan-${task.id}`} className="mt-4 text-base block" style={{display: 'block'}} onClick={(e) => e.stopPropagation()}>
              {typeof onUpdateTask === 'function' &&
              typeof onApproveTechnicalPlanItem === 'function' &&
              typeof onVetoTechnicalPlanItem === 'function' &&
              typeof onUpdateTechnicalPlanItems === 'function' &&
              task.technicalPlanItems ? (
                <ApprovalItemList
                  label="Technical Plan"
                  items={task.technicalPlanItems}
                  readOnly={readOnly}
                  onUpdate={(newItems) => {
                    if (onUpdateTechnicalPlanItems) {
                      onUpdateTechnicalPlanItems(task.id, newItems);
                      
                      // If items are empty, reset editing state for this section
                      if (newItems.length === 0) {
                        setEditingSections(prev => ({
                          ...prev,
                          technicalPlan: false
                        }));
                      }
                    }
                  }}
                  onApprove={(itemId) => {
                    console.log(`[TaskCard] TechnicalPlan - onApprove handler triggered for task ${task.id}, item ${itemId}`);
                    if (onApproveTechnicalPlanItem) {
                      console.log(`[TaskCard] TechnicalPlan - Calling onApproveTechnicalPlanItem handler`);
                      onApproveTechnicalPlanItem(task.id, itemId)
                        .then(() => console.log(`[TaskCard] TechnicalPlan - onApproveTechnicalPlanItem completed successfully for item ${itemId}`))
                        .catch(error => console.error(`[TaskCard] TechnicalPlan - Error in onApproveTechnicalPlanItem:`, error));
                    } else {
                      console.log(`[TaskCard] TechnicalPlan - onApproveTechnicalPlanItem handler not available`);
                    }
                  }}
                  onVeto={(itemId) => {
                    console.log(`[TaskCard] TechnicalPlan - onVeto handler triggered for task ${task.id}, item ${itemId}`);
                    if (onVetoTechnicalPlanItem) {
                      console.log(`[TaskCard] TechnicalPlan - Calling onVetoTechnicalPlanItem handler`);
                      onVetoTechnicalPlanItem(task.id, itemId)
                        .then(() => console.log(`[TaskCard] TechnicalPlan - onVetoTechnicalPlanItem completed successfully for item ${itemId}`))
                        .catch(error => console.error(`[TaskCard] TechnicalPlan - Error in onVetoTechnicalPlanItem:`, error));
                    } else {
                      console.log(`[TaskCard] TechnicalPlan - onVetoTechnicalPlanItem handler not available`);
                    }
                  }}
                />
              ) : onUpdateTask ? (
                // Using our fixed component that handles undefined callbacks
                <ApprovalItemList2
                  label="Technical Plan"
                  items={parseListString(task.technicalPlan).map(content => ({
                    id: `tech-${Math.random().toString(36).substr(2, 9)}`,
                    content,
                    status: 'proposed',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }))}
                  onUpdate={(newItems) => {
                    if (onUpdateTask) {
                      onUpdateTask(task.id, task.project, {
                        technicalPlan: formatNumberedList(newItems.map(item => item.content))
                      });
                    }
                  }}
                />
              ) : (
                <div className="text-gray-600 block" style={{display: 'block'}}>
                  <h4 className="font-medium text-gray-700 mb-1 block" style={{display: 'block'}}>Technical Plan</h4>
                  {task.technicalPlanItems ? (
                    <ol className="space-y-2 pl-5 list-decimal block">
                      {task.technicalPlanItems.map((item) => (
                        <li
                          key={item.id}
                          className={`p-2 rounded block ${
                            item.status === 'approved'
                              ? 'border-l-4 border-green-500 pl-2 bg-green-50'
                              : ''
                          }`}
                        >
                          {item.content}
                          {item.status === 'approved' && (
                            <span className="ml-2 text-green-600 text-xs">(Approved)</span>
                          )}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="block">
                      <ReactMarkdown>{task.technicalPlan}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Next Steps - With Approval Status - Handled by centralized layout logic */}
          {determineTaskSectionVisibility('nextSteps', task, onUpdateTask, editingSections).visible && (
            <div id={`next-steps-${task.id}`} className="mt-4 text-base block" style={{display: 'block'}} onClick={(e) => e.stopPropagation()}>
              {typeof onUpdateTask === 'function' &&
              typeof onApproveNextStepItem === 'function' &&
              typeof onVetoNextStepItem === 'function' &&
              typeof onUpdateNextStepItems === 'function' &&
              task.nextStepItems ? (
                <ApprovalItemList
                  label="Next Steps"
                  items={task.nextStepItems}
                  readOnly={readOnly}
                  onUpdate={(newItems) => {
                    if (onUpdateNextStepItems) {
                      onUpdateNextStepItems(task.id, newItems);
                      
                      // If items are empty, reset editing state for this section
                      if (newItems.length === 0) {
                        setEditingSections(prev => ({
                          ...prev,
                          nextSteps: false
                        }));
                      }
                    }
                  }}
                  onApprove={(itemId) => {
                    console.log(`[TaskCard] NextSteps - onApprove handler triggered for task ${task.id}, item ${itemId}`);
                    if (onApproveNextStepItem) {
                      console.log(`[TaskCard] NextSteps - Calling onApproveNextStepItem handler`);
                      onApproveNextStepItem(task.id, itemId)
                        .then(() => console.log(`[TaskCard] NextSteps - onApproveNextStepItem completed successfully for item ${itemId}`))
                        .catch(error => console.error(`[TaskCard] NextSteps - Error in onApproveNextStepItem:`, error));
                    } else {
                      console.log(`[TaskCard] NextSteps - onApproveNextStepItem handler not available`);
                    }
                  }}
                  onVeto={(itemId) => {
                    console.log(`[TaskCard] NextSteps - onVeto handler triggered for task ${task.id}, item ${itemId}`);
                    if (onVetoNextStepItem) {
                      console.log(`[TaskCard] NextSteps - Calling onVetoNextStepItem handler`);
                      onVetoNextStepItem(task.id, itemId)
                        .then(() => console.log(`[TaskCard] NextSteps - onVetoNextStepItem completed successfully for item ${itemId}`))
                        .catch(error => console.error(`[TaskCard] NextSteps - Error in onVetoNextStepItem:`, error));
                    } else {
                      console.log(`[TaskCard] NextSteps - onVetoNextStepItem handler not available`);
                    }
                  }}
                />
              ) : onUpdateTask ? (
                // Using our fixed component that handles undefined callbacks
                <ApprovalItemList2
                  label="Next Steps"
                  items={(task.nextSteps || []).map(content => ({
                    id: `next-${Math.random().toString(36).substr(2, 9)}`,
                    content,
                    status: 'proposed',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  }))}
                  onUpdate={(newItems) => {
                    if (onUpdateTask) {
                      // Convert ItemWithStatus objects back to strings
                      const stringItems = newItems.map(item => item.content);
                      
                      // Add the agent integration next steps if they don't already exist
                      const agentNextSteps = [
                        "Launch agent with 'Deploy Agent' button to implement feature",
                        "Use 'Show Me' button to demonstrate completed functionality",
                        "Review implementation and provide feedback with 'Give Feedback' form",
                        "Address feedback with agent using 'Address Feedback' button"
                      ];

                      // Filter out any agent-related steps that might already exist to avoid duplicates
                      const filteredNewItems = stringItems.filter(
                        (item) =>
                          !agentNextSteps.some(
                            (agentStep) =>
                              item.toLowerCase().includes('agent') ||
                              item.toLowerCase().includes('feedback')
                          )
                      );

                      // Combine filtered items with agent next steps
                      const combinedItems = [...filteredNewItems, ...agentNextSteps];

                      onUpdateTask(task.id, task.project, {
                        nextSteps: combinedItems
                      });
                    }
                  }}
                />
              ) : (
                <div className="text-gray-600 block" style={{display: 'block'}}>
                  <h4 className="font-medium text-gray-700 mb-1 block" style={{display: 'block'}}>Next Steps</h4>
                  {task.nextStepItems ? (
                    <ul className="space-y-2 pl-5 list-disc block">
                      {task.nextStepItems.map((item) => (
                        <li
                          key={item.id}
                          className={`p-2 rounded block ${
                            item.status === 'approved'
                              ? 'border-l-4 border-green-500 pl-2 bg-green-50'
                              : ''
                          }`}
                        >
                          {item.content}
                          {item.status === 'approved' && (
                            <span className="ml-2 text-green-600 text-xs">(Approved)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="list-disc pl-5 text-gray-600 block">
                      {task.nextSteps?.map((step, index) => (
                        <li key={index} className="block">{step}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Files */}
          {task.files && task.files.length > 0 && (
            <div className="mt-4 text-base block" style={{display: 'block'}}>
              <h4 className="font-medium text-gray-700 mb-1 block" style={{display: 'block'}}>Files</h4>
              <ul className="list-disc pl-5 text-gray-600 block">
                {task.files.map((file, index) => (
                  <li key={index} className="truncate block">
                    {file}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Creation details - all in relative time */}
          <div className="mt-4 text-xs text-gray-500">
            <div className="flex items-center justify-end mb-1">
              <button
                onClick={copyTaskUrl}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded hover:bg-gray-100"
                title="Copy task link"
              >
                <FaListAlt size={12} />
                {showUrlCopied && <span className="ml-1 text-green-600">Copied!</span>}
              </button>
            </div>
            <p>Last updated {formatTimeAgo(task.updatedAt)}</p>
            {task.completedAt && <p>Completed {formatTimeAgo(task.completedAt)}</p>}
            {task.reviewedAt && <p>Reviewed {formatTimeAgo(task.reviewedAt)}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// Export a memoized version of the component to prevent unnecessary re-renders
export default React.memo(TaskCard, (prevProps, nextProps) => {
  // Compare all relevant properties to ensure proper re-rendering
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.status === nextProps.task.status &&
    prevProps.task.updatedAt === nextProps.task.updatedAt &&
    prevProps.task.description === nextProps.task.description &&
    prevProps.task.userImpact === nextProps.task.userImpact &&
    prevProps.task.initiative === nextProps.task.initiative &&
    // Check item collections for changes
    JSON.stringify(prevProps.task.requirementItems) ===
      JSON.stringify(nextProps.task.requirementItems) &&
    JSON.stringify(prevProps.task.technicalPlanItems) ===
      JSON.stringify(nextProps.task.technicalPlanItems) &&
    JSON.stringify(prevProps.task.nextStepItems) === JSON.stringify(nextProps.task.nextStepItems) &&
    // Compare handlers
    prevProps.onStatusChange === nextProps.onStatusChange &&
    prevProps.onMarkTested === nextProps.onMarkTested &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.onUpdateDate === nextProps.onUpdateDate &&
    prevProps.onUpdateTask === nextProps.onUpdateTask &&
    prevProps.onToggleStar === nextProps.onToggleStar &&
    // Item status handlers
    prevProps.onApproveRequirementItem === nextProps.onApproveRequirementItem &&
    prevProps.onVetoRequirementItem === nextProps.onVetoRequirementItem &&
    prevProps.onUpdateRequirementItems === nextProps.onUpdateRequirementItems &&
    prevProps.onApproveTechnicalPlanItem === nextProps.onApproveTechnicalPlanItem &&
    prevProps.onVetoTechnicalPlanItem === nextProps.onVetoTechnicalPlanItem &&
    prevProps.onUpdateTechnicalPlanItems === nextProps.onUpdateTechnicalPlanItems &&
    prevProps.onApproveNextStepItem === nextProps.onApproveNextStepItem &&
    prevProps.onVetoNextStepItem === nextProps.onVetoNextStepItem &&
    prevProps.onUpdateNextStepItems === nextProps.onUpdateNextStepItems
  );
});
