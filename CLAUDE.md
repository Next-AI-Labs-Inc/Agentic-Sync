# tasks - Claude Documentation

This file contains project-specific documentation for Claude to work with this project.

## ⚠️ SINGLE SOURCE OF TRUTH - READ FIRST ⚠️

The **MAIN CLAUDE.md** file in the root directory is the ONLY authoritative source for task management instructions:
`../CLAUDE.md` (main repository root)

Refer to the "Changelog and Task Management" section for OFFICIAL, DEFINITIVE task management instructions.

## Human-Centric Testing Standards

### Test Implementation Requirements

When implementing or modifying tests in the Tasks application, you MUST follow these specific requirements for all test cases:

1. **Human-Readable Format**: All tests MUST be written to explicitly communicate their purpose, impact, and nuance to human reviewers. Each test should serve as documentation that can be understood without reviewing the implementation code.

2. **UX Impact Statements**: Every test MUST include a comment section that describes how the tested functionality affects the user experience. These impact statements should use natural language that connects technical behavior to human outcomes.

3. **Context-Rich Descriptions**: Test descriptions MUST provide enough context to understand:
   - What functionality is being tested
   - Why this functionality matters
   - How failure would impact users
   - What edge cases or specific concerns are addressed

4. **Outcome Documentation**: Tests MUST document both the expected outcome and the actual outcome in human-readable terms, beyond simply checking return values.

5. **Nuanced Expectations**: Test expectations MUST reflect the nuanced requirements of the feature, not just simplistic pass/fail conditions.

Example format for properly documenting tests:

```javascript
/**
 * UX IMPACT: This test ensures that task notifications appear immediately when new 
 * tasks are created by other users. If this fails, users would experience a delayed 
 * awareness of new assignments, potentially missing urgent tasks.
 * 
 * TECHNICAL CONTEXT: Uses the EventBus system to simulate the real-time notification
 * mechanism that enables collaborative work without page refreshes.
 */
test('should immediately notify users when new tasks are assigned to them', () => {
  // Test implementation
});
```

### Test Organization and Execution

1. **Automatic Test Execution**: Tests MUST be configured to run automatically:
   - On every commit (via pre-commit hooks)
   - During CI/CD pipeline execution
   - When explicitly triggered via the test commands below

2. **Test Commands**: The following commands MUST be used to run tests:
   - `npm test`: Run all tests
   - `npm test -- [fileName]`: Run tests in specific file(s)
   - `npm test -- --watch`: Run tests in watch mode during development

3. **Test Output Format**: Test results MUST be presented in a format that:
   - Highlights critical failures that impact user experience
   - Provides context-rich error messages
   - Shows success/failure status at a glance
   - Includes timing information for performance-sensitive tests

4. **Test Documentation**: Each test file MUST begin with a descriptive header that explains:
   - The purpose of the tests in this file
   - The UX features/capabilities being verified
   - Any special considerations for these tests
   - How to interpret the test results

## Agent Utility Commands

| Command | Description | Usage | Output Format |
|---------|-------------|-------|--------------|
| `node scripts/check-memory-health.js` | Analyzes system memory health with color-coded status indicators | `node scripts/check-memory-health.js [--json] [--simple]` | Color-coded console output (default) or JSON (with `--json` flag) |
| `npm test` | Runs all tests with human-readable output | `npm test [--watch] [fileName]` | Human-oriented test results with UX impact details |

### Memory Health Check Tool

The memory health check tool provides a comprehensive analysis of system memory usage, with color-coded status indicators to help identify potential memory issues.

**Features:**
- Overall memory health assessment (Excellent/Good/Fair/Warning/Critical)
- Detailed memory metrics including used memory, free memory, and compression
- Node.js process memory usage analysis
- Specific recommendations based on current memory state

**Usage Options:**
```bash
# Standard color output with detailed analysis
node scripts/check-memory-health.js

# JSON output for programmatic use by agents
node scripts/check-memory-health.js --json

# Plain text output without colors (for log files)
node scripts/check-memory-health.js --simple
```

**When to use:**
- When diagnosing memory-related performance issues
- Before and after implementing memory optimizations to measure improvement
- When checking system health as part of deployment preparations
- For automated monitoring when integrated with CI/CD pipelines (using `--json` output)

## Task Client Usage - NO SCRIPTS

For all task operations, use the official MongoDB-based client utility DIRECTLY:
```javascript
const { createTask, updateTask, getTasks, getTask } = require('../ixcoach-api/utils/agentTaskClient');
```

DO NOT create separate scripts or files just to perform task operations.


## Task Management Workflow - The Ultimate Source of Truth

The task management system follows a sophisticated workflow combining GTD (Getting Things Done) methodology with AI agent actions, as implemented in the UI. **This is the definitive source of truth for all task statuses and transitions:**

### 1. UI Column Structure (in order, exactly as shown in TaskFilters.tsx):

1. **Views:** 
   - All Active
   - All Pending (all non-completed tasks)

2. **Collection:** 
   - Inbox (initial collection point for new ideas and tasks)
   - Brainstorm (space to develop ideas and flesh out tasks)

3. **Maybe:**
   - Someday/Maybe (items to consider in the future but not actionable now)
   - On Hold (tasks temporarily paused during engagement)

4. **Source Tasks:**
   - Backlog (task is in the backlog for future consideration)

5. **Proposed:**
   - Proposed (task has been proposed but not started yet)

6. **Actionable:**
   - Todo (task is ready to be worked on)

7. **Engaged:**
   - In Progress (task is currently being worked on)

8. **Review:**
   - For Review (AI agents mark tasks as complete here for human review)

9. **Completions:**
   - Completed (task has been reviewed and accepted as complete by humans)

10. **Reference:**
    - Archived (task has been archived and is no longer active)

### Task Status Transitions (from taskStatus.ts):

- **Inbox** → Brainstorm
- **Brainstorm** → Proposed
- **Proposed** → Todo
- **Backlog** → Todo
- **Maybe** → Backlog
- **Todo** → In Progress
- **In Progress** → For Review
- **On Hold** → In Progress
- **For Review** → Done (human verification)
- **Done** → Reviewed
- **Reviewed** → Archived

### AI Agent Workflow:

1. AI agents create tasks with 'proposed' status
2. When actively working, AI agents set status to 'in-progress'
3. When work is completed, AI agents MUST set status to 'for-review' (NEVER 'done')
4. Only humans may move tasks from 'for-review' to 'done' after verification
5. Once completely verified, tasks may be moved to 'reviewed' and eventually 'archived'

**⚠️ CRITICAL: ALWAYS mark completed tasks as 'for-review' instead of 'done'**. This ensures human verification of AI-completed work. Only humans should move tasks from 'for-review' to 'done' after verifying the work.

## MongoDB Task Client Documentation

## ⚠️ CRITICAL: DIRECT TASK CLIENT USAGE ONLY - NO SCRIPTS ⚠️

**You must use the task client DIRECTLY. DO NOT create separate scripts just to log tasks.**

The following approaches are INCORRECT and should NEVER be used:
- ❌ DO NOT create separate .js files to log tasks
- ❌ DO NOT write functions that just call the API
- ❌ DO NOT create scripts in a scripts/ directory for task logging
- ❌ DO NOT say things like "I'll create a script to log the task"

**CORRECT APPROACH: Put task client code DIRECTLY in your response to the user. No scripts.**

**⚠️ IMPLEMENTATION UPDATE ⚠️**: The central MongoDB task client is implemented and available in the external API utilities. All projects MUST use this client for task tracking.

### STEP-BY-STEP: How to Log a Task Correctly

When a user asks you to log a task, follow these EXACT steps:

1. **IMMEDIATELY include this code block in your response to the user:**

```javascript
// This code will be executed DIRECTLY (not in a script)
(async () => {
  // Import the task client
  const { createTask } = require('../ixcoach-api/utils/agentTaskClient');
  
  // Create the task
  try {
    const task = await createTask({
      title: 'Task title goes here',
      description: 'Detailed description',
      userImpact: 'How this affects users',
      requirements: '- Requirement 1\n- Requirement 2',
      technicalPlan: '1. Step one\n2. Step two',
      status: 'proposed',
      priority: 'high',
      project: 'tasks', // Current project name
      // other fields as needed
    });
    
    console.log(`✅ Task created: ${task._id}`);
  } catch (error) {
    console.error(`❌ Error creating task: ${error.message}`);
  }
})();
```

2. **After including the code above, continue your conversation with the user**
```

### MongoDB Task Client API Reference

The task client provides the following primary functions:

#### 1. `createTask(taskData)`
Creates a new task in the MongoDB database.

```javascript
// Example: Creating a task with all required fields - ALWAYS WRAP IN AN ASYNC IIFE:
(async () => {
  try {
    const task = await createTask({
      // REQUIRED FIELDS
      title: 'Your task title',                    // Human-readable, user-focused title
      description: 'Detailed description',         // Brief overview of the task
      userImpact: 'How this affects users',        // User experience impact
      impactedFunctionality: 'What will change',   // List components/behaviors affected
      requirements: 'List of requirements',        // Bullet list of requirements
      technicalPlan: 'Step-by-step plan',          // Numbered list of implementation steps
      status: 'proposed',                          // One of: proposed, backlog, todo, in-progress, for-review (NEVER use 'done')
      priority: 'high',                            // One of: high, medium, low
      project: 'tasks',                            // Current project name
      
      // OPTIONAL FIELDS
      initiative: 'Initiative name',               // Higher-level initiative this belongs to
      branch: 'feature/branch-name',               // Git branch for implementation
      tags: ['tag1', 'tag2'],                      // Array of categorization tags
      verificationSteps: ['Step 1', 'Step 2'],     // Steps to verify completion (only for done status)
      files: ['/path/to/file1', '/path/to/file2'], // Files related to this task
      dependencies: [123, 456],                    // IDs of tasks this depends on
      nextSteps: ['Next step 1', 'Next step 2']    // Future work after this task
    });
    console.log(`✅ Task created: ${task._id}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
})();
```

#### 2. `getTasks(filters)`
Retrieves tasks based on optional filters.

```javascript
// Example: Retrieving filtered tasks - ALWAYS WRAP IN AN ASYNC IIFE:
(async () => {
  try {
    const tasks = await getTasks({
      status: 'todo',             // Filter by status
      project: 'tasks',           // Current project name
      priority: 'high',           // Filter by priority
      initiative: 'Initiative name' // Filter by initiative
    });
    
    console.log(`Found ${tasks.length} tasks`);
    tasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.title}`);
    });
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
})();
```

#### 3. `getTask(taskId)`
Retrieves a single task by its ID.

```javascript
// Example: Retrieving a specific task - ALWAYS WRAP IN AN ASYNC IIFE:
(async () => {
  try {
    const task = await getTask('67d68dd4cb31daeb662f11c8');
    console.log(`Task title: ${task.title}`);
    console.log(`Task status: ${task.status}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
})();
```

#### 4. `updateTask(taskId, updateData)`
Updates an existing task with new data.

```javascript
// Example: Updating task status - ALWAYS WRAP IN AN ASYNC IIFE:
(async () => {
  try {
    await updateTask('67d68dd4cb31daeb662f11c8', {
      status: 'in-progress'
    });
    console.log('✅ Task updated successfully');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
})();

// Example: Mark task as complete with verification steps - ALWAYS WRAP IN AN ASYNC IIFE:
(async () => {
  try {
    await updateTask('67d68dd4cb31daeb662f11c8', {
      status: 'for-review',  // ⚠️ CRITICAL: Always use 'for-review' when AI completes a task
      verificationSteps: [
        '1. Navigate to the feature',
        '2. Verify the behavior works as expected',
        '3. Check that error states are handled correctly'
      ]
    });
    console.log('✅ Task marked for review');
    
    // ⚠️ NEVER use this code as an AI agent - only humans should do this:
    // await updateTask('67d68dd4cb31daeb662f11c8', {
    //   status: 'done',  // ⚠️ This status is ONLY for human reviewers to use
    //   completedAt: new Date().toISOString()
    // });
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
})();
```

### Client Configuration Testing

There is a pre-existing diagnostic tool for testing your MongoDB client configuration:

```bash
# IMPORTANT: This is NOT an example to follow - this is ONLY for diagnosing connection issues
# This is an EXISTING script solely for troubleshooting connection problems
node ./scripts/test-task-client.js
```

The existence of this diagnostic tool does NOT mean you should create your own scripts. This tool is ONLY for verifying client configuration when there are connection issues.

For normal task logging, always use the client directly in your current context without creating any scripts.

For more detailed documentation, see the main CLAUDE.md file at the repository root.

## Shared Components Integration

The Tasks application is in the process of migrating to modular shared components from the `@ix/shared-tools` package. This migration requires careful management of component imports to prevent build failures.

### Shared Components Usage Protocol

When working with UI components:

1. **Check component status** before making changes:
   ```bash
   npm run verify:imports
   ```

2. **Use consistent import patterns** - either local or shared, never mixed:
   ```javascript
   // Local component (default export)
   import LoadingSpinner from '@/components/LoadingSpinner';
   
   // Shared component (named export)
   import { LoadingSpinner } from '@ix/loading-spinner';
   ```

3. **Never mix import styles** in the same codebase - this will cause build failures.

4. **Always run verification** before committing changes:
   ```bash
   npm run precommit
   ```

### Troubleshooting Shared Components

If you encounter "Module not found: Can't resolve '@ix/loading-spinner'" or similar errors:

1. Check if the shared tools are properly set up:
   ```bash
   ls -la ../shared-tools/packages
   ```

2. Run the component setup script if needed:
   ```bash
   npm run setup:components
   ```

3. As a temporary fix, revert imports to local components:
   ```javascript
   // Change from:
   import { LoadingSpinner } from '@ix/loading-spinner';
   
   // To:
   import LoadingSpinner from '@/components/LoadingSpinner';
   ```

For complete documentation on shared component migration, see [SHARED_COMPONENTS_MIGRATION.md](./docs/SHARED_COMPONENTS_MIGRATION.md).


