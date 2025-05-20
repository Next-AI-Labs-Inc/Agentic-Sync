import { ItemWithStatus } from '@/types';

/**
 * Handle approve action for an item
 * 
 * @param itemId - ID of the item to approve
 * @param items - Current list of items
 * @param onApprove - Function to call when approving an item
 * @param onUpdate - Function to update the parent component's state
 * @param setProcessingApprove - Function to set the processing state
 */
export const handleApprove = async (
  itemId: string,
  items: ItemWithStatus[],
  onApprove: (itemId: string) => Promise<void>,
  onUpdate: (newItems: ItemWithStatus[]) => void,
  setProcessingApprove: (itemId: string | null) => void
): Promise<void> => {
  console.log('APPROVE FLOW: Button clicked for item', itemId);
  
  // Set processing state
  console.log('APPROVE FLOW: Setting processing state', itemId);
  setProcessingApprove(itemId);
  
  try {
    console.log('APPROVE FLOW: Calling onApprove handler with itemId', itemId);
    console.log('APPROVE FLOW: onApprove handler type:', typeof onApprove);
    
    // Check if onApprove is actually a function before calling it
    if (typeof onApprove === 'function') {
      await onApprove(itemId);
      console.log('APPROVE FLOW: onApprove handler completed successfully');
      
      console.log('APPROVE DEBUG: Current items before update:', JSON.stringify(items));
      console.log('APPROVE DEBUG: Item to approve:', JSON.stringify(items.find(item => item.id === itemId)));
      
      // Update the local items state to reflect the approved status immediately
      // This ensures the UI updates even if the parent component doesn't update the state
      const updatedItems = items.map(item => 
        item.id === itemId 
          ? { ...item, status: 'approved', approvedAt: new Date().toISOString() } 
          : item
      );
      
      console.log('APPROVE DEBUG: Updated items after mapping:', JSON.stringify(updatedItems));
      console.log('APPROVE DEBUG: Approved item after update:', JSON.stringify(updatedItems.find(item => item.id === itemId)));
      
      // Call onUpdate to update the parent state with the new item status
      console.log('APPROVE DEBUG: Calling onUpdate with updated items');
      onUpdate(updatedItems);
      console.log('APPROVE DEBUG: onUpdate called successfully');
    } else {
      console.error('APPROVE FLOW: onApprove is not a function, type:', typeof onApprove);
    }
  } catch (error) {
    // Log the error but don't crash
    console.error('APPROVE FLOW: Error approving item:', error);
  } finally {
    // Reset processing state
    console.log('APPROVE FLOW: Resetting processing state');
    setProcessingApprove(null);
  }
};

/**
 * Handle veto action for an item
 * 
 * @param itemId - ID of the item to veto
 * @param items - Current list of items
 * @param onVeto - Function to call when vetoing an item
 * @param onUpdate - Function to update the parent component's state
 * @param setProcessingVeto - Function to set the processing state
 */
export const handleVeto = async (
  itemId: string,
  items: ItemWithStatus[],
  onVeto: (itemId: string) => Promise<void>,
  onUpdate: (newItems: ItemWithStatus[]) => void,
  setProcessingVeto: (itemId: string | null) => void
): Promise<void> => {
  console.log('VETO FLOW: Button clicked for item', itemId);
  
  // Set processing state
  console.log('VETO FLOW: Setting processing state', itemId);
  setProcessingVeto(itemId);
  
  try {
    console.log('VETO FLOW: Calling onVeto handler with itemId', itemId);
    console.log('VETO FLOW: onVeto handler type:', typeof onVeto);
    
    // Check if onVeto is actually a function before calling it
    if (typeof onVeto === 'function') {
      await onVeto(itemId);
      console.log('VETO FLOW: onVeto handler completed successfully');
      
      console.log('VETO DEBUG: Current items before update:', JSON.stringify(items));
      
      // Update the local items state to remove the vetoed item immediately
      // This ensures the UI updates even if the parent component doesn't update the state
      const updatedItems = items.filter(item => item.id !== itemId);
      
      console.log('VETO DEBUG: Updated items after filter:', JSON.stringify(updatedItems));
      console.log('VETO DEBUG: Items removed:', JSON.stringify(items.filter(item => item.id === itemId)));
      
      // Call onUpdate to update the parent state without the vetoed item
      console.log('VETO DEBUG: Calling onUpdate with filtered items');
      onUpdate(updatedItems);
      console.log('VETO DEBUG: onUpdate called successfully');
    } else {
      console.error('VETO FLOW: onVeto is not a function, type:', typeof onVeto);
    }
  } catch (error) {
    // Log the error but don't crash
    console.error('VETO FLOW: Error vetoing item:', error);
  } finally {
    // Reset processing state
    console.log('VETO FLOW: Resetting processing state');
    setProcessingVeto(null);
  }
};