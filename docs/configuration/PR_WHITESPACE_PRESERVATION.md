# Preserve Whitespace in Task Text Fields

This PR updates various components in the tasks repository to ensure whitespace is preserved in task text fields. Previously, when a user would create or edit a task, whitespace characters were being trimmed on blur, resulting in loss of formatting.

## Changes

1. **EditableItemList Component**:
   - Modified save handlers to preserve whitespace characters
   - Removed `.trim()` calls that were stripping whitespace
   - Updated empty check to use length instead of trimming

2. **TaskCard Component**:
   - Updated `handleInlineSubmit` to not trim content when saving
   - Added `whitespace-pre-wrap` and `break-words` CSS classes to all content display elements
   - Ensures consistent display of whitespace in both collapsed and expanded views

3. **List Parser Utility**:
   - Modified `parseListString` function to preserve whitespace in list items
   - Changed filtering logic to only remove completely empty lines

4. **Task API Service**:
   - Updated list processing to preserve whitespace in verificationSteps and nextSteps
   - Maintained trimming for tags as they are space-separated values

5. **Task Form Component**:
   - Updated validation to check length instead of trimming

## Benefits

- Preserves intentional whitespace formatting for code blocks, indented lists, and other formatted text
- Shows text with original formatting in all task views
- Consistent whitespace handling across all text fields
- Improved user experience when working with structured content in task fields

## Testing

The changes have been verified with a successful build. Further testing should include:

1. Creating a task with intentional whitespace (e.g., indented text)
2. Checking that whitespace is preserved after saving
3. Verifying that whitespace appears correctly in all views (card, detail, etc.)
4. Testing inline editing to ensure whitespace is preserved during updates