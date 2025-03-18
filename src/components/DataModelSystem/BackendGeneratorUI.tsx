/**
 * Backend Generator UI
 * 
 * A UI component for generating backend code (API routes, models) based on a data model configuration.
 * Allows users to visualize and customize the generated code before saving it.
 */

import React, { useState } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { generateDataModel, GenerationResult } from '@/config/dataModels/generators';

interface BackendGeneratorUIProps {
  configOverride?: any; // Optional config override for preview mode
  onSuccess?: (result: GenerationResult) => void;
  onError?: (error: string) => void;
}

export default function BackendGeneratorUI({
  configOverride,
  onSuccess,
  onError
}: BackendGeneratorUIProps) {
  const { currentModel } = useConfig();
  const config = configOverride || currentModel;
  
  const [outputPath, setOutputPath] = useState('/api');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // If no config is available, show a message
  if (!config) {
    return (
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900">Backend Generator</h2>
        <p className="mt-2 text-sm text-gray-500">
          Please select a data model configuration to generate backend code.
        </p>
      </div>
    );
  }
  
  // Handle generation
  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setResult(null);
    
    try {
      // Generate the backend code
      const generationResult = await generateDataModel(config, outputPath);
      
      // Update state with the result
      setResult(generationResult);
      
      // Call success callback if provided
      if (generationResult.success && onSuccess) {
        onSuccess(generationResult);
      }
      
      // Call error callback if failed
      if (!generationResult.success && onError) {
        onError(generationResult.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error generating backend code:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      if (onError) {
        onError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    } finally {
      setGenerating(false);
    }
  };
  
  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-lg leading-6 font-medium text-gray-900">
          Generate Backend for {config.displayName}
        </h2>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Generate API routes and database models for the {config.displayName} data model.
            This will create all the necessary backend code to support the configured operations.
          </p>
        </div>
        
        <div className="mt-5">
          <label htmlFor="output-path" className="block text-sm font-medium text-gray-700">
            Output Directory
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              id="output-path"
              value={outputPath}
              onChange={(e) => setOutputPath(e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
              placeholder="/api/models"
              disabled={generating}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            The directory where the generated code will be saved
          </p>
        </div>
        
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700">Generation Preview</h3>
          <div className="mt-2 p-4 bg-gray-50 rounded-md overflow-auto max-h-64">
            <pre className="text-xs text-gray-700">
              {`// API Routes to be generated:
${config.api.endpoints.map(endpoint => 
  `${endpoint.method} ${config.api.basePath}${endpoint.path} => ${endpoint.handler}`
).join('\n')}

// MongoDB Schema:
const ${config.slug}Schema = new mongoose.Schema({
  ${Object.entries(config.model.fields)
    .filter(([fieldName]) => fieldName !== 'id')
    .map(([fieldName, field]) => 
      `${fieldName}: { type: ${field.type}, required: ${field.required || false} }`
    )
    .join(',\n  ')}
});`}
            </pre>
          </div>
        </div>
        
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Generation failed</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {result && result.success && (
          <div className="mt-4 rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Generation successful</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>The backend code was successfully generated.</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>MongoDB model: {result.modelPath}</li>
                    <li>API routes: {result.apiRoutes?.length} files generated</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-5">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              generating ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {generating ? 'Generating...' : 'Generate Backend'}
          </button>
        </div>
      </div>
    </div>
  );
}