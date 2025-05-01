import React, { useState } from 'react';
import { AgentOptions } from '@/types';
import * as taskApiService from '@/services/taskApiService';

interface AgentLauncherProps {
  taskId: string;
  feedback?: string;
  mode: 'implement' | 'demo' | 'feedback';
  onLaunch?: () => void;
  onError?: (error: Error) => void;
  buttonText?: string;
  buttonClass?: string;
}

/**
 * Component for launching a Claude agent with specified parameters
 */
// Define the different types of agents that can be deployed
type AgentType = 'debug-failing-test';

interface AgentPromptData {
  id: AgentType;
  name: string;
  description: string;
  promptTemplate: string;
}

// Agent definitions
const AGENT_TYPES: AgentPromptData[] = [
  {
    id: 'debug-failing-test',
    name: 'Debug Failing Test Agent',
    description: 'Analyzes failing tests to determine if it\'s a real issue or test misconfiguration.',
    promptTemplate: `For the following failing test, I want you to perform a deep analysis and determine if its a real issue or an actual test misconfiguration.  

If it is a test misconfiguration, I want you to simply tell me whats wrong with it and propose a fix. 
If it is a legit failure of the programming, I want you to perform a comprehensive deep dive into the actual user experience, user journey and steps that create the problem, then explain the expected vs actual experience, then design a solution that works with current systems to fix it. 

You should include a thorough analysis and evidence you have thought through and understand the intent of the code that will be affected by your change, and be able to demonstrate the solution will not risk breaking other code.  

When complete you should demonstrate that with full references in the repo affected at docs/proposed in an md file with the test name as the file name.

Finally you should reply to me only the full path of that file, no words needed, I will review there.

FAILING TEST DETAILS:
Title: {{title}}
Task ID: {{taskId}}
Repository: {{project}}
Created At: {{createdAt}}
User Impact: {{userImpact}}
Description: {{description}}
Status: {{status}}
Task Link: {{url}}
Related Files: {{relatedFiles}}
{{feedbackSection}}
`
  }
];

export default function AgentLauncher({
  taskId,
  feedback,
  mode,
  onLaunch,
  onError,
  buttonText,
  buttonClass
}: AgentLauncherProps) {
  const [isLaunching, setIsLaunching] = useState(false);
  // We only need the isLaunching state now
  
  // Always use "Deploy Agent" as the button text
  const defaultButtonText = 'Deploy Agent';
  
  // Use the provided button class from parent component
  const finalButtonClass = buttonClass || '';
  
  /**
   * Handle the agent deployment request
   */
  const handleDeployAgent = async () => {
    try {
      setIsLaunching(true);
      
      // Always use the first agent type (debug-failing-test)
      const agentType = 'debug-failing-test';
      const agentData = AGENT_TYPES.find(a => a.id === agentType);
      
      if (!agentData) {
        throw new Error(`Unknown agent type: ${agentType}`);
      }
      
      // Create agent options
      const options: AgentOptions = {
        taskId,
        mode,
      };
      
      // Add feedback if provided
      if (feedback) {
        options.feedback = feedback;
      }
      
      // Get task data to populate the prompt
      const taskData = await taskApiService.getTask(taskId);
      
      // Get related files through a globbing pattern based on task title
      // This is a mockup - in a real implementation we'd search for files
      const taskFiles = `src/components/TaskCard.tsx
src/components/TaskCard/index.tsx
src/hooks/task/useTaskOperations.ts
src/services/taskApiService.ts
__tests__/TaskCard.test.tsx`;

      // Replace template variables with actual task data
      let promptText = agentData.promptTemplate
        .replace('{{taskId}}', taskData.id || '')
        .replace('{{title}}', taskData.title || '')
        .replace('{{description}}', taskData.description || 'No description provided')
        .replace('{{userImpact}}', taskData.userImpact || 'No user impact provided')
        .replace('{{status}}', taskData.status || '')
        .replace('{{project}}', taskData.project || '')
        .replace('{{createdAt}}', taskData.createdAt || '')
        .replace('{{url}}', taskData.url || `http://localhost:3020/task/${taskData.id}`)
        .replace('{{relatedFiles}}', taskFiles || 'No related files found');
      
      // Add feedback if provided
      const feedbackSection = feedback ? `\nFeedback: ${feedback}` : '';
      promptText = promptText.replace('{{feedbackSection}}', feedbackSection);
      
      // Create a temporary textarea element to copy text
      const textArea = document.createElement('textarea');
      textArea.value = promptText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      // Show success message
      alert('Agent prompt copied to clipboard!');
      
      // Call onLaunch callback if provided
      if (onLaunch) {
        onLaunch();
      }
    } catch (error: any) {
      console.error('Error generating agent prompt:', error);
      alert('Error generating agent prompt. Check the console for details.');
      
      // Call onError callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLaunching(false);
    }
  };
  
  // Removed closeModal function - no longer needed
  
  // Removed selectAgentType function - functionality now in handleDeployAgent
  
  // Removed old copyPromptToClipboard function - now handled inline in handleDeployAgent
  
  return (
    <>
      <button
        type="button"
        onClick={handleDeployAgent}
        className={finalButtonClass}
        disabled={isLaunching}
      >
        {isLaunching ? 'Launching...' : buttonText || defaultButtonText}
      </button>
      
      {/* Agent Type Selector Modal - COMMENTED OUT TO FIX ISSUES */}
      {/*
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-auto">
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {generatedPrompt ? 'Generated Agent Prompt' : 'Select Agent Type'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            
            {!selectedAgentType && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">
                  Select the type of agent you want to deploy:
                </p>
                <div className="space-y-2">
                  {AGENT_TYPES.map(agent => (
                    <div 
                      key={agent.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => selectAgentType(agent.id)}
                    >
                      <h3 className="font-bold text-lg">{agent.name}</h3>
                      <p className="text-gray-600">{agent.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            
            {selectedAgentType && generatedPrompt && (
              <div className="space-y-4">
                <p className="text-gray-600 mb-2">
                  Copy this prompt to use with Claude or another AI assistant:
                </p>
                <div className="relative">
                  <textarea
                    ref={promptTextareaRef}
                    className="w-full h-96 p-3 border rounded-lg font-mono text-sm"
                    value={generatedPrompt}
                    readOnly
                  />
                  <button
                    onClick={copyPromptToClipboard}
                    className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                  >
                    Copy
                  </button>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={closeModal}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 mr-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      */}
    </>
  );
}