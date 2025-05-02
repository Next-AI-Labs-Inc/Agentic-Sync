import React, { useState, useEffect, useRef } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

// LocalStorage key for commands visibility
const COMMANDS_VISIBILITY_KEY = 'task_commands_visibility';

interface CommandToggleProps {
  initialVisible?: boolean;
  onChange?: (isVisible: boolean) => void;
}

const CommandToggle: React.FC<CommandToggleProps> = ({ initialVisible = true, onChange }) => {
  // State for commands visibility
  const [commandsVisible, setCommandsVisible] = useState<boolean>(initialVisible);
  
  // Use ref to prevent infinite loops with the onChange effect
  const initialLoadRef = useRef(true);

  // Load visibility state from localStorage on mount only
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(COMMANDS_VISIBILITY_KEY);
      if (savedState !== null) {
        const isVisible = savedState === 'true';
        setCommandsVisible(isVisible);
        
        // Only call onChange during initial load
        if (onChange && initialLoadRef.current) {
          onChange(isVisible);
          initialLoadRef.current = false;
        }
      }
    } catch (error) {
      console.error('Error loading commands visibility state:', error);
    }
  }, [onChange]);

  // Save visibility state to localStorage when it changes
  // This is a separate effect to avoid triggering onChange
  useEffect(() => {
    if (!initialLoadRef.current) { // Skip saving during initial load
      try {
        localStorage.setItem(COMMANDS_VISIBILITY_KEY, String(commandsVisible));
      } catch (error) {
        console.error('Error saving commands visibility state:', error);
      }
    }
  }, [commandsVisible]);

  // Toggle commands visibility
  const toggleCommandsVisibility = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion
    const newVisibility = !commandsVisible;
    setCommandsVisible(newVisibility);
    
    // Notify parent component of change
    if (onChange) {
      onChange(newVisibility);
    }
  };

  return (
    <button
      onClick={toggleCommandsVisibility}
      className="btn-outline-secondary command-toggle"
      title={commandsVisible ? "Hide commands" : "Show commands"}
    >
      {commandsVisible ? <FaChevronUp className="mr-1" size={12} /> : <FaChevronDown className="mr-1" size={12} />}
      {commandsVisible ? "Hide Commands" : "Show Commands"}
    </button>
  );
};

export default CommandToggle;