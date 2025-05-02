import React, { useRef, useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useLocalStorageBoolean, STORAGE_KEYS } from '@/utils/localStorage-helpers';

interface CommandToggleProps {
  initialVisible?: boolean;
  onChange?: (isVisible: boolean) => void;
}

const CommandToggle: React.FC<CommandToggleProps> = ({ initialVisible = true, onChange }) => {
  // Use our helper hook for localStorage
  const [commandsVisible, setCommandsVisible, toggleCommandsVisible] = useLocalStorageBoolean(
    STORAGE_KEYS.COMMANDS_VISIBILITY,
    initialVisible
  );
  
  // Use ref to prevent infinite loops with the onChange effect
  const initialLoadRef = useRef(true);

  // Call onChange when visibility changes
  useEffect(() => {
    if (onChange) {
      if (initialLoadRef.current) {
        initialLoadRef.current = false;
      } else {
        onChange(commandsVisible);
      }
    }
  }, [commandsVisible, onChange]);

  // Toggle commands visibility
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion
    toggleCommandsVisible();
  };

  return (
    <button
      onClick={handleToggle}
      className="btn-outline-secondary command-toggle"
      title={commandsVisible ? "Hide commands" : "Show commands"}
    >
      {commandsVisible ? <FaChevronUp className="mr-1" size={12} /> : <FaChevronDown className="mr-1" size={12} />}
      {commandsVisible ? "Hide Commands" : "Show Commands"}
    </button>
  );
};

export default CommandToggle;