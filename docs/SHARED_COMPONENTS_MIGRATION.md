# Shared Components Migration Guide

## Overview

This document provides essential guidelines for migrating from local component implementations to the shared component library (`@ix/shared-tools`). Following these protocols will prevent build failures and ensure a smooth transition.

## Key Issues Identified

The primary issue with the current migration is:

1. **Import Mismatches**: Files were importing from `@ix/loading-spinner` and other shared component packages while still using local component implementations
2. **Missing Module Resolution**: The build system could not resolve these imports, causing build failures
3. **Inconsistent Component Deprecation**: Local components have deprecation notices but imports were not consistently updated

## Migration Protocol

### 1. Component Import Verification

Before any deployment or build, verify that all component imports match one of these patterns:

✅ **Correct Pattern #1 (Local Components)**: 
```javascript
import LoadingSpinner from '@/components/LoadingSpinner';
```

✅ **Correct Pattern #2 (Shared Components)**:
```javascript
import { LoadingSpinner } from '@ix/loading-spinner';
```

❌ **Incorrect Pattern (Mixed Approach)**:
```javascript
// NOT VALID: Importing from shared package when local component is still in use
import { LoadingSpinner } from '@ix/loading-spinner';
// Import should be: import LoadingSpinner from '@/components/LoadingSpinner';
```

### 2. Migration Steps

Follow these steps when migrating from local to shared components:

1. Run the import verification tool to detect affected files:
   ```bash
   npm run verify:imports
   ```

2. For each component migration:
   
   a. First, confirm the shared component exists and works as expected:
   ```bash
   npm run setup:components
   ```
   
   b. Update ALL import references to the component in a single operation:
   ```bash
   npm run migrate:imports
   ```
   
   c. Remove the local component implementation ONLY after verifying the shared component works

3. Run a full build test after migration:
   ```bash
   npm run verify
   ```

### 3. Post-Migration Verification

Always verify that the application works correctly after migration:

1. Ensure all tests pass:
   ```bash
   npm test
   ```

2. Verify the application builds successfully:
   ```bash
   npm run build
   ```

3. Manually test the affected components to ensure they behave as expected

## Component Status Reference

| Component | Package Path | Status | Notes |
|-----------|--------------|--------|-------|
| LoadingSpinner | @ix/loading-spinner | ✅ Available | Requires ../shared-tools/packages/loading-spinner |
| Popover | @ix/popover | ✅ Available | Requires ../shared-tools/packages/popover |
| RouteTransition | @ix/route-transition | ✅ Available | Requires ../shared-tools/packages/route-transition |
| DropdownMenu | @ix/dropdown-menu | ✅ Available | Requires ../shared-tools/packages/dropdown-menu |

## Verification Script

Add this script to package.json to help detect import mismatches:

```json
"scripts": {
  "verify:imports": "node scripts/verify-component-imports.js"
}
```

Create the verification script:

```javascript
// scripts/verify-component-imports.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Map of shared components and their expected import paths
const sharedComponents = {
  'LoadingSpinner': '@ix/loading-spinner',
  'Popover': '@ix/popover',
  'RouteTransition': '@ix/route-transition',
  'DropdownMenu': '@ix/dropdown-menu'
};

// Check if shared-tools packages exist
const componentsExist = Object.values(sharedComponents).every(pkg => {
  const pkgPath = path.resolve(__dirname, '..', '..', 'shared-tools/packages', pkg.replace('@ix/', ''));
  return fs.existsSync(pkgPath);
});

if (!componentsExist) {
  console.error('❌ Missing shared-tools packages. Run npm run setup:components first.');
  process.exit(1);
}

// Find all .tsx and .ts files
const files = glob.sync('src/**/*.{tsx,ts}', { ignore: ['**/node_modules/**'] });

let errors = 0;
let warnings = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  Object.entries(sharedComponents).forEach(([name, pkg]) => {
    // Check for import from @ix/* packages
    const sharedImportRegex = new RegExp(`import\\s+{\\s*${name}\\s*}\\s+from\\s+['"]${pkg}['"]`);
    
    // Check for local component definition
    const localDefRegex = new RegExp(`export\\s+default\\s+function\\s+${name}\\s*\\(`);
    const localClassDefRegex = new RegExp(`export\\s+default\\s+class\\s+${name}\\s+`);
    
    const usesSharedImport = sharedImportRegex.test(content);
    const hasLocalDef = localDefRegex.test(content) || localClassDefRegex.test(content);
    
    if (usesSharedImport && hasLocalDef) {
      console.error(`❌ ERROR in ${file}: Importing ${name} from ${pkg} but also defines it locally`);
      errors++;
    }
    
    // Check for deprecated comment but still using local import
    const deprecatedCommentRegex = new RegExp(`@deprecated.*${pkg}`);
    const localImportRegex = new RegExp(`import\\s+${name}\\s+from\\s+['"]@/components/${name}['"]`);
    
    if (deprecatedCommentRegex.test(content) && localImportRegex.test(content)) {
      console.warn(`⚠️ WARNING in ${file}: Using deprecated local ${name} component`);
      warnings++;
    }
  });
});

if (errors === 0 && warnings === 0) {
  console.log('✅ All component imports are consistent');
} else {
  console.log(`Found ${errors} errors and ${warnings} warnings`);
  if (errors > 0) process.exit(1);
}
```

## Troubleshooting

### Missing Component Error

If you encounter "Module not found: Can't resolve '@ix/loading-spinner'":

1. Verify the component exists in the shared-tools directory:
   ```bash
   ls -la ../shared-tools/packages/loading-spinner
   ```

2. Run the component setup script:
   ```bash
   npm run setup:components
   ```

3. If the issue persists, check the package.json references:
   ```json
   "dependencies": {
     "@ix/loading-spinner": "file:../shared-tools/packages/loading-spinner"
   }
   ```

4. As a temporary workaround, use the local component version until the shared component is properly configured.

## Additional Guidelines

1. **Never partially migrate a component**. Migration should be completed in a single comprehensive operation.

2. **Always test after migration**. Migration should not change component behavior.

3. **Document any component differences** between the local and shared versions to prevent surprises during migration.

4. **Create a test plan** for each component migration to verify all functionality is maintained.