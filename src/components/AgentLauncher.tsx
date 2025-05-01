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
  
  // Set default button text based on mode
  const defaultButtonText = mode === 'implement' 
    ? 'Deploy Agent' 
    : mode === 'demo' 
      ? 'Show Me' 
      : 'Address Feedback';
  
  // Use the provided button class from parent component
  // This ensures consistent button styling throughout the app
  const finalButtonClass = buttonClass || '';
  
  /**
   * Launch the agent
   */
  const launchAgent = async () => {
    try {
      setIsLaunching(true);
      
      // Create agent options
      const options: AgentOptions = {
        taskId,
        mode,
      };
      
      // Add feedback if provided
      if (feedback) {
        options.feedback = feedback;
      }
      
      // Launch the agent
      const result = await taskApiService.launchAgentForTask(options);
      console.log('Agent launch result:', result);
      
      // Open a terminal and execute the command
      // In a real implementation, this would use a native API or library
      // For now, we'll just log the command
      console.log('Command to run:', result.command);
      
      // In a real application, you would launch a terminal with something like:
      // const terminal = window.require('electron').shell.openExternal('terminal://new');
      // terminal.execute(result.command);
      
      // Use a more web-friendly approach for now
      // This is just a simulation for development
      alert(`Agent launched with command: ${result.command}`);
      
      // Call onLaunch callback if provided
      if (onLaunch) {
        onLaunch();
      }
    } catch (error: any) {
      console.error('Error launching agent:', error);
      
      // Call onError callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLaunching(false);
    }
  };
  
  return (
    <button
      type="button"
      onClick={launchAgent}
      className={finalButtonClass}
      disabled={isLaunching}
    >
      {isLaunching ? 'Launching...' : buttonText || defaultButtonText}
    </button>
  );
}