# Item Hooks

## useEditableItems

A custom hook for managing editable item lists with approval/veto functionality.

### Recent Fixes and Improvements

The approve/veto functionality was recently enhanced with:

1. **Optimistic UI Updates**:
   - Added `localItems` state to maintain UI state independent of props
   - Implemented immediate UI feedback while waiting for API responses
   - UI updates happen first, then API calls, for better perceived performance

2. **Error Handling**:
   - Improved error recovery with proper state rollback on API failures
   - Prevents inconsistent UI state when server operations fail

3. **Component Refactoring**:
   - Extracted approval/veto buttons into `ItemApprovalButtons` component
   - Better separation of concerns and testability

4. **Testing Enhancements**:
   - Added comprehensive tests for the approval component
   - Tests cover both happy paths and error scenarios
   - Cypress tests to verify functionality

### Usage

```tsx
const { state, handlers, refs } = useEditableItems({
  items,
  taskId,
  onUpdateItems,
  onApproveItem,
  onVetoItem
});
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `items` | `ItemWithStatus[]` | Array of items with status information |
| `taskId` | `string` (optional) | ID of the task associated with these items |
| `onUpdateItems` | `(taskId: string \| undefined, items: ItemWithStatus[]) => Promise<void> \| void` | Callback for updating items |
| `onApproveItem` | `(taskId: string \| undefined, itemId: string) => Promise<void>` (optional) | Callback for approving an item |
| `onVetoItem` | `(taskId: string \| undefined, itemId: string) => Promise<void>` (optional) | Callback for vetoing (rejecting) an item |

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `state` | `EditableItemsState` | State values for the hook |
| `handlers` | `EditableItemsHandlers` | Event handlers for various actions |
| `refs` | `object` | References to DOM elements |

#### State Properties

- `editIndex`: Current item being edited (null if none)
- `editValue`: Current value in the editor
- `isAddingNew`: Whether we're adding a new item
- `newItemValue`: Value for the new item being added
- `processingItems`: Set of item IDs currently being processed
- `localItems`: Current local state of items (for optimistic updates)

#### Handlers

- `handleEdit`: Start editing an item
- `handleSave`: Save the current edit
- `handleCancel`: Cancel the current edit
- `handleAddNew`: Start adding a new item
- `handleSaveNew`: Save the new item
- `handleCancelNew`: Cancel adding a new item
- `handleApproveItem`: Approve an item
- `handleVetoItem`: Veto (reject) an item
- `handleEditKeyDown`: Handle keyboard events in edit mode
- `handleNewKeyDown`: Handle keyboard events in new item mode
- `setEditValue`: Update the edit value
- `setNewItemValue`: Update the new item value

### Example

```tsx
function EditableItemList({ items, taskId, onUpdateItems, onApproveItem, onVetoItem }) {
  const { state, handlers, refs } = useEditableItems({
    items,
    taskId,
    onUpdateItems,
    onApproveItem,
    onVetoItem
  });
  
  const { editIndex, editValue, isAddingNew, newItemValue, processingItems, localItems } = state;
  
  // Render UI using state and handlers...
}
```