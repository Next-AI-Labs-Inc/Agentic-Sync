/**
 * Helpers for working with localStorage state
 */

import { useState, useEffect } from 'react';

// Storage keys
export const STORAGE_KEYS = {
  VIEW_MODE: 'ix_tasks_view_mode',
  COMMANDS_VISIBILITY: 'task_commands_visibility'
};

/**
 * Hook to use localStorage with React state
 * @param key - The localStorage key
 * @param defaultValue - Default value if not in localStorage
 * @returns [value, setValue] tuple
 */
export function useLocalStorage<T>(
  key: string, 
  defaultValue: T
): [T, (value: T) => void] {
  // Initialize with default, state will be updated in effect
  const [value, setValue] = useState<T>(defaultValue);

  // Load from localStorage on mount
  useEffect(() => {
    const loadValue = () => {
      try {
        const item = localStorage.getItem(key);
        if (item === null) {
          // No value in storage, set the default
          localStorage.setItem(key, JSON.stringify(defaultValue));
          setValue(defaultValue);
        } else {
          // Parse stored value
          setValue(item === 'true' ? true as unknown as T : 
                  item === 'false' ? false as unknown as T : 
                  JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
        setValue(defaultValue);
      }
    };

    // Initial load
    loadValue();

    // Listen for storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        loadValue();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom events for same-window communication
    window.addEventListener('localstorage-update', loadValue);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localstorage-update', loadValue);
    };
  }, [key, defaultValue]);

  // Update localStorage when value changes
  const updateValue = (newValue: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
      setValue(newValue);
      // Dispatch event for other components
      window.dispatchEvent(new Event('localstorage-update'));
      // Standard storage event doesn't fire in same window
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [value, updateValue];
}

/**
 * Simplified hook for boolean-specific localStorage interaction
 */
export function useLocalStorageBoolean(
  key: string,
  defaultValue: boolean
): [boolean, (value: boolean) => void, () => void] {
  const [value, setValue] = useLocalStorage<boolean>(key, defaultValue);

  // Convenience function to toggle the value
  const toggleValue = () => setValue(!value);

  return [value, setValue, toggleValue];
}