import React from 'react';
import { TasksApp, TaskCard, VerificationSteps } from '../src';

/**
 * Example 1: Basic Usage
 * 
 * The simplest way to use the Tasks Core component with default settings.
 */
export const BasicExample = () => {
  return <TasksApp />;
};

/**
 * Example 2: Support Desk
 * 
 * Using the Tasks Core for a support desk application.
 */
export const SupportDeskExample = () => {
  return (
    <TasksApp 
      businessCase="support"
      customConfig={{
        terminology: {
          // Override specific terms if needed
          requirements: "Customer Requirements"
        },
        // Add custom event handlers
        onTaskCreate: (ticket) => {
          console.log('Support ticket created:', ticket);
          // Integration with support system
        }
      }}
    />
  );
};

/**
 * Example 3: Recruitment Pipeline
 * 
 * Using Tasks Core for a recruitment application.
 */
export const RecruitmentExample = () => {
  return (
    <TasksApp 
      businessCase="recruitment"
      customConfig={{
        api: {
          baseUrl: "https://api.recruiting.example.com",
          apiKey: "your-recruiting-api-key"
        }
      }}
    />
  );
};

/**
 * Example 4: Directly Using Components
 * 
 * When you need more control, you can use the individual components directly.
 */
export const CustomIntegrationExample = () => {
  // Sample task data
  const task = {
    id: "123",
    title: "Implement new feature",
    description: "This is a task description",
    status: "in-progress",
    createdAt: "2023-01-01",
    requirements: [
      { id: "r1", text: "Must work on mobile" },
      { id: "r2", text: "Must be accessible" }
    ],
    verificationSteps: [
      { id: "v1", text: "Test on Chrome", completed: true },
      { id: "v2", text: "Test on Firefox", completed: false }
    ]
  };
  
  // Handle verification step changes
  const handleVerificationChange = (steps) => {
    console.log('Verification steps updated:', steps);
  };
  
  return (
    <div className="custom-integration">
      <h1>Custom Tasks Integration</h1>
      
      {/* Use TaskCard with a different business case */}
      <div className="task-section">
        <h2>Task Details</h2>
        <TaskCard 
          task={task} 
          businessCase="project"
          customConfig={{
            terminology: { task: "Project Task" }
          }}
          onClick={() => console.log('Task clicked')}
        />
      </div>
      
      {/* Use VerificationSteps component directly */}
      <div className="verification-section">
        <VerificationSteps
          task={task}
          businessCase="tasks"
          editable={true}
          onChange={handleVerificationChange}
        />
      </div>
    </div>
  );
};

/**
 * Example 5: Fixing the Infinite Reload Bug
 * 
 * This example shows how the VerificationSteps component fixes the infinite reload bug.
 */
export const FixedVerificationStepsExample = () => {
  // Sample task data
  const task = {
    id: "123",
    title: "Bug fix task",
    verificationSteps: [
      { id: "v1", text: "Test the fix", completed: false },
      { id: "v2", text: "Verify no regressions", completed: false }
    ]
  };
  
  // This handler no longer causes infinite reloads due to the fix in VerificationSteps
  const handleVerificationChange = (steps) => {
    console.log('Steps updated without infinite reload:', steps);
    // In the real app, this would update the task state
  };
  
  return (
    <div className="fixed-verification-steps-example">
      <h2>Fixed Verification Steps Component</h2>
      <p>
        This example demonstrates the fix for the infinite reload bug in the verification steps component.
        Edit the steps below to see it work without reloading infinitely.
      </p>
      
      <VerificationSteps
        task={task}
        editable={true}
        onChange={handleVerificationChange}
      />
    </div>
  );
};