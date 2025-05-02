# TaskCard Markdown Field Support Enhancement

## Intent

The intent of this document is to analyze why markdown content is not rendered in TaskCard components despite the Task type having a `markdown` field defined and the necessary state management for editing the field available in the component. This issue prevents users from adding rich formatted content to tasks, which is especially important for including code snippets, tables, and other structured information above verification steps.

## Current Status

☑️ The `markdown` field is defined in the Task type in `/tasks/src/types/index.ts`  
☑️ TaskCard component has edit state variables for markdown (`isEditingMarkdown`, `editedMarkdown`)  
☑️ UI state is initialized from task data (`editedMarkdown` initialized from `task.markdown`)  
☐ TaskCard component is missing UI implementation for viewing/editing the markdown field  
☐ The markdown field should appear in the expanded section before verification steps  
☑️ Backend API support for the markdown field already exists  
☑️ ReactMarkdown library is already imported and used elsewhere in the component  

## Analysis

### Backend Infrastructure

The markdown field is already supported in the backend:

1. The Task type in `/tasks/src/types/index.ts` has the `markdown?: string` field defined.
2. The API service in `/tasks/src/services/taskApiService.ts` includes the field when creating tasks.
3. The task update functionality in the API can handle any field updates, including markdown.

### Frontend Implementation Gap

The issue is on the frontend side where the UI for displaying and editing the markdown content is not implemented.

1. The TaskCard component sets up the necessary state variables:
   ```typescript
   const [isEditingMarkdown, setIsEditingMarkdown] = useState(false);
   const [editedMarkdown, setEditedMarkdown] = useState(task.markdown || '');
   ```

2. However, unlike other fields like `description` and `userImpact`, there is no UI section to render the markdown field in either collapsed or expanded views.

3. The component already uses ReactMarkdown for other fields, so the rendering capability is there.

4. There are no handlers to toggle the editing state for markdown or submit changes.

## Implementation Requirements

The following changes are needed to enable full markdown support:

### Frontend Changes

☐ Add markdown section in the expanded view above verification steps  
☐ Implement editing toggle for markdown content  
☐ Add editor UI with preview functionality  
☐ Connect to existing task update functionality  
☐ Ensure proper markdown rendering with code highlight support  

### Backend Changes

☑️ No backend changes needed - API already supports the field  

## Proposed Solution

Update the TaskCard component to include a new section for markdown content in the expanded view. The UI should:

1. Display markdown content above verification steps when a task is expanded
2. Allow editing with a toggle similar to other editable fields
3. Use the ReactMarkdown component for rendering
4. Provide editing functionality through the existing `onUpdateTask` prop

## Implementation Plan

1. Add a new section in the TaskCard component's expanded view 
2. Implement editing toggle handlers similar to those used for other fields
3. Connect the editor to existing task update functionality
4. Add proper styling for the markdown section
5. Test with different markdown content types (lists, code, tables, etc.)

## Expected User Experience

Once implemented, users will be able to:

1. Add rich formatted content to tasks through the markdown field
2. Edit markdown with a toggle in the expanded view
3. View the rendered markdown with proper formatting
4. Include code snippets, tables, and other structured content that's not possible with plain text fields

This enhancement will significantly improve the ability to document complex tasks in a more structured and readable way.