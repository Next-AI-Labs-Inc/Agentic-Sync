# Task Proposal: Make Tasks App Business-Case Configurable via Submodule Pattern

## Description

Refactor the Tasks app to support multiple business cases through a submodule pattern with conditional rendering, allowing direct code modifications while enabling reuse across different business domains. This approach maintains a familiar direct-coding workflow while enabling customization for different business cases.

## Initiative

Tasks App Modularization

## Requirements

- [🟡] Create tasks-core Git submodule with core components
- [🟡] Implement business case conditional rendering (tasks, support, recruitment, project)
- [🟡] Fix verification steps infinite reload bug
- [🟡] Support customizable terminology per business case
- [🟡] Develop test application to verify the approach
- [🟡] Document the workflow for developers maintaining tasks-core
- [🟡] Create migration path from current tasks to tasks-core integration
- [🟡] Implement comprehensive test cases for each business scenario

## Progress

**Requirements Met**: 6/8

## Implementation Details

### Implemented Components

1. **Tasks Core Submodule Structure**
   - Created `/tasks-core/` repository with key components
   - Implemented simple TypeScript interfaces for configuration
   - Set up build process and package structure

2. **Business Case Conditional Rendering**
   - Added support for 4 business cases: tasks, support, recruitment, project
   - Implemented conditional rendering in TasksApp, TaskCard, and VerificationSteps
   - Each business case has specialized UI and terminology

3. **Verification Steps Fix**
   - Fixed the infinite reload bug in VerificationSteps component
   - Implemented proper state update pattern for adding/editing steps
   - Added editable mode support with stable handlers

4. **Customizable Terminology**
   - Made key terms configurable: task, requirements, verificationSteps, etc.
   - Defaults based on business case with custom override support
   - Works consistently across all components

5. **Test Application**
   - Created Next.js application to test tasks-core implementation
   - Added specific pages to test TasksApp, TaskCard, and VerificationSteps
   - Implemented business case selector for real-time testing

6. **Developer Workflow Documentation**
   - Created WORKFLOW_GUIDE.md with detailed instructions
   - Documented the pattern for fixing bugs and adding features
   - Explained how to update consuming applications

### Pending Items

1. **Migration Path from Current Tasks**
   - Need to create step-by-step migration plan
   - Implement migration scripts or documentation
   - Identify potential breaking changes and how to address them

2. **Comprehensive Test Cases**
   - Create Jest test suite for each component
   - Test scenarios for all business cases
   - Integration tests for complex interactions

## Test Results

- Tasks App - ✅ Renders correctly for all business cases
- Task Card - ✅ Renders correctly with different terminology
- Verification Steps - ✅ Fixed infinite reload bug
- Business Case Switching - ✅ Works without errors
- Terminology Customization - ✅ Applies correctly across components

## Next Steps

1. Finalize the migration strategy for current tasks app
2. Implement comprehensive test suite
3. Integrate tasks-core into the main tasks project
4. Document the process for future business case additions