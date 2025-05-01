/**
 * @deprecated - This component has been moved to @ix/shared-tools and should be imported from there.
 * import { Popover } from '@ix/popover';
 */

import React, { useState, useRef, useEffect } from 'react';
import { POPOVER_POSITIONS, PopoverPosition } from '@/constants/ui';

/**
 * Props for the Popover component
 */
interface PopoverProps {
  /** Content to display inside the popover */
  content: React.ReactNode;
  /** Position of the popover relative to its trigger element */
  position?: 'top' | 'right' | 'bottom' | 'left';
  /** Trigger element that toggles the popover visibility */
  children: React.ReactNode;
  /** Additional classes to apply to the popover trigger wrapper */
  className?: string;
}

/**
 * A reusable popover component that displays content when hovering over its children
 * Automatically positions itself to avoid being cut off by viewport edges
 */
function Popover({ 
  content, 
  position = 'top',
  children, 
  className = '' 
}: PopoverProps) {
  const [isVisible, setIsVisible] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Show/hide handlers
  const showPopover = () => setIsVisible(true);
  const hidePopover = () => setIsVisible(false);

  /**
   * Calculates and adjusts popover position to prevent it from being cut off by viewport edges
   * This effect runs whenever the popover visibility changes
   */
  useEffect(() => {
    if (isVisible && popoverRef.current && triggerRef.current) {
      const popover = popoverRef.current;
      const trigger = triggerRef.current;
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
        case POPOVER_POSITIONS.TOP:
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

        case POPOVER_POSITIONS.RIGHT:
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

        case POPOVER_POSITIONS.BOTTOM:
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

        case POPOVER_POSITIONS.LEFT:
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

export default Popover;