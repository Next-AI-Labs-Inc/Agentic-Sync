/**
 * SystemConfigContext.tsx
 * 
 * Provides the system configuration to all components through React context.
 * This allows any component to access the current system mode and feature flags.
 * 
 * =============================================================
 * AGENT IMPLEMENTATION GUIDE
 * =============================================================
 * 
 * This system allows creating multiple instances of the IX platform with different
 * feature configurations. Follow these principles when implementing changes:
 * 
 * 1. FEATURE ISOLATION:
 *    When adding a new feature that should only apply to certain instances:
 *    - Add a feature flag in the SystemConfig interface
 *    - Set this flag to FALSE in original configurations
 *    - Set this flag to TRUE only in configurations that should have it
 * 
 * 2. CONDITIONAL RENDERING EXAMPLE:
 *    ```tsx
 *    import { useFeatureFlag } from '../contexts/SystemConfigContext';
 *    
 *    function MyComponent() {
 *      // Check if tagging is enabled for this instance
 *      const tagsEnabled = useFeatureFlag('modules.tasks.useTags');
 *      
 *      return (
 *        <div>
 *          {tagsEnabled && <TagSelector tags={availableTags} />}
 *        </div>
 *      );
 *    }
 *    ```
 * 
 * 3. MULTI-INSTANCE DEPLOYMENT:
 *    Each instance should:
 *    - Have its own configuration file (or database entry)
 *    - Set IX_SYSTEM_MODE or IX_CONFIG_PATH environment variable
 *    - Have separate deployment with its own domain/subdomain
 *    
 *    Example .env for Personal instance:
 *    ```
 *    IX_SYSTEM_MODE=personal
 *    MONGODB_URI=mongodb://localhost:27017/ix-personal
 *    ```
 * 
 * 4. EXTENDING CONFIGURATIONS:
 *    When adding new core features, add them to ALL configuration templates
 *    but set them to disabled by default in the original configurations.
 *    
 *    Example for adding a new calendar feature:
 *    ```ts
 *    // In system-config.ts, update SystemConfig interface
 *    modules: {
 *      // Existing modules...
 *      calendar: {
 *        enabled: boolean;      // Master switch
 *        useSync: boolean;      // Calendar sync feature
 *      }
 *    }
 *    
 *    // Then update all configurations
 *    BUSINESS_CONFIG = {
 *      // Existing config...
 *      modules: {
 *        // Existing modules...
 *        calendar: {
 *          enabled: false,  // Disabled for business instance
 *          useSync: false
 *        }
 *      }
 *    }
 *    
 *    PERSONAL_CONFIG = {
 *      // Existing config...
 *      modules: {
 *        // Existing modules...
 *        calendar: {
 *          enabled: true,   // Enabled for personal instance
 *          useSync: true
 *        }
 *      }
 *    }
 *    ```
 */

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { SystemConfig, getConfig } from '../config/system-config';

// Create context with a default empty configuration
// The actual configuration will be loaded by the provider
const SystemConfigContext = createContext<{
  config: SystemConfig | null;
  setConfig: (config: SystemConfig) => void;
  instance: string;  // Tracks which instance this is
}>({
  config: null,
  setConfig: () => { /* Initial empty implementation */ },
  instance: 'unknown'
});

interface SystemConfigProviderProps {
  children: ReactNode;
  initialConfig?: SystemConfig;
  instanceId?: string;
}

/**
 * Provider component that makes the system configuration available to all children
 * 
 * AGENT NOTE: This provider should be wrapped around the entire application
 * at the highest level possible, typically in _app.tsx or similar.
 */
export const SystemConfigProvider = ({ 
  children,
  initialConfig,
  instanceId = process.env.IX_INSTANCE_ID || 'default'
}: SystemConfigProviderProps) => {
  // Use provided config or load from environment
  const [config, setConfig] = useState<SystemConfig | null>(initialConfig || null);

  // Load configuration on first render if not provided
  useEffect(() => {
    if (!config) {
      try {
        const loadedConfig = getConfig();
        setConfig(loadedConfig);

        // Log configuration loading for debugging purposes
        console.log(`IX System initialized with mode: ${loadedConfig.mode}`);
      } catch (error) {
        console.error('Failed to load system configuration:', error);
        // You could implement fallback logic here
      }
    }
  }, [config]);

  // Don't render children until configuration is loaded
  if (!config) {
    return <div>Loading system configuration...</div>;
  }

  return (
    <SystemConfigContext.Provider value={{ config, setConfig, instance: instanceId }}>
      {children}
    </SystemConfigContext.Provider>
  );
};

/**
 * Hook to access the system configuration from any component
 * 
 * AGENT NOTE: Use this when you need access to the entire config object
 * or need to access complex nested properties
 */
export const useSystemConfig = () => {
  const context = useContext(SystemConfigContext);
  
  if (!context.config) {
    throw new Error('useSystemConfig must be used within a SystemConfigProvider');
  }
  
  return context;
};

/**
 * Helper hook to check if a specific module or feature is enabled
 * 
 * AGENT NOTE: This is the preferred way to check if a feature
 * should be activated in the current instance
 * 
 * Example usage: 
 * const showTagsUI = useFeatureFlag('modules.tasks.useTags');
 */
export const useFeatureFlag = (path: string): boolean => {
  const { config } = useSystemConfig();
  
  // Navigate the config object based on the provided path
  try {
    const parts = path.split('.');
    let result: any = config;
    
    for (const part of parts) {
      result = result[part];
    }
    
    return !!result; // Convert to boolean
  } catch (error) {
    console.warn(`Feature flag not found: ${path}`);
    return false;
  }
};

/**
 * AGENT NOTE: Example of conditionally rendering a component based on system mode
 * This function demonstrates how to selectively render UI elements based on system configuration
 */
export const ConditionalFeature = ({ 
  featurePath, 
  children,
  fallback = null
}: { 
  featurePath: string; 
  children: ReactNode;
  fallback?: ReactNode;
}) => {
  const isEnabled = useFeatureFlag(featurePath);
  return isEnabled ? <>{children}</> : <>{fallback}</>;
};

/**
 * AGENT NOTE: Example of a component that uses the system configuration
 * 
 * ```tsx
 * function TaskList() {
 *   // Get current instance configuration
 *   const { config } = useSystemConfig();
 *   
 *   // Check if we should show tags
 *   const showTags = useFeatureFlag('modules.tasks.useTags');
 *   
 *   // Check which workflow to use
 *   const workflowType = config.modules.tasks.workflow;
 *   
 *   return (
 *     <div>
 *       <h1>Tasks for {config.name}</h1>
 *       
 *       {/* Render workflow-specific components */}
 *       {workflowType === 'gtd' ? (
 *         <GTDTaskList showTags={showTags} />
 *       ) : (
 *         <StandardTaskList showTags={showTags} />
 *       )}
 *       
 *       {/* Conditional UI element */}
 *       <ConditionalFeature featurePath="modules.tasks.useCategories">
 *         <CategorySelector />
 *       </ConditionalFeature>
 *     </div>
 *   );
 * }
 * ```
 */

export default SystemConfigContext;