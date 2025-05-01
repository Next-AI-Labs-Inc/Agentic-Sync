# Shared Components Migration Plan

## Current Status

The application is currently in a transitional state with regard to shared components:

1. **Package Infrastructure**: 
   - Shared components are defined in `../shared-tools/packages/`
   - Basic package.json files exist for:
     - dropdown-menu
     - loading-spinner
     - popover
     - route-transition
   - The packages are referenced in the application's package.json

2. **Current Approach**:
   - Component files are still in the local project (`src/components/`)
   - Imports are using the local components (`import LoadingSpinner from '@/components/LoadingSpinner'`)
   - Components have deprecation comments mentioning the future shared imports

3. **Issues Encountered**:
   - Attempted migration to shared components via the `@ix/*` import path
   - Build failures due to module resolution issues
   - The verification script works, but actual import paths failed

## Migration Roadmap

### Phase 1: Prepare Shared Component Library (Priority: HIGH)

1. **Create TypeScript Source Files**:
   - For each component in `../shared-tools/packages/<component>/src/index.tsx`
   - Create proper interfaces and exports
   - Example for LoadingSpinner:
```tsx
// ../shared-tools/packages/loading-spinner/src/index.tsx
import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  className = ''
}: LoadingSpinnerProps) {
  // Implementation here
}
```

2. **Set Up TypeScript Configs**:
   - Add tsconfig.json to each package
   - Configure for React and module exports
   - Ensure dist directory is properly set up

3. **Implement Build Process**:
   - Ensure `npm run build` works in each package
   - Verify compiled output in dist/

### Phase 2: Test Components in Isolation (Priority: HIGH)

1. **Add Test Files**:
   - Create Jest tests for each component
   - Test rendering and props

2. **Create Documentation**:
   - README.md for each component
   - Usage examples

3. **Test Compilation**:
   - Ensure TypeScript compilation works
   - Validate the output matches expectations

### Phase 3: Gradual Migration (Priority: MEDIUM)

1. **Update One Component at a Time**:
   - Start with LoadingSpinner
   - Test in isolation before integrating
   - Verify in the main application

2. **Update Import Statements**:
   - Change from:
   ```tsx
   import LoadingSpinner from '@/components/LoadingSpinner';
   ```
   - To:
   ```tsx
   import { LoadingSpinner } from '@ix/loading-spinner';
   ```

3. **Run Verification**:
   - Use `npm run verify:imports` to check consistency
   - Run build tests after each component

### Phase 4: Remove Local Components (Priority: LOW)

1. **Dependency Check**:
   - Verify no local code uses the components directly
   - Check for any specific customizations

2. **Remove Local Files**:
   - Delete local component files only after full verification
   - Document removal in commit messages

## Technical Specifications

### Component Structure

Each shared component should follow this structure:

```
loading-spinner/
├── dist/             # Compiled output
├── src/              # TypeScript source
│   └── index.tsx     # Component definition
├── package.json      # Package metadata
├── tsconfig.json     # TypeScript configuration
└── README.md         # Component documentation
```

### Package.json Requirements

```json
{
  "name": "@ix/loading-spinner",
  "version": "0.1.0",
  "description": "Loading Spinner component for IX projects",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint . --ext .ts,.tsx",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-dom": ">=17.0.0"
  }
}
```

### Import Verification

The `verify-component-imports.js` script should be run before each build to ensure consistency:

```bash
npm run verify:imports
```

## Troubleshooting Guide

If you encounter build issues during migration:

1. **Module Resolution Errors**:
   - Verify the shared component exists and is built
   - Check that package.json references are correct
   - Look for path issues in import statements

2. **TypeScript Errors**:
   - Ensure interfaces match between components
   - Check for missing exports or wrong export syntax

3. **Temporary Rollback Process**:
   - If critical issues arise, revert to local components
   - Document what failed for future attempts

## Tools and Scripts

Key scripts for managing this migration:

1. **setup-shared-components.js**:
   - Updates package.json with local file references
   - Creates symlinks if needed

2. **verify-component-imports.js**:
   - Checks for inconsistent import usage
   - Validates shared component structure

3. **migrate-imports.js**:
   - Updates import statements to use modular imports
   - Can be run on specific files or directories

## Task Assignments

For the 12 agents working on this project:

1. **Component Library Lead** (2 agents):
   - Set up TypeScript configs
   - Implement build process
   - Create base component structure

2. **Component Developers** (6 agents):
   - LoadingSpinner team (2)
   - Popover team (2)
   - RouteTransition team (1)
   - DropdownMenu team (1)

3. **Integration Team** (2 agents):
   - Verify application imports
   - Test in main application
   - Coordinate with component teams

4. **Documentation & Testing** (2 agents):
   - Write component documentation
   - Create test suites
   - Verify proper coverage

## Timeline and Milestones

1. **Week 1**: Setup and Library Infrastructure
   - Create all necessary files and configs
   - Set up build process
   - Initial component implementations

2. **Week 2**: Component Testing
   - Test components in isolation
   - Fix any issues discovered
   - Document component APIs

3. **Week 3**: Migration
   - Update imports in main application
   - Test integration
   - Remove local components

## Verification Steps

After migration, verify the following:

1. Build succeeds with no errors:
   ```bash
   npm run build
   ```

2. All tests pass:
   ```bash
   npm test
   ```

3. Components render correctly in the application:
   - Start the application and visually verify components
   - Check error console for any warnings/errors

4. Import verification passes:
   ```bash
   npm run verify:imports
   ```