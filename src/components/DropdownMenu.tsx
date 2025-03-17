import React, { useState, useRef, useEffect } from 'react';
import { Z_INDICES } from '@/config/constants';

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (e?: any) => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
  description?: string;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  label?: string;
  align?: 'left' | 'right';
  width?: number;
}

/**
 * A reusable dropdown menu component
 * Can be used for actions, filters, or any contextual menu
 */
export default function DropdownMenu({ 
  trigger, 
  items, 
  label,
  align = 'right',
  width = 220 
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle clicking an item
  const handleItemClick = (item: DropdownMenuItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <div 
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={label || "Open menu"}
      >
        {trigger}
      </div>

      {/* Menu */}
      {isOpen && (
        <div 
          ref={menuRef}
          className="absolute bg-white rounded-md shadow-lg border border-gray-200 py-1 mt-1"
          style={{ 
            [align === 'right' ? 'right' : 'left']: 0,
            width: `${width}px`,
            zIndex: Z_INDICES.DROPDOWN
          }}
        >
          {items.map(item => (
            <div 
              key={item.id}
              className={`
                px-4 py-2 text-sm cursor-pointer flex items-center
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}
                ${item.variant === 'danger' ? 'text-red-600' : 'text-gray-700'}
              `}
              onClick={() => handleItemClick(item)}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              <div>
                <div>{item.label}</div>
                {item.description && (
                  <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}