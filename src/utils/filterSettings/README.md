# Filter Settings System

This module implements a centralized architecture for managing filter settings across the application. It follows a layered design with proper separation of concerns to ensure consistency, maintainability, and testability.

## 📂 Structure

```
/src/utils/filterSettings/
├── index.ts                    # Public API exports
├── types.ts                    # Type definitions for filter settings
├── constants.ts                # Storage keys and default values
├── actions.ts                  # Action creators for filter operations
├── storage.ts                  # Storage utility functions (get/set/clear)
├── README.md                   # This documentation file
└── hooks/
    ├── useProjectFilter.ts     # Project filter specific hook
    ├── useStatusFilter.ts      # Status filter specific hook (future)
    └── useSortSettings.ts      # Sort settings specific hook (future)
```

## 🧩 Architecture

This module follows a layered architecture with the following responsibilities:

1. **State Model Layer** (`types.ts`):
   - Defines the data structure for filter settings
   - Provides TypeScript interfaces for type safety

2. **Configuration Layer** (`constants.ts`):
   - Defines default values for all settings
   - Centralizes storage keys for consistency
  
3. **Action Layer** (`actions.ts`):
   - Implements pure functions for manipulating filter state
   - Handles the logic of changing filters without side effects
  
4. **Storage Layer** (`storage.ts`):
   - Provides functions for saving and loading settings
   - Handles backward compatibility with legacy storage

5. **Hook Layer** (`hooks/`):
   - Implements React hooks for components to use
   - Connects React components to the filter settings system

## 📋 Usage Guide

### Basic Usage

```tsx
import { useProjectFilter } from '@/utils/filterSettings';

function MyComponent({ projects }) {
  // Initialize the hook with available projects
  const {
    selectedProjects,
    toggleProject,
    selectAll,
    selectNone
  } = useProjectFilter(projects);
  
  return (
    <div>
      <button onClick={selectAll}>Select All</button>
      <button onClick={selectNone}>Select None</button>
      
      {projects.map(project => (
        <div key={project.id}>
          <input
            type="checkbox"
            checked={selectedProjects.includes(project.id)}
            onChange={() => toggleProject(project.id)}
          />
          <label>{project.name}</label>
        </div>
      ))}
    </div>
  );
}
```

### Advanced Usage

```tsx
import { 
  useProjectFilter, 
  loadFilterSettings, 
  saveFilterSettings,
  applyFilters
} from '@/utils/filterSettings';

function MyComponent({ projects }) {
  // Use hook with initial filter
  const projectFilter = useProjectFilter(projects, 'all');
  
  // Load complete settings
  const loadSavedFilter = () => {
    const settings = loadFilterSettings();
    // Apply specific parts
    projectFilter.setFilterValue(settings.projectFilter.value);
  };
  
  // Save complete filter as a preset
  const saveCurrentFilter = (name) => {
    const settings = loadFilterSettings();
    
    // Save to preset storage
    const presets = JSON.parse(localStorage.getItem('filterPresets') || '[]');
    presets.push({
      name,
      settings
    });
    localStorage.setItem('filterPresets', JSON.stringify(presets));
  };
  
  return (
    <div>
      {/* UI components */}
    </div>
  );
}
```

## ⚙️ Implementation Details

### Single Source of Truth

All filter settings are stored in a unified structure in localStorage under a single key. This ensures that all components access the same data and avoids synchronization issues.

### Backward Compatibility

For backward compatibility with existing code, the storage layer also updates legacy localStorage keys when saving settings. This allows for a gradual migration to the new system.

### Performance Considerations

- Hooks implement memoization to prevent unnecessary renders
- Storage operations are batched when possible
- Deep equality checks are used to minimize localStorage writes

### Error Handling

All storage operations include proper error handling to ensure that the application remains functional even if localStorage is unavailable or corrupted.

## 🧪 Testing

Each layer of this architecture can be tested in isolation:

- **Action Layer**: Pure functions with no side effects
- **Storage Layer**: Mock localStorage for testing
- **Hook Layer**: Use React Testing Library

## 🔄 Migration

To migrate existing components to use this system:

1. Replace direct localStorage calls with hook functions
2. Remove duplicated filter logic
3. Use the centralized hooks for all filter operations

## ⚠️ Common Issues and Solutions

### Preventing Re-Render Loops

When integrating this filter system with existing components, you may encounter re-rendering loops if both the parent component and the filter hook are trying to manage the same state. Here's how to prevent this:

#### Problem:

```
Parent Component (State A) ↔ Filter Hook (State B)
   |                           |
   ↓                           ↓
Updates State B        Updates State A
   |                           |
   ↓                           ↓
Causes Hook to        Causes Parent to
re-render              re-render
   |                           |
   ↓                           ↓
   ⟳                           ⟳
```

This creates an infinite loop of updates.

#### Solution:

1. **Use a Syncing Flag**: 
   - Maintain a ref to track when synchronization is happening
   - Skip updates when the sync flag is active

```tsx
// In your component
const isSyncingRef = useRef(false);

// When syncing from parent to hook
useEffect(() => {
  if (isSyncingRef.current) return;
  
  if (valuesDiffer(parentState, hookState)) {
    isSyncingRef.current = true;
    updateHookState(parentState);
    setTimeout(() => { isSyncingRef.current = false; }, 0);
  }
}, [parentState]);

// When syncing from hook to parent
useEffect(() => {
  if (isSyncingRef.current) return;
  
  if (valuesDiffer(hookState, parentState)) {
    isSyncingRef.current = true;
    updateParentState(hookState);
    setTimeout(() => { isSyncingRef.current = false; }, 0);
  }
}, [hookState]);
```

2. **Deep Equality Checks**:
   - Implement proper comparison of arrays and objects
   - Only update state when values actually change
   - Be mindful of array order differences (sort arrays before comparison)

3. **Memoization**:
   - Use `useCallback` for all handler functions
   - Use `useMemo` for computed values
   - Add proper dependency arrays to avoid unnecessary re-renders

### State Synchronization Between Components

When multiple components need to access and modify the same filter state, ensure they all use the same hook instance or share state through context.

## 📝 Future Enhancements

- Add more specialized hooks for different filter types
- Implement filter preset management
- Add server-side persistence of filter preferences
- Add synchronization between browser tabs
- Add React Context provider for application-wide filter state
- Implement undo/redo functionality for filter changes