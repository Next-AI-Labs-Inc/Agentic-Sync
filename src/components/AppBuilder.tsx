import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChevronDown, FaChevronUp, FaBolt, FaRocket, FaCog, FaCode } from 'react-icons/fa';

// Define interfaces for our component
interface DataSource {
  id: string;
  name: string;
  url: string;
  description: string;
}

interface AppBuilderProps {
  onBuildStart?: () => void;
  onBuildComplete?: (success: boolean, message: string) => void;
}

/**
 * AppBuilder component
 * 
 * Allows administrators to configure and build custom task applications
 * with different data sources and configurations.
 */
export default function AppBuilder({ onBuildStart, onBuildComplete }: AppBuilderProps) {
  // App name configuration
  const [appName, setAppName] = useState('IX Agent Sync');
  
  // Data source configuration
  const [dataSources, setDataSources] = useState<DataSource[]>([
    { 
      id: 'default',
      name: 'Default API', 
      url: 'http://localhost:3002',
      description: 'Default local development API'
    },
    {
      id: 'production',
      name: 'Production API',
      url: 'https://api.ixcoach.com',
      description: 'Live production environment API'
    },
    {
      id: 'custom',
      name: 'Custom API',
      url: '',
      description: 'Your custom API endpoint'
    }
  ]);
  
  const [selectedDataSource, setSelectedDataSource] = useState<string>('default');
  const [customApiUrl, setCustomApiUrl] = useState<string>('');
  const [isCustomDataSource, setIsCustomDataSource] = useState<boolean>(false);
  
  // Current endpoint verification
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [verificationMessage, setVerificationMessage] = useState<string>('');
  
  // Build status
  const [building, setBuilding] = useState<boolean>(false);
  const [buildOutput, setBuildOutput] = useState<string>('');
  const [showBuildOutput, setShowBuildOutput] = useState<boolean>(false);
  
  // Agent directions modal
  const [showDirections, setShowDirections] = useState<boolean>(false);
  
  // Sample data preview
  const [sampleData, setSampleData] = useState<any>(null);
  const [showSampleData, setShowSampleData] = useState<boolean>(false);
  
  // Update custom API URL when selected data source changes
  useEffect(() => {
    const selected = dataSources.find(ds => ds.id === selectedDataSource);
    if (selected) {
      if (selected.id === 'custom') {
        setIsCustomDataSource(true);
      } else {
        setIsCustomDataSource(false);
        setCustomApiUrl(selected.url);
      }
    }
  }, [selectedDataSource, dataSources]);
  
  // Verify API connection
  const verifyApiConnection = async () => {
    const apiUrl = isCustomDataSource ? customApiUrl : 
      dataSources.find(ds => ds.id === selectedDataSource)?.url || '';
    
    if (!apiUrl) {
      setVerificationStatus('error');
      setVerificationMessage('Please enter a valid API URL');
      return;
    }
    
    setIsVerifying(true);
    setVerificationStatus('loading');
    
    try {
      // Try to connect to the API health check endpoint
      const response = await axios.get(`${apiUrl}/api/health`, { timeout: 5000 });
      
      if (response.status === 200) {
        setVerificationStatus('success');
        setVerificationMessage('Successfully connected to API');
        
        // Try to get sample tasks data
        try {
          const tasksResponse = await axios.get(`${apiUrl}/api/developer/tasks?limit=5`, { 
            timeout: 5000,
            headers: {
              'X-API-Key': 'dev-api-key' // Default dev key for testing
            } 
          });
          setSampleData(tasksResponse.data.data);
        } catch (error) {
          console.error('Failed to fetch sample tasks:', error);
          setSampleData(null);
        }
      } else {
        setVerificationStatus('error');
        setVerificationMessage(`API responded with status: ${response.status}`);
      }
    } catch (error) {
      console.error('API verification error:', error);
      setVerificationStatus('error');
      setVerificationMessage(`Failed to connect to API: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Build the application
  const buildApplication = async () => {
    if (onBuildStart) onBuildStart();
    
    setBuilding(true);
    setBuildOutput('');
    setShowBuildOutput(true);
    
    // Start with build configuration
    const apiUrl = isCustomDataSource ? customApiUrl : 
      dataSources.find(ds => ds.id === selectedDataSource)?.url || '';
    
    // Append to build output with timestamps
    const appendOutput = (text: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setBuildOutput(prev => `${prev}[${timestamp}] ${text}\n`);
    };
    
    try {
      // Start build process
      appendOutput(`Starting build for "${appName}" with API: ${apiUrl}`);
      appendOutput('Setting up environment variables...');
      
      // Simulate API request to trigger build
      appendOutput('Configuring application...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      appendOutput('Updating configuration files...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate build steps
      appendOutput('Building application...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      appendOutput('Packaging for Tauri...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      appendOutput('Creating installer...');
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Build success
      appendOutput('Build completed successfully!');
      appendOutput(`Application "${appName}" is ready to use.`);
      
      if (onBuildComplete) {
        onBuildComplete(true, `Application "${appName}" has been built successfully!`);
      }
    } catch (error) {
      console.error('Build error:', error);
      appendOutput(`ERROR: Build failed - ${error.message}`);
      
      if (onBuildComplete) {
        onBuildComplete(false, `Build failed: ${error.message}`);
      }
    } finally {
      setBuilding(false);
    }
  };
  
  // Generate agent directions
  const getAgentDirections = () => {
    return `# Agent Directions: Create Custom API Endpoint
    
## Task Description
Create a custom API endpoint for the Task Management application that serves as a data source adapter.

## Technical Requirements
1. Create a new file at \`/api/adapters/${selectedDataSource === 'custom' ? 'custom' : selectedDataSource}-adapter.js\`
2. Implement the following interface:
\`\`\`typescript
interface TaskAdapter {
  getTasks(filters?: object): Promise<Task[]>;
  getTask(id: string): Promise<Task>;
  createTask(data: TaskFormData): Promise<Task>;
  updateTask(id: string, data: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
}
\`\`\`

3. Configure the adapter to connect to: \`${isCustomDataSource ? customApiUrl : dataSources.find(ds => ds.id === selectedDataSource)?.url}\`
4. Implement proper error handling and request timeouts
5. Add authentication headers if needed
6. Ensure all task properties match the existing Task interface

## Implementation Example
\`\`\`javascript
// api/adapters/${selectedDataSource === 'custom' ? 'custom' : selectedDataSource}-adapter.js
import axios from 'axios';

const API_BASE_URL = '${isCustomDataSource ? customApiUrl : dataSources.find(ds => ds.id === selectedDataSource)?.url}';
const API_TIMEOUT = 10000; // 10 seconds

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.NEXT_PUBLIC_TASK_API_KEY || 'dev-api-key'
  }
});

// Implement the adapter methods
export const getTasks = async (filters) => {
  try {
    const response = await apiClient.get('/api/developer/tasks', { params: filters });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Implement other required methods...

// Export all methods
export default {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};
\`\`\`

## Integration Steps
1. Update \`src/services/taskApiService.ts\` to use the new adapter
2. Add configuration to select the adapter based on environment variables
3. Add proper error handling for adapter-specific errors
4. Update task listing components to handle any data format differences

## Testing
1. Test all CRUD operations with the new adapter
2. Verify error handling for network issues
3. Check performance with larger data sets
`;
  };
  
  return (
    <div className="app-builder bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4">Application Builder</h2>
      <p className="text-gray-600 mb-6">
        Configure and build custom task applications with different data sources.
      </p>
      
      {/* App Name Configuration */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Application Name</h3>
        <input
          type="text"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          placeholder="Enter application name"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      
      {/* Data Source Configuration */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Data Source</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select API Endpoint
          </label>
          <div className="relative">
            <select 
              value={selectedDataSource}
              onChange={(e) => setSelectedDataSource(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 appearance-none"
            >
              {dataSources.map(source => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <FaChevronDown className="text-gray-400" />
            </div>
          </div>
          
          {/* Description for selected data source */}
          <p className="mt-1 text-sm text-gray-500">
            {dataSources.find(ds => ds.id === selectedDataSource)?.description}
          </p>
        </div>
        
        {/* Custom API URL */}
        {isCustomDataSource && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom API URL
            </label>
            <input
              type="text"
              value={customApiUrl}
              onChange={(e) => setCustomApiUrl(e.target.value)}
              placeholder="https://your-api-endpoint.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        )}
        
        {/* Verify API Connection */}
        <div className="mb-4">
          <button
            onClick={verifyApiConnection}
            disabled={isVerifying}
            className={`px-4 py-2 rounded-md text-white font-medium flex items-center ${
              isVerifying ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isVerifying ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying Connection...
              </>
            ) : (
              <>
                <FaBolt className="mr-2" />
                Verify API Connection
              </>
            )}
          </button>
          
          {/* Verification results */}
          {verificationStatus !== 'idle' && (
            <div className={`mt-2 p-3 rounded-md ${
              verificationStatus === 'loading' ? 'bg-blue-50 text-blue-700' :
              verificationStatus === 'success' ? 'bg-green-50 text-green-700' :
              'bg-red-50 text-red-700'
            }`}>
              {verificationMessage}
            </div>
          )}
        </div>
        
        {/* Sample Data Preview */}
        {sampleData && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-medium">Sample Data Preview</h4>
              <button
                onClick={() => setShowSampleData(!showSampleData)}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
              >
                {showSampleData ? (
                  <>
                    <FaChevronUp className="mr-1" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <FaChevronDown className="mr-1" />
                    Show Preview
                  </>
                )}
              </button>
            </div>
            
            {showSampleData && (
              <div className="bg-gray-50 p-3 rounded-md overflow-auto max-h-60 border border-gray-200">
                <pre className="text-xs">{JSON.stringify(sampleData, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Agent Directions */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium">Agent Directions</h3>
          <button
            onClick={() => setShowDirections(!showDirections)}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            {showDirections ? (
              <>
                <FaChevronUp className="mr-1" />
                Hide Directions
              </>
            ) : (
              <>
                <FaChevronDown className="mr-1" />
                Show Directions
              </>
            )}
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">
          These directions explain how to create the API endpoint for your selected data source.
        </p>
        
        {showDirections && (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 overflow-auto max-h-96">
            <pre className="text-xs whitespace-pre-wrap font-mono">{getAgentDirections()}</pre>
          </div>
        )}
      </div>
      
      {/* Build Button */}
      <div className="mb-4">
        <button
          onClick={buildApplication}
          disabled={building || verificationStatus !== 'success'}
          className={`w-full py-3 rounded-md text-white font-medium flex items-center justify-center ${
            building || verificationStatus !== 'success'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {building ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Building Application...
            </>
          ) : (
            <>
              <FaRocket className="mr-2" /> 
              Build Application
            </>
          )}
        </button>
        
        {/* Help text */}
        {verificationStatus !== 'success' && (
          <p className="mt-2 text-sm text-amber-600">
            Please verify the API connection before building.
          </p>
        )}
      </div>
      
      {/* Build Output */}
      {buildOutput && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-medium">Build Output</h4>
            <button
              onClick={() => setShowBuildOutput(!showBuildOutput)}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              {showBuildOutput ? (
                <>
                  <FaChevronUp className="mr-1" />
                  Hide Output
                </>
              ) : (
                <>
                  <FaChevronDown className="mr-1" />
                  Show Output
                </>
              )}
            </button>
          </div>
          
          {showBuildOutput && (
            <div className="bg-gray-900 text-gray-200 p-4 rounded-md font-mono text-xs overflow-auto max-h-60">
              <pre>{buildOutput}</pre>
            </div>
          )}
        </div>
      )}
      
      {/* Documentation */}
      <div className="mt-8 pt-4 border-t border-gray-200">
        <h3 className="text-md font-medium mb-2">Documentation</h3>
        <p className="text-sm text-gray-600">
          This tool allows you to create multiple instances of the task application, 
          each with its own configuration and data source.
        </p>
        <div className="mt-2 text-sm">
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Configure the application name and API endpoint</li>
            <li>Verify the API connection before building</li>
            <li>Use the agent directions to create custom API adapters</li>
            <li>Build a standalone Tauri application with your configuration</li>
          </ul>
        </div>
      </div>
    </div>
  );
}