import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import SystemPromptManager from '@/components/SystemPromptManager';
import { SystemPrompt } from '@/types';

/**
 * Settings page for the tasks app
 * Allows users to configure system prompts and other settings
 */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('prompts');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle saving a system prompt
  const handleSavePrompt = (prompt: SystemPrompt) => {
    setSuccessMessage(`System prompt "${prompt.name}" has been saved successfully.`);
    
    // Clear success message after a delay
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  return (
    <>
      <Head>
        <title>Settings | IX Projects</title>
        <meta name="description" content="Configure task settings" />
      </Head>
      
      <div className="mb-6">
        <Link href="/tasks" className="text-primary-600 hover:underline mb-4 inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Tasks
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-800 mt-2">Settings</h1>
        <p className="text-gray-600">Configure task settings and agent parameters</p>
      </div>
      
      {/* Success message */}
      {successMessage && (
        <div className="mb-6 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
      
      {/* Settings tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('prompts')}
            className={`pb-3 px-1 ${
              activeTab === 'prompts'
                ? 'border-b-2 border-primary-500 text-primary-600 font-medium'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            System Prompts
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`pb-3 px-1 ${
              activeTab === 'preferences'
                ? 'border-b-2 border-primary-500 text-primary-600 font-medium'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Preferences
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="tab-content">
        {activeTab === 'prompts' && (
          <div className="system-prompts-tab">
            <SystemPromptManager onSave={handleSavePrompt} />
          </div>
        )}
        
        {activeTab === 'preferences' && (
          <div className="preferences-tab bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">User Preferences</h2>
            <p className="text-gray-500 italic">Preferences settings will be available in a future update.</p>
            
            {/* Placeholder for future preferences */}
            <div className="mt-4 space-y-4 opacity-50 pointer-events-none">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Agent Integration</h3>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enable-agent"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    disabled
                  />
                  <label htmlFor="enable-agent" className="ml-2 block text-sm text-gray-700">
                    Enable agent integration (coming soon)
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Terminal Settings</h3>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Terminal application
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    disabled
                  >
                    <option>Default system terminal</option>
                    <option>iTerm (macOS)</option>
                    <option>Windows Terminal</option>
                    <option>Custom...</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}