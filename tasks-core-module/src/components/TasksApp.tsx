import React, { useEffect } from 'react';
import { BusinessCase, TasksConfig } from '../types';

interface TasksAppProps {
  /**
   * Business case identifier
   * @default "tasks"
   */
  businessCase?: BusinessCase;
  
  /**
   * Configuration options
   */
  customConfig?: TasksConfig;
  
  /**
   * Optional class name
   */
  className?: string;
}

/**
 * TasksApp Component
 * 
 * Core implementation of the Tasks app that can be customized for different
 * business cases using conditional rendering.
 */
export const TasksApp: React.FC<TasksAppProps> = ({ 
  businessCase = 'tasks',
  customConfig = {},
  className = ''
}) => {
  // Set document title based on business case
  useEffect(() => {
    const titles = {
      tasks: 'Tasks',
      support: 'Support Desk',
      recruitment: 'Recruitment',
      project: 'Project Management'
    };
    
    if (typeof document !== 'undefined') {
      document.title = titles[businessCase] || 'Tasks';
    }
  }, [businessCase]);
  
  // Get terminology with defaults based on business case
  const getTerminology = () => {
    // Default terminology by business case
    const defaultTerminology = {
      tasks: {
        task: 'Task',
        tasks: 'Tasks',
        requirements: 'Requirements',
        verificationSteps: 'Verification Steps'
      },
      support: {
        task: 'Ticket',
        tasks: 'Tickets',
        requirements: 'Customer Needs',
        verificationSteps: 'Resolution Steps'
      },
      recruitment: {
        task: 'Candidate',
        tasks: 'Candidates',
        requirements: 'Qualifications',
        verificationSteps: 'Interview Questions'
      },
      project: {
        task: 'Task',
        tasks: 'Tasks',
        requirements: 'Deliverables',
        verificationSteps: 'Acceptance Criteria'
      }
    };
    
    // Merge default with custom terminology
    return {
      ...defaultTerminology[businessCase],
      ...customConfig.terminology
    };
  };
  
  const terminology = getTerminology();
  
  // Render specific business case UI
  if (businessCase === 'support') {
    return (
      <div className={`support-desk-container ${className}`}>
        <h1>Support Desk</h1>
        <p>This is the Support Desk implementation.</p>
        <p>A {terminology.task} contains {terminology.requirements} and {terminology.verificationSteps}.</p>
        <pre>{JSON.stringify({ businessCase, customConfig }, null, 2)}</pre>
      </div>
    );
  }
  
  if (businessCase === 'recruitment') {
    return (
      <div className={`recruitment-container ${className}`}>
        <h1>Recruitment Pipeline</h1>
        <p>This is the Recruitment implementation.</p>
        <p>A {terminology.task} contains {terminology.requirements} and {terminology.verificationSteps}.</p>
        <pre>{JSON.stringify({ businessCase, customConfig }, null, 2)}</pre>
      </div>
    );
  }
  
  if (businessCase === 'project') {
    return (
      <div className={`project-container ${className}`}>
        <h1>Project Management</h1>
        <p>This is the Project Management implementation.</p>
        <p>A {terminology.task} contains {terminology.requirements} and {terminology.verificationSteps}.</p>
        <pre>{JSON.stringify({ businessCase, customConfig }, null, 2)}</pre>
      </div>
    );
  }
  
  // Default Tasks implementation
  return (
    <div className={`tasks-container ${className}`}>
      <h1>Tasks</h1>
      <p>This is the standard Tasks implementation.</p>
      <p>A {terminology.task} contains {terminology.requirements} and {terminology.verificationSteps}.</p>
      <pre>{JSON.stringify({ businessCase, customConfig }, null, 2)}</pre>
    </div>
  );
};

export default TasksApp;
