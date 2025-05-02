import React from 'react';
import { BusinessCase, TasksConfig } from '../types';

interface TaskProps {
  /**
   * Task data
   */
  task: any;
  
  /**
   * Business case
   */
  businessCase?: BusinessCase;
  
  /**
   * Custom configuration
   */
  customConfig?: TasksConfig;
  
  /**
   * Click handler
   */
  onClick?: () => void;
}

/**
 * TaskCard Component
 * 
 * Displays a task with business-case specific rendering.
 */
export const TaskCard: React.FC<TaskProps> = ({ 
  task, 
  businessCase = 'tasks',
  customConfig = {},
  onClick
}) => {
  // Get terminology with defaults based on business case
  const getTerminology = () => {
    // Default terminology by business case
    const defaultTerminology = {
      tasks: {
        task: 'Task',
        requirements: 'Requirements',
      },
      support: {
        task: 'Ticket',
        requirements: 'Customer Needs',
      },
      recruitment: {
        task: 'Candidate',
        requirements: 'Qualifications',
      },
      project: {
        task: 'Task',
        requirements: 'Deliverables',
      }
    };
    
    // Merge default with custom terminology
    return {
      ...defaultTerminology[businessCase],
      ...customConfig.terminology
    };
  };
  
  const terminology = getTerminology();
  
  // Render support ticket view
  if (businessCase === 'support') {
    return (
      <div className="support-ticket-card" onClick={onClick}>
        <div className="ticket-header">
          <h3>{terminology.task} #{task.id}: {task.title}</h3>
          <span className="ticket-priority">Priority: {task.priority || 'Medium'}</span>
        </div>
        <div className="ticket-body">
          <p>{task.description}</p>
          {task.requirements && task.requirements.length > 0 && (
            <div className="ticket-requirements">
              <h4>{terminology.requirements}:</h4>
              <ul>
                {task.requirements.map((req, index) => (
                  <li key={index}>{req.text}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="ticket-footer">
          <span>Status: {task.status}</span>
          <span>Created: {task.createdAt}</span>
        </div>
      </div>
    );
  }
  
  // Render recruitment candidate view
  if (businessCase === 'recruitment') {
    return (
      <div className="candidate-card" onClick={onClick}>
        <div className="candidate-header">
          <h3>{task.title}</h3>
          <span className="candidate-role">{task.role || 'Unspecified Role'}</span>
        </div>
        <div className="candidate-body">
          <p>{task.description}</p>
          {task.requirements && task.requirements.length > 0 && (
            <div className="candidate-qualifications">
              <h4>{terminology.requirements}:</h4>
              <ul>
                {task.requirements.map((req, index) => (
                  <li key={index}>{req.text}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="candidate-footer">
          <span>Status: {task.status}</span>
          <span>Applied: {task.createdAt}</span>
        </div>
      </div>
    );
  }
  
  // Render project task view
  if (businessCase === 'project') {
    return (
      <div className="project-task-card" onClick={onClick}>
        <div className="project-task-header">
          <h3>{task.title}</h3>
          <span className="project-name">{task.project || 'No Project'}</span>
        </div>
        <div className="project-task-body">
          <p>{task.description}</p>
          {task.requirements && task.requirements.length > 0 && (
            <div className="project-deliverables">
              <h4>{terminology.requirements}:</h4>
              <ul>
                {task.requirements.map((req, index) => (
                  <li key={index}>{req.text}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="project-task-footer">
          <span>Status: {task.status}</span>
          <span>Due: {task.dueDate || 'No due date'}</span>
        </div>
      </div>
    );
  }
  
  // Default task view
  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-header">
        <h3>{task.title}</h3>
        <span className="task-id">#{task.id}</span>
      </div>
      <div className="task-body">
        <p>{task.description}</p>
        {task.requirements && task.requirements.length > 0 && (
          <div className="task-requirements">
            <h4>{terminology.requirements}:</h4>
            <ul>
              {task.requirements.map((req, index) => (
                <li key={index}>{req.text}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="task-footer">
        <span>Status: {task.status}</span>
        <span>Created: {task.createdAt}</span>
      </div>
    </div>
  );
};

export default TaskCard;
