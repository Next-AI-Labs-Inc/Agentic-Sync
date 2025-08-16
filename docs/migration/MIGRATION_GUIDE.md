# Migrating to Tasks Core

## Quick Start

1. Run the migration helper script:
   ```
   npm run migrate:tasks-core
   ```

2. Update identified files with suggested changes

3. Visit `/tasks-core` and `/verification-steps-demo` routes to see examples

## What is Tasks Core?

Tasks Core is a Git submodule approach to sharing components across business cases (tasks, support, recruitment, project) while maintaining a familiar direct-coding workflow.

Key benefits:
- Fix bugs in one place, propagate everywhere via Git submodule
- Support multiple business cases through simple conditionals
- Maintain a familiar coding workflow, without complex configuration
- Fixed verification steps infinite reload bug

## Migration Steps

### 1. Set up Tasks Core

The Tasks Core submodule has already been added to the repository in `tasks-core-module/`.

### 2. Update Component Usage

Replace the following components:

1. **TaskVerificationSteps** → **VerificationSteps** from tasks-core
   ```jsx
   // Before
   import TaskVerificationSteps from '@/components/TaskCard/TaskVerificationSteps';
   
   <TaskVerificationSteps task={task} isExpanded={true} />
   
   // After
   import { VerificationSteps } from '@ix/tasks-core';
   
   <VerificationSteps 
     task={task} 
     businessCase="tasks" 
     editable={true} 
     onChange={handleStepsChange}
   />
   ```

2. **TaskCard** → **TaskCard** from tasks-core
   ```jsx
   // Before
   import TaskCard from '@/components/TaskCard';
   
   <TaskCard 
     task={task} 
     onStatusChange={updateTaskStatus}
   />
   
   // After
   import { TaskCard } from '@ix/tasks-core';
   
   <TaskCard 
     task={task} 
     businessCase="tasks"
     customConfig={{
       terminology: {
         requirements: "Requirements"
       }
     }}
   />
   ```

3. **TasksApp** → **TasksApp** from tasks-core
   ```jsx
   // Before
   // Custom implementation or component composition
   
   // After
   import { TasksApp } from '@ix/tasks-core';
   
   <TasksApp businessCase="tasks" />
   ```

### 3. Business Case Selection

Add business case selection to your app:

```jsx
const [businessCase, setBusinessCase] = useState('tasks');

// ...

<select
  value={businessCase}
  onChange={(e) => setBusinessCase(e.target.value)}
>
  <option value="tasks">Tasks</option>
  <option value="support">Support</option>
  <option value="recruitment">Recruitment</option>
  <option value="project">Project</option>
</select>

// Pass to components
<TasksApp businessCase={businessCase} />
```

### 4. Custom Terminology

Customize terminology per business case:

```jsx
const customConfig = {
  terminology: {
    task: businessCase === 'support' ? 'Ticket' : 'Task',
    requirements: businessCase === 'project' ? 'Deliverables' : 'Requirements'
  }
};

<TasksApp businessCase={businessCase} customConfig={customConfig} />
```

## Testing the Migration

1. Start the development server:
   ```
   npm run dev
   ```

2. Visit `/tasks-core` and `/verification-steps-demo` to see the new components in action

3. Test different business cases using the selector

## Further Help

For more detailed documentation, see the following resources:

- [TASKS_CORE_INTEGRATION.md](./docs/TASKS_CORE_INTEGRATION.md) - Detailed integration guide
- [WORKFLOW_GUIDE.md](./tasks-core-module/WORKFLOW_GUIDE.md) - Development workflow
- [TASKS_PROPOSAL.md](./tasks-core-module/TASKS_PROPOSAL.md) - Original proposal

For automated help, use the migration tool:

```
npm run migrate:tasks-core
```