/**
 * system-config.ts
 * 
 * Core configuration architecture for the IX system.
 * This file defines the structure for configuring different system modes
 * and feature sets, allowing for WordPress-like templating of functionality.
 * 
 * =============================================================
 * MULTI-INSTANCE AGENT IMPLEMENTATION GUIDE
 * =============================================================
 * 
 * This system is designed for running multiple instances with different configurations.
 * Here's how to work with it:
 * 
 * 1. CREATING NEW INSTANCES:
 *    - Each instance should have a unique identifier (personal, client1, etc.)
 *    - Create a new configuration export (see examples below)
 *    - Register it in the getConfig() function
 *    - Deploy with environment variable IX_SYSTEM_MODE set to your instance ID
 * 
 * 2. ADDING NEW FEATURES:
 *    - Update the SystemConfig interface with your new features
 *    - Add those features to ALL configuration templates
 *    - Set to false/disabled in existing instances for backward compatibility
 *    - Only enable in the instances where they should be active
 * 
 * 3. INSTANCE STARTUP FLOW:
 *    1. App starts → checks IX_SYSTEM_MODE environment variable
 *    2. getConfig() returns the matching configuration
 *    3. SystemConfigProvider loads this at the app root
 *    4. Components use useFeatureFlag() to check if features are enabled
 * 
 * 4. WORKING WITH MULTIPLE INSTANCES:
 *    - Each instance should have a separate deployment and database
 *    - Shared code improvements will benefit all instances automatically
 *    - Instance-specific code should always be wrapped in feature flags
 *    - When making changes, consider impact on all instances
 * 
 * EXAMPLE: Adding tags only for personal mode
 * ```
 * // 1. Update the SystemConfig interface
 * modules: {
 *   tasks: {
 *     enabled: boolean;
 *     useTags: boolean; // New feature flag
 *   }
 * }
 * 
 * // 2. Add to business config with default OFF
 * BUSINESS_CONFIG = {
 *   //...
 *   modules: {
 *     tasks: {
 *       enabled: true,
 *       useTags: false // OFF for business mode
 *     }
 *   }
 * }
 * 
 * // 3. Add to personal config with feature ON
 * PERSONAL_CONFIG = {
 *   //...
 *   modules: {
 *     tasks: {
 *       enabled: true,
 *       useTags: true // ON for personal mode
 *     }
 *   }
 * }
 * 
 * // 4. In UI component
 * function TaskItem() {
 *   const showTags = useFeatureFlag('modules.tasks.useTags');
 *   
 *   return (
 *     <div>
 *       <TaskTitle>{task.title}</TaskTitle>
 *       {showTags && <TagsContainer tags={task.tags} />}
 *     </div>
 *   );
 * }
 * ```
 */

/**
 * Main system configuration interface
 * Defines all available features and configuration options
 */
export interface SystemConfig {
  // IDENTITY - What is this system instance?
  mode: 'business' | 'personal' | 'client' | 'custom';  // The overall operational mode
  name: string;                                        // User-visible instance name
  instanceId: string;                                  // Unique identifier for this instance
  description?: string;                                // Optional description of this instance
  
  // MODULES - Core functionality blocks that can be enabled/disabled
  modules: {
    // Tasks module configuration
    tasks: {
      enabled: boolean;                      // Master switch for tasks functionality
      useTags: boolean;                      // Enable tagging system
      useCategories: boolean;                // Enable categorization 
      useAgents: boolean;                    // Enable AI agents integration
      workflow: 'standard' | 'gtd' | 'kanban' | 'custom'; // Task workflow methodology
    },
    
    // Knowledge module configuration
    knowledge: {
      enabled: boolean;                      // Master switch for knowledge base
      useVectorSearch: boolean;              // Enable semantic search
      useCategories: boolean;                // Enable knowledge categorization
    },
    
    // Add additional modules as needed
  },
  
  // DATA - Storage and context configuration
  data: {
    multiContext: boolean;                   // Allow multiple data contexts?
    contexts: string[];                      // Available contexts if multi-context enabled
    defaultContext: string;                  // Starting context
    crossContextViews: boolean;              // Allow viewing across contexts
    storageLocation?: string;                // Override storage location
    databasePrefix?: string;                 // Prefix for database collections/tables
  },
  
  // UI - User interface configuration
  ui: {
    theme: 'light' | 'dark' | 'system';      // Color theme
    density: 'compact' | 'comfortable';      // UI density
    showBranding: boolean;                   // Show IX branding
    primaryColor?: string;                   // Primary UI color
    logoUrl?: string;                        // Custom logo URL
    customCss?: string;                      // Custom CSS overrides
  },
  
  // DEPLOYMENT - Deployment-specific configuration
  deployment?: {
    baseUrl: string;                         // Base URL for this instance
    apiUrl?: string;                         // API URL if different from base
    publicUrl?: string;                      // Public-facing URL
    assetsPath?: string;                     // Path to static assets
  }
}

/**
 * Configuration registry - stores all available configurations
 * AGENT NOTE: When adding a new instance configuration, add it to this registry
 */
const configRegistry: Record<string, SystemConfig> = {};

/**
 * Register a configuration for an instance
 * AGENT NOTE: Use this function to register new instance configurations
 */
export function registerConfig(config: SystemConfig): void {
  if (configRegistry[config.mode]) {
    console.warn(`Configuration for mode "${config.mode}" already exists and will be overwritten.`);
  }
  configRegistry[config.mode] = config;
}

/**
 * STANDARD CONFIGURATION: BUSINESS MODE
 * This is the original IX Tasks configuration
 * AGENT NOTE: This must remain backward compatible! Do not remove or change existing features.
 */
export const BUSINESS_CONFIG: SystemConfig = {
  mode: 'business',
  name: 'IX Tasks',
  instanceId: 'business',
  description: 'Standard business task management system',
  
  modules: {
    tasks: { 
      enabled: true,
      useTags: false,       // Original system doesn't use tags
      useCategories: false, // Original system doesn't use categories
      useAgents: true,      // Original system supports agents
      workflow: 'standard'  // Original workflow style
    },
    knowledge: {
      enabled: false,       // Knowledge base not enabled in original
      useVectorSearch: false,
      useCategories: false
    }
  },
  
  data: {
    multiContext: false,    // Original system has single context
    contexts: ['business'],
    defaultContext: 'business',
    crossContextViews: false
  },
  
  ui: {
    theme: 'light',
    density: 'comfortable',
    showBranding: true
  }
};

/**
 * PERSONAL MODE CONFIGURATION
 * New configuration for personal task management
 * AGENT NOTE: This is differentiated from business mode by enabling tags and categories
 */
export const PERSONAL_CONFIG: SystemConfig = {
  mode: 'personal',
  name: 'Personal IX',
  instanceId: 'personal',
  description: 'Personal task and knowledge management system',
  
  modules: {
    tasks: { 
      enabled: true,
      useTags: true,        // Personal mode uses tags
      useCategories: true,  // Personal mode uses categories
      useAgents: true,
      workflow: 'gtd'       // Personal mode uses GTD workflow
    },
    knowledge: {
      enabled: true,        // Knowledge base enabled in personal mode
      useVectorSearch: true,
      useCategories: true
    }
  },
  
  data: {
    multiContext: true,     // Personal mode supports multiple contexts
    contexts: ['personal', 'client', 'business'],
    defaultContext: 'personal',
    crossContextViews: true
  },
  
  ui: {
    theme: 'system',
    density: 'compact',
    showBranding: false,
    primaryColor: '#4a86e8' // Customize with different color
  }
};

// Register standard configurations
registerConfig(BUSINESS_CONFIG);
registerConfig(PERSONAL_CONFIG);

/**
 * TEMPLATE for creating new instance configurations
 * AGENT NOTE: Copy this template when creating new instance types
 */
/*
export const NEW_INSTANCE_CONFIG: SystemConfig = {
  mode: 'custom',            // Choose a unique identifier
  name: 'Custom IX Instance',
  instanceId: 'custom-1',
  description: 'Custom configuration for specific use case',
  
  modules: {
    tasks: { 
      enabled: true,
      useTags: true,
      useCategories: true,
      useAgents: true,
      workflow: 'kanban'     // Choose appropriate workflow
    },
    knowledge: {
      enabled: true,
      useVectorSearch: true,
      useCategories: true
    }
  },
  
  data: {
    multiContext: true,
    contexts: ['main', 'archive'],
    defaultContext: 'main',
    crossContextViews: true,
    databasePrefix: 'custom_' // For database isolation
  },
  
  ui: {
    theme: 'dark',
    density: 'comfortable',
    showBranding: false,
    primaryColor: '#9c27b0',
    logoUrl: '/custom-logo.png'
  },
  
  deployment: {
    baseUrl: 'https://custom-instance.example.com',
    apiUrl: 'https://api.custom-instance.example.com'
  }
};

// Don't forget to register your new configuration!
registerConfig(NEW_INSTANCE_CONFIG);
*/

/**
 * Helper function to get the active configuration
 * AGENT NOTE: This function determines which configuration to use
 * based on the IX_SYSTEM_MODE environment variable
 */
export function getConfig(): SystemConfig {
  // Use environment variable or default to business mode
  const mode = process.env.IX_SYSTEM_MODE || 'business';
  
  // Check if we have a configuration for this mode
  const config = configRegistry[mode];
  
  if (!config) {
    console.error(`No configuration found for mode "${mode}". Falling back to business mode.`);
    return configRegistry['business'] || BUSINESS_CONFIG;
  }
  
  return config;
}

/**
 * Function to load a configuration from a custom path
 * This allows completely custom configurations that aren't
 * registered in the standard registry
 */
export async function loadConfigFromPath(path: string): Promise<SystemConfig> {
  try {
    // In a Node.js environment, we could use require() or import()
    // In browser, we would use fetch()
    const module = await import(/* @vite-ignore */ path);
    if (!module.default) {
      throw new Error(`Configuration at ${path} does not export a default configuration`);
    }
    return module.default;
  } catch (error) {
    console.error(`Failed to load configuration from ${path}:`, error);
    return BUSINESS_CONFIG; // Fallback to business config
  }
}

/**
 * Create a new instance configuration by extending an existing one
 * AGENT NOTE: Use this to create variations of existing configurations
 */
export function extendConfig(
  baseConfig: SystemConfig, 
  overrides: Partial<SystemConfig>
): SystemConfig {
  // Create a deep copy of the base config
  const newConfig = JSON.parse(JSON.stringify(baseConfig));
  
  // Apply overrides
  return {
    ...newConfig,
    ...overrides,
    // Handle nested properties that need deep merging
    modules: {
      ...newConfig.modules,
      ...(overrides.modules || {}),
      // Handle deep nesting of module options
      tasks: {
        ...(newConfig.modules?.tasks || {}),
        ...(overrides.modules?.tasks || {})
      },
      knowledge: {
        ...(newConfig.modules?.knowledge || {}),
        ...(overrides.modules?.knowledge || {})
      }
    },
    data: {
      ...newConfig.data,
      ...(overrides.data || {})
    },
    ui: {
      ...newConfig.ui,
      ...(overrides.ui || {})
    },
    deployment: {
      ...newConfig.deployment,
      ...(overrides.deployment || {})
    }
  };
}

export default {
  getConfig,
  registerConfig,
  extendConfig,
  loadConfigFromPath,
  // Export standard configurations
  BUSINESS_CONFIG,
  PERSONAL_CONFIG
};