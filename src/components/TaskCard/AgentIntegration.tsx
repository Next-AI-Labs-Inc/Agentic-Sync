import React, { useState } from 'react';
import FeedbackForm from '../FeedbackForm';
import AgentLauncher from '../AgentLauncher';

export interface AgentIntegrationProps {
  task: {
    id: string;
    status: string;
    title: string;
  };
  onAddFeedback?: (taskId: string, content: string) => Promise<void>;
  onLaunchAgent?: (
    taskId: string,
    mode: 'implement' | 'demo' | 'feedback',
    feedback?: string
  ) => Promise<void>;
}

/**
 * Component for agent integration features and feedback
 */
function AgentIntegration({
  task,
  onAddFeedback,
  onLaunchAgent
}: AgentIntegrationProps) {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Allow feedback and agent functions only in certain statuses
  const isActionable = [
    'inbox',
    'brainstorm',
    'proposed',
    'backlog',
    'todo',
    'in-progress'
  ].includes(task.status);

  // Handle show feedback form
  const handleShowFeedback = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFeedbackForm(true);
  };

  // Handle cancel feedback
  const handleCancelFeedback = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFeedbackForm(false);
  };

  // Handle submit feedback
  const handleSubmitFeedback = async (content: string) => {
    if (!onAddFeedback) return;

    try {
      setIsSubmitting(true);
      await onAddFeedback(task.id, content);
      setShowFeedbackForm(false);
    } catch (error) {
      console.error('Failed to add feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle launch agent
  const handleLaunchAgent = async (mode: 'implement' | 'demo' | 'feedback', feedback?: string) => {
    if (!onLaunchAgent) return;

    try {
      await onLaunchAgent(task.id, mode, feedback);
    } catch (error) {
      console.error(`Failed to launch agent in ${mode} mode:`, error);
    }
  };

  // If not actionable, don't render
  if (!isActionable || (!onAddFeedback && !onLaunchAgent)) {
    return null;
  }

  return (
    <div className="agent-integration px-4 py-3 border-t">
      {/* Only show feedback form when activated */}
      {showFeedbackForm ? (
        <div onClick={e => e.stopPropagation()}>
          <FeedbackForm
            onSubmit={handleSubmitFeedback}
            onCancel={handleCancelFeedback}
            isSubmitting={isSubmitting}
            showTitle={false}
          />
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex-grow text-sm font-medium text-gray-500 mb-2 sm:mb-0">
            Agent Integration
          </div>
          
          <div className="flex flex-wrap space-x-2">
            {/* Only show agent launcher when available */}
            {onLaunchAgent && (
              <AgentLauncher
                taskId={task.id}
                taskTitle={task.title}
                onLaunch={handleLaunchAgent}
              />
            )}
            
            {/* Only show feedback button when available */}
            {onAddFeedback && (
              <button
                onClick={handleShowFeedback}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200"
              >
                Give Feedback
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentIntegration;