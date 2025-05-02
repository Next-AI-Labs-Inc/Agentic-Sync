/**
 * Feature Flags Configuration
 * 
 * This file contains runtime feature toggle flags for the application.
 * Use these flags to conditionally enable/disable features or create
 * graceful fallbacks for functionality that is under active development.
 * 
 * IMPORTANT: When disabling a feature, please include detailed comments explaining:
 * 1. What functionality is affected
 * 2. Why it's currently disabled
 * 3. What work would be required to enable it
 * 4. Who to contact or what resources to check for more information
 */

/**
 * @featureFlag ApproveAndVetoButtonsOperational
 * @description Controls visibility of approve/veto buttons in task item lists
 * @defaultValue false
 * 
 * This flag disables the approve/veto buttons in task requirements, technical plans,
 * and next steps lists, which are currently not functioning correctly.
 * 
 * DETAILED CONTEXT FOR AGENTS:
 * 
 * The issue appears to be in the parent-child prop handling chain where approval actions
 * in ApprovalItemList don't propagate correctly to update both the UI and database.
 * While the component structure has been fixed to pass correct props, there seems to be
 * an architectural issue with how state is synchronized.
 * 
 * Specifically:
 * - Button click handlers correctly call their callbacks with taskId/itemId
 * - Database operations may be occurring but no new data is fetched/rendered
 * - The UI doesn't refresh with the updated item status after approval
 * 
 * To properly fix this issue would require:
 * 1. A full audit of the state management flow from TaskCard → ItemSection → ApprovalItemList
 * 2. Adding proper optimistic UI updates synchronized with actual database changes
 * 3. Creating a proper real-time sync mechanism for item status changes
 * 
 * Since this is a complex issue requiring significant architectural changes,
 * we're temporarily hiding these buttons until a proper solution can be implemented.
 */
export const FeatureFlags = {
  // Task Card Features
  ApproveAndVetoButtonsOperational: true,

  // Add other feature flags here as needed
};