#!/usr/bin/env node

/**
 * Script to migrate import statements from the old monolithic @ix/shared-tools
 * to the new modular component imports
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m'
};

// Component mapping from the old monolithic import to new modular imports
const COMPONENT_MAPPING = {
  'DropdownMenu': '@ix/dropdown-menu',
  'LoadingSpinner': '@ix/loading-spinner',
  'DocumentationViewer': '@ix/documentation-viewer',
  'Popover': '@ix/popover',
  'RouteTransition': '@ix/route-transition',
  // Add more components as they're created
};

// Find all TS and TSX files in the src directory
function findSourceFiles() {
  try {
    const result = execSync('find src -type f -name "*.ts" -o -name "*.tsx"', { encoding: 'utf8' });
    return result.trim().split('\n').filter(Boolean);
  } catch (err) {
    console.error(`${COLORS.red}Error finding source files: ${err.message}${COLORS.reset}`);
    return [];
  }
}

// Process a file to update imports
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check for old monolithic imports
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"]@ix\/shared-tools['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importedItems = match[1].split(',').map(item => item.trim());
      const newImports = {};
      
      // Group imported items by their new package
      importedItems.forEach(item => {
        // Remove any "as" aliases for simpler processing
        const cleanItem = item.split(' as ')[0].trim();
        
        for (const [component, packageName] of Object.entries(COMPONENT_MAPPING)) {
          if (cleanItem === component) {
            newImports[packageName] = newImports[packageName] || [];
            newImports[packageName].push(item);
          }
        }
      });
      
      // Create replacement import statements
      if (Object.keys(newImports).length > 0) {
        let replacementImports = [];
        
        for (const [packageName, components] of Object.entries(newImports)) {
          replacementImports.push(`import { ${components.join(', ')} } from '${packageName}'`);
        }
        
        // Replace the old import with new modular imports
        content = content.replace(match[0], replacementImports.join(';\n'));
        modified = true;
      }
    }
    
    // Write changes back to the file if modified
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`${COLORS.green}✓ Updated imports in ${COLORS.brightWhite}${filePath}${COLORS.reset}`);
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`${COLORS.red}Error processing file ${filePath}: ${err.message}${COLORS.reset}`);
    return false;
  }
}

// Main function
function main() {
  console.log(`${COLORS.blue}================================${COLORS.reset}`);
  console.log(`${COLORS.magenta}IX Import Migration Tool${COLORS.reset}`);
  console.log(`${COLORS.blue}================================${COLORS.reset}\n`);
  
  // Find all source files
  const files = findSourceFiles();
  
  if (files.length === 0) {
    console.log(`${COLORS.yellow}No source files found.${COLORS.reset}`);
    return;
  }
  
  console.log(`${COLORS.cyan}Found ${files.length} source files to check.${COLORS.reset}\n`);
  
  // Process each file
  let updatedCount = 0;
  
  files.forEach(file => {
    if (processFile(file)) {
      updatedCount++;
    }
  });
  
  // Summary
  console.log(`\n${COLORS.blue}================================${COLORS.reset}`);
  console.log(`${COLORS.brightGreen}Migration complete!${COLORS.reset}`);
  console.log(`${COLORS.cyan}Updated ${updatedCount} files.${COLORS.reset}`);
  
  if (updatedCount > 0) {
    console.log(`\n${COLORS.yellow}Next steps:${COLORS.reset}`);
    console.log(`${COLORS.brightWhite}1. Run 'npm run setup:components' to ensure all components are installed${COLORS.reset}`);
    console.log(`${COLORS.brightWhite}2. Run 'npm install' to update dependencies${COLORS.reset}`);
    console.log(`${COLORS.brightWhite}3. Test your application to make sure everything works${COLORS.reset}`);
  }
  
  console.log(`${COLORS.blue}================================${COLORS.reset}\n`);
}

main();