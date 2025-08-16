# Task Management Filtering System

## The Human Side of Task Management

Let's walk through the natural lifecycle of managing tasks in our system, and how the filtering tools help you at each stage. I'll guide you through the journey of finding, tracking, and processing tasks with a focus on the questions you'll be asking yourself and how our filtering system answers them.

### Stage 1: Finding What Needs Your Attention

**Your Question**: "What should I be working on right now?"

When you first open the task page, you're probably wondering what needs your attention most urgently. Here's how to find that:

1. **Start with All Pending Tasks**: Click the "All Pending" filter tab. This immediately narrows down your view to only tasks that need action - anything that's not done or reviewed yet.

2. **Focus on Your Projects**: Click the "Projects" dropdown and select the projects you're responsible for. This is especially helpful if you're working across multiple initiatives and need to focus only on your areas.

3. **Sort by Priority**: In the "Sort By" dropdown, select "Priority" to see high-priority items at the top. If there are multiple high-priority tasks, you might want to sort by "Last Updated" instead to see what's been recently active.

Think of this as asking: "What's important, relevant to me, and needs attention now?" Your go-to filter combination might be: All Pending → Your Projects → Priority sorting.

### Stage 2: Processing New Tasks

**Your Question**: "What's new that I need to evaluate?"

When checking what's recently been added to your plate:

1. **Look at Proposed Tasks**: Click the "Proposed" tab to see tasks that have been suggested but not yet started. These often need your initial assessment.

2. **Sort by Creation Date**: Change the sort to "Creation Date" to see the newest proposals first. This helps you spot what's just arrived.

3. **Save This Filter**: If you check for new tasks regularly, click the gear icon and select "Save Current Filter." Name it something like "New Tasks Review" so you can quickly return to this view.

You're essentially asking: "What's new that I need to evaluate and potentially add to my active workload?" This is where the Proposed status combined with creation date sorting becomes invaluable.

### Stage 3: Daily Work Management

**Your Question**: "What am I actively working on today?"

For your daily work focus:

1. **Filter by In-Progress**: Click the "In Progress" tab to see only tasks you've already started.

2. **Multi-select with Todo**: Want to see both in-progress tasks and those ready to start? Hold Ctrl/Cmd and click both "In Progress" and "Todo" tabs. (Note: Multi-select for status filters isn't currently implemented, but would be valuable!)

3. **Project Focus**: Narrow down to just the project you're focusing on today using the project selector.

This combination answers: "What should be on my immediate radar for today's work?" You're looking at the intersection of active work and specific project focus.

### Stage 4: Reviewing Completed Work

**Your Question**: "What have we finished recently that needs review?"

When it's time to review completed work:

1. **Recent Completions**: Click the "Recently Completed" tab to see what's been finished in the last 48 hours.

2. **Done But Not Reviewed**: Alternatively, click the "Done" tab to see all completed tasks that haven't yet been reviewed.

3. **Cross-Project Review**: If you're doing a review across all projects, make sure "All" is selected in the project filter.

You're looking to answer: "What work has been completed that I need to verify or provide feedback on?" The Recently Completed and Done filters directly address this question.

### Stage 5: Reporting and Analysis

**Your Question**: "What's our overall progress and what's holding us back?"

For status reporting and analysis:

1. **Full View**: Start with "All Active" to get a complete picture.

2. **Check Blockers**: Look at "On Hold" tasks to identify blockers that may need escalation.

3. **Status Distribution**: Look at the counts on each status tab to see how tasks are distributed across the workflow.

4. **Save Complex Filters**: If you've created a specific view that helps with reporting (like all high-priority tasks across key projects), save it as a named filter for future reports.

This approach helps answer: "What's our overall status and where should we focus our attention?"

### Practical Tips for Power Users

- **Bookmarkable Filters**: Notice how the URL changes when you apply filters? Bookmark that URL for quick access to specific filtered views.

- **Task Search**: When someone mentions a specific task ID in a meeting, use the search icon (magnifying glass) to jump directly to that task.

- **Cleanup When Needed**: If you notice duplicate tasks, use the gear icon → "Clean Duplicate Tasks" to tidy up the database.

- **Start Your Day Right**: Consider creating three saved filters: "My Active Work," "Needs My Review," and "Team Overview" to quickly switch between your most common perspectives.

Now that we understand the human workflow, let's dive into the technical details of how these filters work.

## Filter Types

### Status Filters

Status filters control which task states are displayed:

| Filter Name | Description | UI Display | 
|-------------|-------------|-----------|
| `all` | All active tasks (excludes done and reviewed) | "All Active" with blue background |
| `proposed` | Only tasks with 'proposed' status | "Proposed" with purple background |
| `backlog` | Only tasks with 'backlog' status | "Backlog" with slate background |
| `todo` | Only tasks with 'todo' status | "To Do" with blue background |
| `in-progress` | Only tasks with 'in-progress' status | "In Progress" with yellow background |
| `on-hold` | Only tasks with 'on-hold' status | "On Hold" with amber background |
| `done` | Only tasks with 'done' status | "Done" with green background |
| `reviewed` | Only tasks with 'reviewed' status | "Reviewed" with indigo background |
| `archived` | Only tasks with 'archived' status | "Archived" with gray background |
| `pending` | All non-completed tasks (proposed, backlog, todo, in-progress, on-hold) | "All Pending" with blue background |
| `recent-completed` | Tasks completed in the last two days | "Recently Completed" with green background |

### Project Filters

Project filters determine which projects' tasks are displayed:

| Filter Value | Description |
|--------------|-------------|
| `all` | Show tasks from all projects |
| `none` | Show only tasks with no project assigned |
| Single project ID | Show tasks from a specific project |
| Array of project IDs | Show tasks from multiple selected projects |

### Sort Options

Tasks can be sorted by:

| Sort Option | Description | Default Direction |
|-------------|-------------|-------------------|
| `created` | Sort by creation date | Descending (newest first) |
| `updated` | Sort by last updated date | Descending (newest first) |
| `priority` | Sort by priority level | Descending (high to low) |
| `status` | Sort by task status | Ascending (earlier stages first) |

## Filter UI Components

### Status Filter Tabs

- Implemented as a horizontal row of clickable buttons
- Each button shows the count of tasks with that status
- Active filter is highlighted with status-specific color
- Shows all available statuses with counts for easy selection

### Project Selector

- Collapsible component that shows a summary when collapsed
- Expands to show all projects with checkboxes when clicked
- Provides "All" and "None" quick selection buttons
- Allows multi-select of projects
- Displays a summary of the current selection (e.g., "3 projects selected")
- Projects are sorted alphabetically by name

### Sort Controls

- Dropdown menus for sort field and sort direction
- Sort field options: Creation Date, Last Updated, Priority, Status
- Sort direction options: Ascending, Descending
- Default sort is by creation date, newest first

### Saved Filters

- Users can save the current filter combination with a name
- Saved filters appear as chips/tags with a delete button
- Clicking a saved filter applies all its settings at once
- Saved filters are stored in localStorage for persistence

### Task Search

- Expands from a search icon to an input field
- Allows direct navigation to a specific task by ID
- Collapses when clicked outside

### Task Filter Settings Menu

- Accessible via the gear/cog icon
- Contains options for:
  - Saving the current filter
  - Cleaning up duplicate tasks (server-side)
  - Toggling client-side deduplication
  - Running manual deduplication

## Filter Logic Implementation

### Filter Storage

- Filter preferences are saved to localStorage under 'taskFilterPreferences'
- Saved filters are stored in localStorage under 'taskSavedFilters'
- Filter expanded/collapsed state is saved in localStorage under 'taskFiltersExpanded'

### URL Query Parameters

When filters are applied, they are reflected in the URL:
- `filter` - Current status filter (omitted if 'all')
- `project` - Current project filter (omitted if 'all')
- `sort` - Current sort field (omitted if default)
- `direction` - Current sort direction (omitted if default)

This allows for bookmarking, sharing, and restoring filter states.

### Task Filtering Process

The filtering process occurs in these steps:

1. **Status Filtering**:
   - Uses predefined filter predicates based on the selected status filter
   - Special handling for 'recent-completed' to check completion within the last two days
   - Default 'all' filter excludes 'done' and 'reviewed' tasks

2. **Project Filtering**:
   - Occurs at API request level for initial load
   - Dynamically applied when tasks are created or updated in real-time
   - Multi-project selection creates an array-based filter

3. **Sorting**:
   - Initial server load always returns newest-first by creation date
   - Additional sorting applied client-side when sort preferences change
   - Re-sorting happens when tasks are added, updated, or when sort preferences change

4. **Deduplication**:
   - Optional client-side deduplication to remove duplicate tasks
   - Two-step process: first by ID, then by title+project combination
   - Manual deduplication option in settings menu
   - Server-side deduplication via cleanup API endpoint

## Filter Workflows

### Setting Up Filters

1. **Basic Filtering**:
   - Click on a status tab to filter by status
   - Use the Projects dropdown to select one or more projects
   - Adjust sort options to change the task order

2. **Saving Filters**:
   - Configure the filters as desired
   - Click the gear icon and select "Save Current Filter"
   - Enter a name for the filter
   - Click "Save"

3. **Using Saved Filters**:
   - Click on a saved filter chip/tag to instantly apply its settings
   - Delete saved filters by clicking the trash icon in the filter chip

### Special Features

1. **Task Search**:
   - Click the search icon to expand the search field
   - Enter a task ID and press Enter
   - Direct navigation to the task detail page occurs

2. **Deduplication**:
   - Click the gear icon in filters
   - Select "Clean Duplicate Tasks (Server)" for server-side cleanup
   - Toggle "Client Deduplication" on/off for automatic client-side cleanup
   - Use "Run Manual Deduplication" to clean only the current view

3. **Filter Collapsing**:
   - Click the arrow button next to "Task Filters" to collapse the filter section
   - Preference is saved for future sessions

### Filter States and Transitions

The filter system maintains state across different components:
- TaskContext manages overall filter state
- Components receive and update filter state via props
- LocalStorage preserves filter preferences between sessions
- URL parameters reflect current filter state and can be shared

## Technical Implementation Notes

1. **Performance Optimizations**:
   - Memoized filter predicates to avoid recalculation
   - Optional client-side deduplication to balance performance and accuracy
   - Efficient sorting by creation date for default ordering
   - Abortable API requests for filter changes

2. **Real-Time Updates**:
   - Filters are applied to real-time task updates
   - New tasks are checked against current filters before display
   - Task counts are updated dynamically with real-time changes

3. **Error Handling**:
   - Filter errors maintain current view without disruption
   - Network failures preserve current task list
   - Search validation prevents invalid task ID navigation

4. **Accessibility**:
   - Filter buttons include counts in accessible format
   - Expanded filter UI is keyboard navigable
   - Filter collapse state is preserved between sessions

## Filter API Integration

The task filtering system interfaces with the API through:
- Query parameter building in `getTasks()` function
- Support for multi-value parameters (for project arrays)
- Deduplication flags and parameters
- Abort controllers for cancellable requests

## Adding New Filters

To add a new filter type:
1. Add the new filter type to appropriate constants
2. Update the TaskContext state and filter logic
3. Add UI components to TaskFilters
4. Update the filter storage and URL parameter logic
5. Update the saved filter interface to include the new filter type