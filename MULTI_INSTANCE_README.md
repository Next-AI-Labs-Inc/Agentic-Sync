# IX Tasks: Multi-Instance Architecture

This document explains how to work with the multi-instance architecture in IX Tasks. This system allows deploying multiple customized versions of the IX Tasks application with different feature sets, while maintaining a single codebase.

## Core Concepts

The multi-instance architecture is built around these key concepts:

1. **System Modes**: Each instance operates in a specific "mode" (business, personal, client, etc.)
2. **Feature Flags**: Features can be selectively enabled/disabled per mode
3. **Configuration Registry**: Central registry of all available system configurations
4. **Environment Controls**: Instances are selected using environment variables

## Getting Started

### Running Different Instances

To run the application in different modes:

```bash
# Business mode (original)
IX_SYSTEM_MODE=business npm run dev

# Personal mode (new features)
IX_SYSTEM_MODE=personal npm run dev

# Custom client mode
IX_SYSTEM_MODE=client1 npm run dev
```

### Creating a New Instance Type

1. Update `src/config/system-config.ts`
2. Create a new configuration by copying the template
3. Register it using `registerConfig()`
4. Deploy with the appropriate environment variable

Example:

```typescript
// In system-config.ts
export const CLIENT_CONFIG: SystemConfig = {
  mode: 'client1',
  name: 'Client Tasks',
  instanceId: 'client1',
  // Configure modules, data, UI, etc.
};

// Register the configuration
registerConfig(CLIENT_CONFIG);
```

## Development Guidelines

When developing with the multi-instance architecture, follow these principles:

### 1. Adding Features for Specific Instances

When adding features that should only appear in certain instances:

```typescript
// 1. Add a feature flag in the SystemConfig interface
interface SystemConfig {
  modules: {
    tasks: {
      // Existing features...
      newFeature: boolean; // New feature flag
    }
  }
}

// 2. Set to false in existing configs (backward compatibility)
BUSINESS_CONFIG = {
  // ...
  modules: {
    tasks: {
      // ...
      newFeature: false // Disabled in business mode
    }
  }
}

// 3. Enable in the target instance
PERSONAL_CONFIG = {
  // ...
  modules: {
    tasks: {
      // ...
      newFeature: true // Enabled in personal mode
    }
  }
}
```

### 2. Conditional Rendering

Use the provided hooks and components to conditionally render features:

```tsx
// Using the hook approach
const newFeatureEnabled = useFeatureFlag('modules.tasks.newFeature');

return (
  <div>
    {/* Regular content */}
    {newFeatureEnabled && <NewFeatureComponent />}
  </div>
);

// Or using the declarative component
<ConditionalFeature featurePath="modules.tasks.newFeature">
  <NewFeatureComponent />
</ConditionalFeature>
```

### 3. Accessing Configuration Values

To access other configuration values beyond just boolean feature flags:

```tsx
const { config } = useSystemConfig();

// Use configuration values
const workflowType = config.modules.tasks.workflow;
const theme = config.ui.theme;
```

## Deployment

Each instance should have its own deployment with:

1. A unique domain or subdomain
2. Environment variable `IX_SYSTEM_MODE` set to the instance mode
3. Separate database (using `data.databasePrefix` or completely separate connections)

## Example Instances

| Instance ID | Name           | Key Features                               | Target Use Case             |
|-------------|----------------|--------------------------------------------|-----------------------------|
| business    | IX Tasks       | Standard task workflow, agent integration  | Original business task tracking |
| personal    | Personal IX    | Tags, categories, GTD workflow, multi-context | Personal task management   |
| client      | Client IX      | Custom branding, kanban workflow           | Client-facing project management |

## Reference

See these files for implementation details:

- `src/config/system-config.ts` - Configuration definition and registry
- `src/contexts/SystemConfigContext.tsx` - React context provider
- `src/components/ConfigAwareTaskHeader.tsx` - Example implementation

## Adding New Module Types

To add an entirely new module type (beyond tasks and knowledge):

1. Update the `SystemConfig` interface
2. Add the module to all configurations (disabled by default for backward compatibility)
3. Create components that check for module availability
4. Implement module-specific logic

For extensive examples, see the detailed documentation in the source files.