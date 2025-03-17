# Tasks Management System TODOs

## High Priority: Enable Claude Agent Deployment from each task

Implement system to launch Claude with task-specific system prompts:

1. Create task-specific Claude system prompt generator
   - Generate different prompts based on task stage (Todo vs In-Progress vs Review)
   - Include task details (title, description, requirements, etc.)
   - Customize prompt based on task context and status

2. Implement terminal launcher
   - Add button to open new terminal window with the correct system prompt
   - Configure terminal to launch Claude with task-specific parameters
   - Pass task ID to terminal for reference

3. Create prompt template editor
   - Add UI to customize default prompt templates
   - Support per-task prompt customization
   - Save user prompt preferences

4. Author detection
   - Automatically detect current user as "Jonathan" for locally created tasks
   - Add author field to task schema
   - Display author in task cards (non-collapsed view)

## Brainstorm Status Implementation

The Brainstorm status has been added to the UI with the following changes:
- Added 'brainstorm' status constants
- Updated display labels and colors
- Added to status filters with visual grouping
- Updated the status dropdown in the task form
- Modified type definitions

### Remaining Implementation Tasks:

1. Add server-side support for Brainstorm status
   - Update database schema/validation for 'brainstorm' status
   - Add any required database migrations
   - Add API documentation for the new status

2. Refine Brainstorm UX
   - Consider adding specific icons for Brainstorm status
   - Implement a specialized Brainstorm view mode
   - Add support for transitioning tasks from Brainstorm to Proposed

3. Add Brainstorm-specific fields
   - Implement "idea sources" field for tracking where ideas came from
   - Add "evaluation criteria" field for assessing Brainstorm tasks
   - Implement voting/rating mechanism for collaborative brainstorming

4. Documentation
   - Update workflow documentation with the Brainstorm stage
   - Create user guide explaining the purpose and usage of the Brainstorm status
   - Add examples of effective Brainstorm -> Proposed -> Implementation workflows

5. Testing
   - Add tests for Brainstorm status transitions
   - Test filtering with Brainstorm tasks
   - Verify correct counts and displays in task filters