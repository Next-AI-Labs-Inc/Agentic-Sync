# tasks - Claude Documentation

This file contains project-specific documentation for Claude to work with this project.

**IMPORTANT:** First read the main CLAUDE.md file at the repository root:
`/Users/jedi/react_projects/ix/CLAUDE.md`


## MongoDB Task Client Documentation

## ⚠️ CRITICAL: DIRECT TASK CLIENT USAGE ONLY - NO SCRIPTS ⚠️

**You must use the task client DIRECTLY. DO NOT create separate scripts just to log tasks.**

The following approaches are INCORRECT and should NEVER be used:
- ❌ DO NOT create separate .js files to log tasks
- ❌ DO NOT write functions that just call the API
- ❌ DO NOT create scripts in a scripts/ directory for task logging
- ❌ DO NOT say things like "I'll create a script to log the task"

**CORRECT APPROACH: Put task client code DIRECTLY in your response to the user. No scripts.**

**⚠️ IMPLEMENTATION UPDATE [Mar 16, 2025 - 17:45 PDT] ⚠️**: The central MongoDB task client is implemented and available at `/Users/jedi/react_projects/ix/ixcoach-api/utils/agentTaskClient.js`. All projects MUST use this client for task tracking.

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
      requirements: 'List of requirements',        // Bullet list of requirements
      technicalPlan: 'Step-by-step plan',          // Numbered list of implementation steps
      status: 'proposed',                          // One of: proposed, todo, in-progress, done, reviewed
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
      status: 'done',
      verificationSteps: [
        '1. Navigate to the feature',
        '2. Verify the behavior works as expected',
        '3. Check that error states are handled correctly'
      ]
    });
    console.log('✅ Task marked as complete');
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
node /Users/jedi/react_projects/ix/scripts/test-task-client.js
```

The existence of this diagnostic tool does NOT mean you should create your own scripts. This tool is ONLY for verifying client configuration when there are connection issues.

For normal task logging, always use the client directly in your current context without creating any scripts.

For more detailed documentation, see the main CLAUDE.md file at the repository root.


