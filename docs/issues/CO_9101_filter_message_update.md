# Task Filter Message Update (CO_9101, CO_9103 & CO_9104)

## Requirements

1. In `/src/pages/tasks.tsx` (component CO_9104):
   - Change "No tasks found" to nothing (empty string)
   - Change "No tasks found for the selected project: [project name]" to "Nothing here yet."
   - Change the button text "create your first task" to "Create a Task"

2. When creating a new task from this interface:
   - Pre-select the currently selected project (if multiple projects, use resolver to choose one)
   - Pre-select the currently selected filter stage (e.g., if Brainstorm is selected in filter, pre-select Brainstorm for new task)

3. In `/src/components/TaskForm.tsx` (component CO_9103):
   - Move the Funnel stage menu (status options) to the minimized (default) view
   - Ensure the status options map correctly to the filters (if already the case, verify this)

## Scope
Limited to modifying text in the "no tasks found" states, ensuring selected filters/projects are applied to new tasks, and adjusting the TaskForm layout. No additional features or scope expansion.

## Files to Modify
- `/src/components/TaskFilters.tsx`
- `/src/pages/tasks.tsx`
- `/src/components/TaskForm.tsx`

## Implementation Status
- [x] Change "No tasks found" message to empty string
- [x] Change project-specific message to "Nothing here yet."
- [x] Update button text to "Create a Task"
- [x] Ensure selected filter stage is preloaded when creating new task
- [x] Ensure selected project is preloaded when creating new task
- [x] Move Funnel stage menu to minimized (default) view in TaskForm

## Implementation Summary

1. **Empty State Message Changes**:
   - Changed "No tasks found" header to empty string
   - Changed all empty state messages to "Nothing here yet."
   - Updated the button text from "Create your first task" to "Create a Task"

2. **Task Form Filtering**:
   - Added `initialStatus` and `initialProject` props to TaskForm component
   - Modified the TaskForm to initialize with the selected filter stage (status)
   - Modified the TaskForm to initialize with the selected project
   - Updated form reset logic to preserve both selected project and status

3. **TaskForm UI Changes**:
   - Moved the Status dropdown (Funnel stage menu) from the More Options section to the default view
   - Status options are now visible immediately when creating a new task
   - Expanded status dropdown to include all available status options, organized in the same grouping as the filters:
     - Collection: Inbox, Brainstorm
     - Maybe: Maybe, On Hold
     - Source Tasks: Backlog
     - Proposed: Proposed
     - Actionable: To Do
     - Engaged: In Progress
     - Review: For Review
     - Completions: Done, Reviewed, Archived