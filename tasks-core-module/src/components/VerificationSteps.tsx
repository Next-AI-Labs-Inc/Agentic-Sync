import React from 'react';
import { BusinessCase, TasksConfig } from '../types';

interface VerificationStepsProps {
  /**
   * Task data (containing verificationSteps array)
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
   * Whether steps are editable
   */
  editable?: boolean;
  
  /**
   * Change handler
   */
  onChange?: (steps: any[]) => void;
}

/**
 * VerificationSteps Component
 * 
 * Displays and optionally edits verification steps with business-case specific rendering.
 * This component demonstrates fixing the infinite reload issue that occurs in the tasks app.
 */
export const VerificationSteps: React.FC<VerificationStepsProps> = ({ 
  task, 
  businessCase = 'tasks',
  customConfig = {},
  editable = false,
  onChange
}) => {
  // Get terminology based on business case
  const getTerminology = () => {
    // Default terminology by business case
    const defaultTerminology = {
      tasks: {
        verificationSteps: 'Verification Steps'
      },
      support: {
        verificationSteps: 'Resolution Steps'
      },
      recruitment: {
        verificationSteps: 'Interview Questions'
      },
      project: {
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
  
  // Get steps with reasonable defaults if missing
  const steps = task.verificationSteps || [];
  
  // FIX FOR INFINITE RELOAD: Use a stable state updater function
  const handleStepChange = (index: number, value: string) => {
    if (!editable || !onChange) return;
    
    // Create a new array to avoid reference issues that cause infinite reloads
    const newSteps = steps.map((step, i) => {
      if (i === index) {
        return { ...step, text: value };
      }
      return step;
    });
    
    // Call onChange with the new array
    onChange(newSteps);
  };
  
  // Handle adding a new step
  const handleAddStep = () => {
    if (!editable || !onChange) return;
    
    // Create a new array with the added step
    const newSteps = [...steps, { id: Date.now().toString(), text: '', completed: false }];
    onChange(newSteps);
  };
  
  // Handle removing a step
  const handleRemoveStep = (index: number) => {
    if (!editable || !onChange) return;
    
    // Filter out the step to remove
    const newSteps = steps.filter((_, i) => i !== index);
    onChange(newSteps);
  };
  
  // Apply different UIs based on business case
  if (businessCase === 'support') {
    return (
      <div className="resolution-steps">
        <h3>{terminology.verificationSteps}</h3>
        {steps.length === 0 ? (
          <p>No resolution steps defined yet.</p>
        ) : (
          <ol className="resolution-steps-list">
            {steps.map((step, index) => (
              <li key={step.id || index} className={step.completed ? 'completed' : ''}>
                {editable ? (
                  <div className="editable-step">
                    <input 
                      type="text" 
                      value={step.text || ''} 
                      onChange={(e) => handleStepChange(index, e.target.value)}
                      placeholder="Add resolution step"
                    />
                    <button onClick={() => handleRemoveStep(index)}>Remove</button>
                  </div>
                ) : (
                  <span>{step.text}</span>
                )}
              </li>
            ))}
          </ol>
        )}
        {editable && (
          <button onClick={handleAddStep}>Add Resolution Step</button>
        )}
      </div>
    );
  }
  
  // Default verification steps UI
  return (
    <div className="verification-steps">
      <h3>{terminology.verificationSteps}</h3>
      {steps.length === 0 ? (
        <p>No {terminology.verificationSteps.toLowerCase()} defined yet.</p>
      ) : (
        <ol className="steps-list">
          {steps.map((step, index) => (
            <li key={step.id || index} className={step.completed ? 'completed' : ''}>
              {editable ? (
                <div className="editable-step">
                  <input 
                    type="text" 
                    value={step.text || ''} 
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    placeholder={`Add ${terminology.verificationSteps.toLowerCase().slice(0, -1)}`}
                  />
                  <button onClick={() => handleRemoveStep(index)}>Remove</button>
                </div>
              ) : (
                <span>{step.text}</span>
              )}
            </li>
          ))}
        </ol>
      )}
      {editable && (
        <button onClick={handleAddStep}>Add {terminology.verificationSteps.slice(0, -1)}</button>
      )}
    </div>
  );
};

export default VerificationSteps;
