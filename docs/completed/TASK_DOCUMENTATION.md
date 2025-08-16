# Task System Enhancements - Detailed Task Documentation

## User Experience Focus

When creating or updating tasks and initiatives, always focus on user impact and business value first, with technical details secondary. This helps ensure that the task management system serves as an effective communication tool for both technical and non-technical stakeholders.

### Content Guidelines

1. **User Impact Field**: Always populate this field with a clear explanation of how a task benefits users or the business
   - Focus on outcomes, not implementation details
   - Use conversational, accessible language
   - Avoid technical jargon in this field

2. **Description Field**: Use this for technical implementation details
   - Include technical specifications, architecture considerations, and implementation notes
   - This information helps AI agents or developers continue work on the task

3. **Verification Steps**: Always include specific steps to verify the task has been completed correctly
   - These steps should be clear enough for anyone to follow and confirm the work
   - Each step should be a concrete action with an expected result
   - Include edge cases or specific scenarios to test
   - Format as a numbered list of individual steps

4. **Initiative Titles**: Should clearly communicate strategic purpose
   - Initiatives group related tasks toward a particular aim
   - Titles should reflect the business outcome, not technical implementation

## Interface Patterns

- **Tasks and Initiatives**: Both use collapsible cards that show essential information when collapsed
- **Collapsed View**: Shows title, user impact (for tasks), and status indicators
- **Expanded View**: Shows full details including technical implementation information
- **Inline Editing**: All text fields are directly editable by clicking on them

## Task 1: Fix UI Flashing on Dashboard Updates
**Status**: Todo
**Priority**: High

### Description
Address the UI flashing issue that occurs when updating content in the dashboard. The current implementation triggers full re-renders instead of targeted updates, causing a jarring user experience. This task involves implementing proper React optimization techniques to prevent unnecessary re-renders and ensure smooth UI transitions.

### Implementation Details
1. Identify components that unnecessarily re-render using React DevTools
2. Implement React.memo for pure components that don't need to re-render
3. Use useCallback for event handlers to prevent recreation on each render
4. Apply useMemo for computed values and derived state
5. Fix list rendering with proper key strategies to minimize DOM operations
6. Implement CSS transitions instead of class swapping for smoother state changes
7. Ensure useEffect dependencies are correctly specified to prevent cascading updates

### Files to Modify
- `/src/components/TaskCard.tsx`
- `/src/components/TaskFilters.tsx`
- `/src/pages/tasks.tsx`
- `/src/contexts/TaskContext.tsx`

### Verification Steps
1. Monitor re-renders using React DevTools during various operations
2. Test task creation, deletion, and status updates to verify no UI flashing occurs
3. Verify smooth transitions between states
4. Confirm performance improvement using React Profiler
5. Test on lower-end devices to ensure performance is acceptable

## Task 2: Fix Task Sorting on Creation
**Status**: Todo
**Priority**: High

### Description
New tasks are not sorting correctly when the list is sorted by creation date. When a user creates a new task, it should immediately appear at the top of the list when sorted by creation date (newest first). This issue appears to be related to how optimistic updates are handled in the task creation flow.

### Implementation Details
1. Modify the addTask function in TaskContext to properly handle sorting
2. Update the optimistic task creation to respect the current sort order
3. Ensure temporary tasks have proper timestamps that work with the sorting mechanism
4. Fix the filteredTasks useMemo function to maintain correct sort order after task insertion
5. Add client-side re-sorting after optimistic updates

### Files to Modify
- `/src/contexts/TaskContext.tsx`

### Verification Steps
1. Set sort order to "created" with direction "desc"
2. Create a new task and verify it appears at the top of the list
3. Change sort direction to "asc" and create a new task
4. Verify the new task appears at the bottom of the list
5. Test with other sort criteria (priority, status) to ensure correct positioning

## Task 3: Add Backlog Status and Actionable Button
**Status**: Todo
**Priority**: Medium

### Description
Add a new "backlog" status for tasks that are not yet ready to be worked on. Tasks in backlog status should have an "Actionable" button that moves them to the "todo" status. This allows for better organization of tasks that are planned but not yet actionable.

### Implementation Details
1. Update TASK_STATUSES constant to include BACKLOG
2. Add UI styling for backlog status in STATUS_DISPLAY
3. Update TaskCard to show "Actionable" button for backlog tasks
4. Implement handler for moving tasks from backlog to todo
5. Update filters to include backlog tasks
6. Update task form to allow setting backlog status

### Files to Modify
- `/src/config/constants.ts`
- `/src/components/TaskCard.tsx`
- `/src/components/TaskFilters.tsx`
- `/src/components/TaskForm.tsx`

### Verification Steps
1. Create a new task and set status to "backlog"
2. Verify it appears with backlog styling
3. Click "Actionable" button and verify it moves to "todo" status
4. Filter by backlog status and verify only backlog tasks appear
5. Verify task counts update correctly

## Task 4: Implement AI Task Proposal System
**Status**: Todo
**Priority**: Medium

### Description
Create a system for AI-proposed tasks that are clearly marked and require explicit approval or rejection. When a task is proposed by AI, it should be in "proposed" state with special UI treatment showing "Reject" and "Approve" buttons. This establishes a clear workflow for handling AI suggestions.

### Implementation Details
1. Add TASK_SOURCES constant to track the origin of tasks (AI, USER, SYSTEM)
2. Update Task interface to include source field
3. Create special UI treatment for AI-proposed tasks
4. Implement "Reject" button that deletes the task
5. Implement "Approve" button that moves the task to "todo" status
6. Add visual indicator for AI-proposed tasks
7. Update API service to include source when creating tasks

### Files to Modify
- `/src/config/constants.ts`
- `/src/types/index.ts`
- `/src/components/TaskCard.tsx`
- `/src/contexts/TaskContext.tsx`
- `/src/services/taskApiService.ts`

### Verification Steps
1. Create a task with source set to "ai"
2. Verify the task shows special UI treatment
3. Test "Reject" button and verify task is deleted
4. Test "Approve" button and verify task moves to "todo" status
5. Verify visual indicators for AI tasks are clear and distinct

## Task 5: Update Actions Button Design
**Status**: Todo
**Priority**: Low

### Description
Redesign the Actions button to show only an icon and ensure it's the same height as surrounding buttons. Currently, the Actions button has both text and icon which is inconsistent with the minimalist design of the interface.

### Implementation Details
1. Update the Actions button in TaskFilters to use only the cog icon
2. Set explicit height to match surrounding buttons
3. Ensure proper accessibility with aria-label
4. Add tooltip for better usability
5. Ensure consistent styling with other icon buttons

### Files to Modify
- `/src/components/TaskFilters.tsx`
- `/src/styles/globals.css` (if needed for new icon button styling)

### Verification Steps
1. Verify Actions button shows only icon
2. Check that height matches other buttons
3. Test tooltip functionality
4. Verify the dropdown menu still functions correctly
5. Test accessibility with screen reader

## Task 6: Simplify Add Task Button Text
**Status**: Todo
**Priority**: Low

### Description
Simplify the "Add New Task" button to just say "Add" for a cleaner, more streamlined interface.

### Implementation Details
1. Update the Add New Task button text in TaskFilters
2. Adjust button width to account for shorter text
3. Ensure button remains visually prominent despite text change

### Files to Modify
- `/src/components/TaskFilters.tsx`

### Verification Steps
1. Verify button text now says "Add"
2. Check that button styling remains appropriate
3. Verify button functionality remains unchanged

## Task 7: Implement Inline Task Creation
**Status**: Todo
**Priority**: High

### Description
Replace the modal task creation form with an inline editor that allows users to create tasks while still viewing surrounding content. This provides a more seamless and context-aware task creation experience.

### Implementation Details
1. Create new InlineTaskForm component that renders directly in the task list
2. Update placeholder text to be more helpful and descriptive
3. Implement smooth animation for form appearance
4. Ensure form properly captures focus when shown
5. Implement auto-growing text areas
6. Allow ESC key to cancel and Enter to submit
7. Maintain context awareness by showing the form in the correct position in the list

### Files to Modify
- Create new `/src/components/InlineTaskForm.tsx`
- Update `/src/pages/tasks.tsx`
- Update `/src/contexts/TaskContext.tsx` if needed

### Verification Steps
1. Click "Add" button and verify inline form appears
2. Check that placeholder text is helpful and descriptive
3. Test form submission and verify task is created
4. Test cancellation with ESC key
5. Verify the form appears in the correct position in the list
6. Test that focus behavior works correctly

## Task 8: Improve Form Field Helper Text
**Status**: Todo
**Priority**: Medium

### Description
Update placeholder and helper text in task creation forms to be more descriptive and helpful. Current placeholders are generic and don't provide enough guidance to users.

### Implementation Details
1. Update title field placeholder to "What do you want to get done?"
2. Update description placeholder to "Think about what success would look like here, list any user stories, experiences, outcomes or requirements to create those outcomes that would make this a win..."
3. Add more helpful placeholder text for other fields
4. Consider adding tooltips for additional context
5. Ensure placeholder text is accessible

### Files to Modify
- `/src/components/TaskForm.tsx`
- New `/src/components/InlineTaskForm.tsx`

### Verification Steps
1. Open task creation form and verify new placeholder text
2. Test readability and helpfulness of new text
3. Verify placeholders don't overflow their fields
4. Test with screen readers to ensure accessibility

## Task 9: Enhance Initiative Reference in Task View
**Status**: Todo
**Priority**: Medium

### Description
Improve how related initiatives are displayed in the expanded task view. Currently, initiatives are mentioned but not prominently displayed or linked to their respective views.

### Implementation Details
1. Update the expanded task view to prominently show related initiative
2. Add visual icon to indicate initiative relationship
3. Make initiative name clickable to navigate to filtered initiative view
4. Add additional metadata about the initiative if available
5. Ensure proper styling to make the relationship clear

### Files to Modify
- `/src/components/TaskCard.tsx`

### Verification Steps
1. Create a task with an initiative
2. Expand the task and verify initiative is prominently displayed
3. Click on initiative and verify navigation works
4. Test styling in different themes and modes
5. Verify accessibility of the new interactive elements

## Task 10: Remove Done and Trash for Certain Tasks
**Status**: Todo
**Priority**: Medium

### Description
Modify the task card to selectively hide the Done and Trash buttons based on task properties or user permissions. This prevents accidental marking as done or deletion for certain tasks.

### Implementation Details
1. Update the TaskCard component to conditionally render action buttons
2. Create a utility function to determine which actions are available for a task
3. Consider task status, user permissions, and other properties
4. Ensure UI remains consistent even with fewer buttons
5. Add tooltips to explain why certain actions are unavailable when relevant

### Files to Modify
- `/src/components/TaskCard.tsx`
- Create utility function in `/src/utils/taskActions.ts`

### Verification Steps
1. Test with various task configurations to verify correct buttons are shown
2. Ensure UI remains balanced when fewer buttons are shown
3. Verify tooltips are helpful and descriptive
4. Test that accessible navigation works correctly with dynamically shown/hidden buttons