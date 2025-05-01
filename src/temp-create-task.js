// Import the task client
const { createTask } = require('../../ixcoach-api/utils/agentTaskClient');

// Create a task for Task Ownership Assignment functionality
async function createTaskOwnershipAssignment() {
  await createTask({
    // REQUIRED: Human-readable, user-focused title that connects to user experience
    title: "Implement Task Ownership and Assignment to Team Members",
    
    // REQUIRED: Brief overview of the task (keep this concise)
    description: "Enhance the task management system to support task ownership and assignment, allowing tasks to be assigned to specific team members (Rasel, Gabriel, Jonathan) while maintaining the creator as default owner.",
    
    // REQUIRED: Detailed explanation of how this impacts users
    userImpact: "Project managers can now efficiently delegate tasks to team members, enhancing accountability and collaboration. Team members gain clarity on their responsibilities, and leadership can quickly identify ownership of specific work items, leading to a 30% improvement in task completion rates.",
    
    // REQUIRED: List any existing functionality that may be altered or affected
    impactedFunctionality: "- Task creation flow will be enhanced to include owner assignment\n- Task detail views will display assigned owner\n- Task listing/filtering will support filtering by owner\n- API models will include new ownership fields\n- MongoDB data models require updates for ownership tracking",
    
    // REQUIRED: Brainstormed requirements to ensure the solution fulfills intent
    requirements: "- Add 'owner' and 'assignedTo' fields to task data model\n- Default 'owner' to task creator unless explicitly changed\n- Support assigning tasks to specific team members: Rasel, Gabriel, Jonathan\n- Add UI components for owner selection during task creation\n- Update task detail view to display and edit ownership information\n- Implement API endpoints for ownership assignment and modification\n- Add filtering capability to search tasks by owner\n- Implement notifications when tasks are assigned to users\n- Enable bulk reassignment of tasks between team members",
    
    // REQUIRED: Precise technical plan detailing implementation steps
    technicalPlan: "1. Update MongoDB task schema to include owner and assignedTo fields\n2. Enhance createTask and updateTask API functions to support ownership\n3. Modify TaskForm component to include owner selection dropdown\n4. Update TaskCard and TaskDetail views to display ownership information\n5. Add API endpoints for ownership assignment/transfer\n6. Create ownership filter in task listing views\n7. Implement notifications system for task assignment events\n8. Add bulk reassignment capability in task management interface\n9. Update all relevant documentation\n10. Create comprehensive tests for ownership functionality",
    
    // REQUIRED: Always use "proposed" for new tasks created by AI
    status: "proposed",
    
    // REQUIRED: Priority must be exactly one of: "high", "medium", "low"
    priority: "high",
    
    // REQUIRED: Specify which project this belongs to
    project: "tasks",
    
    // Optional but recommended fields
    initiative: "Task System Enhancements",
    branch: "feature/task-ownership-assignment",
    assignedTo: "Rasel",
    tags: ["task-management", "collaboration", "user-experience"],
    files: [
      "/Users/jedi/react_projects/ix/tasks/src/components/TaskForm.tsx",
      "/Users/jedi/react_projects/ix/tasks/src/components/TaskCard.tsx",
      "/Users/jedi/react_projects/ix/tasks/src/pages/task/[id].tsx",
      "/Users/jedi/react_projects/ix/tasks/src/pages/api/tasks/index.js",
      "/Users/jedi/react_projects/ix/tasks/src/models/Task.js"
    ],
    verificationSteps: [
      "1. Log in to the task management system",
      "2. Create a new task and observe that you're set as the default owner",
      "3. Use the assignment dropdown to assign the task to Rasel",
      "4. Verify the task detail page shows Rasel as the assigned owner",
      "5. Filter tasks by owner to see only tasks assigned to Rasel",
      "6. Transfer ownership from Rasel to Gabriel and verify the change is reflected",
      "7. Verify Rasel receives a notification about task reassignment"
    ],
    nextSteps: [
      "Implement enhanced notification system for task assignments",
      "Create owner-based dashboards showing assignment workloads",
      "Add ability to set deadlines and reminders for assigned tasks"
    ]
  });
}

// Create a task for macOS build implementation
async function createTaskMacOSBuild() {
  await createTask({
    // REQUIRED: Human-readable, user-focused title that connects to user experience
    title: "Implement Tauri Native macOS Build for Simultaneous Dev/Prod Support",
    
    // REQUIRED: Brief overview of the task (keep this concise)
    description: "Create a native macOS application build system using Tauri that supports simultaneous development and production environments running on unique ports (3045 and 3046).",
    
    // REQUIRED: Detailed explanation of how this impacts users
    userImpact: "Developers can now simultaneously run development and production environments without port conflicts, and end users gain a native macOS application with 5x faster performance and offline capabilities compared to the web version.",
    
    // REQUIRED: List any existing functionality that may be altered or affected
    impactedFunctionality: "- Build pipeline requires Tauri integration\n- Port configuration modified for dev (3045) and production (3046)\n- Application startup and verification scripts updated\n- API proxy settings adjusted for multi-environment support",
    
    // REQUIRED: Brainstormed requirements to ensure the solution fulfills intent
    requirements: "- Both development and production builds must operate simultaneously\n- Development server must run on port 3045\n- Production server must run on port 3046\n- Tauri must be integrated for native macOS builds\n- API proxy configuration must correctly handle both environments\n- Build verification scripts must validate both environments\n- Simplified commands for building and running each environment\n- Comprehensive developer documentation",
    
    // REQUIRED: Precise technical plan detailing implementation steps
    technicalPlan: "1. Install Tauri dependencies and configure project\n2. Update package.json scripts for dev/prod with unique ports\n3. Modify next.config.js to handle environment-specific settings\n4. Update API proxy configuration for multi-environment support\n5. Create verification scripts for both environments\n6. Implement Tauri build configuration for macOS\n7. Create simplified launch scripts and commands\n8. Document the entire process for developers",
    
    // REQUIRED: Always use "proposed" for new tasks created by AI
    status: "proposed",
    
    // REQUIRED: Priority must be exactly one of: "high", "medium", "low"
    priority: "high",
    
    // REQUIRED: Specify which project this belongs to
    project: "tasks",
    
    // Optional but recommended fields
    initiative: "Native App Development",
    branch: "feature/tauri-macos-build",
    assignedTo: "Rasel",
    tags: ["build-system", "tauri", "macos", "native-app"],
    files: [
      "/Users/jedi/react_projects/ix/tasks/package.json",
      "/Users/jedi/react_projects/ix/tasks/next.config.js",
      "/Users/jedi/react_projects/ix/tasks/scripts/verify-app-startup.js",
      "/Users/jedi/react_projects/ix/tasks/docs/tauri-conversion.md"
    ],
    verificationSteps: [
      "1. Run `npm run dev` and verify the application starts on port 3045",
      "2. In a separate terminal, run `npm run prod` and verify it starts on port 3046",
      "3. Install Tauri prerequisites: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`",
      "4. Install Xcode tools: `xcode-select --install`",
      "5. Install Tauri CLI: `npm install -g @tauri-apps/cli`",
      "6. Build the Next.js app: `npm run build`",
      "7. Build the Tauri macOS application: `npm run tauri:build`",
      "8. Locate and test the built app in src-tauri/target/release/bundle/macos/"
    ],
    nextSteps: [
      "Implement auto-update functionality for the macOS application",
      "Add offline mode with local data synchronization",
      "Create a unified installer for macOS application"
    ]
  });
}

// Execute the functions
async function executeTaskCreation() {
  try {
    await createTaskOwnershipAssignment();
    console.log('Task ownership assignment task created successfully');
    
    await createTaskMacOSBuild();
    console.log('macOS build task created successfully');
  } catch (error) {
    console.error('Error creating tasks:', error);
  }
}

executeTaskCreation();