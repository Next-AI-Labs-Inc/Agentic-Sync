import React, { useState, useRef, useEffect } from 'react';

export interface PopoverProps {
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  children: React.ReactNode;
  className?: string;
}

/**
 * Popover component for displaying content on hover with smart positioning
 * Automatically adjusts position to prevent being cut off at screen edges
 */
function PopoverComponent({ content, position = 'top', children, className = '' }: PopoverProps) {
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
              top: '50%',
              transform: 'translateY(-50%)'
            };
          }

          // Check for vertical cutoff
          if (triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2 < 0) {
            // Adjust for top edge
            style.top = '0';
            style.transform = style.transform.replace('translateY(-50%)', '');
            arrowStyle.top = triggerRect.top + triggerRect.height / 2 + 'px';
          } else if (
            triggerRect.top + triggerRect.height / 2 + popoverRect.height / 2 >
            viewportHeight
          ) {
            // Adjust for bottom edge
            style.top = 'auto';
            style.bottom = '0';
            style.transform = style.transform.replace('translateY(-50%)', '');
            arrowStyle.top = 
              popoverRect.height - (viewportHeight - triggerRect.top - triggerRect.height / 2) + 'px';
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

          // Check for horizontal cutoff - same as top position
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
              top: '50%',
              transform: 'translateY(-50%)'
            };
          }

          // Check for vertical cutoff - same as right position
          if (triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2 < 0) {
            style.top = '0';
            style.transform = style.transform.replace('translateY(-50%)', '');
            arrowStyle.top = triggerRect.top + triggerRect.height / 2 + 'px';
          } else if (
            triggerRect.top + triggerRect.height / 2 + popoverRect.height / 2 >
            viewportHeight
          ) {
            style.top = 'auto';
            style.bottom = '0';
            style.transform = style.transform.replace('translateY(-50%)', '');
            arrowStyle.top = 
              popoverRect.height - (viewportHeight - triggerRect.top - triggerRect.height / 2) + 'px';
          }
          break;
      }

      // Apply calculated styles
      Object.assign(popover.style, style);
      
      // Find and apply arrow styles if it exists
      const arrow = popover.querySelector('.popover-arrow') as HTMLElement;
      if (arrow) {
        Object.assign(arrow.style, arrowStyle);
      }
    }
  }, [isVisible, position]);

  return (
    <div
      ref={containerRef}
      className={`popover-container relative inline-block ${className}`}
      onMouseEnter={showPopover}
      onMouseLeave={hidePopover}
      onFocus={showPopover}
      onBlur={hidePopover}
    >
      <div ref={triggerRef}>{children}</div>
      
      {isVisible && (
        <div
          ref={popoverRef}
          className="popover absolute z-50 bg-gray-800 text-white p-2 rounded-md text-sm shadow-lg whitespace-normal max-w-xs"
          style={{ minWidth: '150px' }}
        >
          {content}
          <div className="popover-arrow absolute w-3 h-3 bg-gray-800 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}

export default PopoverComponent;