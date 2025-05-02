import React from 'react';
import { useLocalStorageBoolean, STORAGE_KEYS } from '@/utils/localStorage-helpers';

interface ControlsToggleProps {
  className?: string;
}

/**
 * Reusable controls visibility toggle button
 * Can be placed in any location to control the global commands visibility
 */
const ControlsToggle: React.FC<ControlsToggleProps> = ({ className = "" }) => {
  // Use our localStorage hook for persistent state
  const [showControls, _, toggleShowControls] = useLocalStorageBoolean(
    STORAGE_KEYS.COMMANDS_VISIBILITY,
    false // Default to false
  );
  
  return (
    <button
      onClick={toggleShowControls}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200 flex items-center ${className}`}
      aria-label="Toggle controls visibility"
    >
      {showControls ? 'Hide Controls' : 'Show Controls'}
    </button>
  );
};

export default ControlsToggle;