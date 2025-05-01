#!/usr/bin/env node

/**
 * Migration Script for Tasks Core
 * 
 * This script helps migrate components from the current Tasks app implementation
 * to use the new tasks-core module with business case support.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to print in color
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// Banner
console.log(colorize('\n=== Tasks Core Migration Tool ===\n', 'cyan'));
console.log(colorize('This tool will help you migrate to the tasks-core components', 'cyan'));
console.log(colorize('It will scan your codebase for uses of TaskVerificationSteps and suggest replacements', 'cyan'));
console.log(colorize('\nIMPORTANT: This script does not modify files. It only suggests changes.\n', 'yellow'));

// Configuration
const SRC_DIR = path.resolve(__dirname, '../src');
const COMPONENT_MAPPINGS = {
  'TaskVerificationSteps': 'VerificationSteps',
  'components/TaskCard': 'TaskCard',
  'TasksApp': 'TasksApp'
};

// Find all files to analyze
const findFiles = () => {
  return glob.sync(`${SRC_DIR}/**/*.{tsx,jsx,ts,js}`, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
  });
};

// Check imports for tasks components
const findImports = (content) => {
  const results = [];
  
  // Find component import statements
  for (const originalComp in COMPONENT_MAPPINGS) {
    const regex = new RegExp(`import\\s+(?:{\\s*)?([\\w\\s,{}]+)(?:\\s*})?(\\s+from\\s+['"])([^'"]+${originalComp})`, 'g');
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      results.push({
        type: 'import',
        originalComp,
        newComp: COMPONENT_MAPPINGS[originalComp],
        importName: match[1].trim(),
        importPath: match[3],
        fullMatch: match[0],
        index: match.index,
        suggested: `import { ${COMPONENT_MAPPINGS[originalComp]} } from '@ix/tasks-core'`
      });
    }
  }
  
  return results;
};

// Find component usage
const findUsage = (content) => {
  const results = [];
  
  // Find component usage in JSX
  for (const originalComp in COMPONENT_MAPPINGS) {
    const basename = originalComp.split('/').pop();
    // Look for <ComponentName ... /> or <ComponentName>...</ComponentName>
    const regex = new RegExp(`<\\s*(${basename})\\s+([^>]*)>`, 'g');
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      // Extract props from the usage
      const props = match[2];
      
      // Create suggestion with businessCase prop
      let suggestion = `<${COMPONENT_MAPPINGS[originalComp]} ${props}`;
      
      // Check if businessCase prop is already present
      if (!props.includes('businessCase')) {
        suggestion += ' businessCase="tasks"';
      }
      
      // Finish the tag
      if (props.endsWith('/')) {
        suggestion = suggestion.slice(0, -1) + ' />';
      } else {
        suggestion += '>';
      }
      
      results.push({
        type: 'usage',
        originalComp: basename,
        newComp: COMPONENT_MAPPINGS[originalComp],
        props,
        fullMatch: match[0],
        index: match.index,
        suggested: suggestion
      });
    }
  }
  
  return results;
};

// Analyze a file
const analyzeFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = findImports(content);
    const usage = findUsage(content);
    
    if (imports.length > 0 || usage.length > 0) {
      console.log(colorize(`\nFile: ${filePath.replace(process.cwd(), '')}`, 'green'));
      
      if (imports.length > 0) {
        console.log(colorize('  Imports to update:', 'yellow'));
        imports.forEach(item => {
          console.log(`    ${colorize('- ', 'red')}${colorize(item.fullMatch, 'red')}`);
          console.log(`      ${colorize('→ ', 'green')}${colorize(item.suggested, 'green')}`);
        });
      }
      
      if (usage.length > 0) {
        console.log(colorize('  Component usage to update:', 'yellow'));
        usage.forEach(item => {
          console.log(`    ${colorize('- ', 'red')}${colorize(item.fullMatch, 'red')}`);
          console.log(`      ${colorize('→ ', 'green')}${colorize(item.suggested, 'green')}`);
        });
      }
      
      return { filePath, hasChanges: true, imports, usage };
    }
    
    return { filePath, hasChanges: false };
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error);
    return { filePath, hasChanges: false, error };
  }
};

// Main function
const main = () => {
  const files = findFiles();
  console.log(colorize(`Found ${files.length} files to analyze`, 'blue'));
  
  let filesWithChanges = 0;
  const results = files.map(file => {
    const result = analyzeFile(file);
    if (result.hasChanges) filesWithChanges++;
    return result;
  });
  
  // Summary
  console.log(colorize('\n=== Migration Summary ===', 'cyan'));
  console.log(colorize(`Total files analyzed: ${files.length}`, 'blue'));
  console.log(colorize(`Files needing updates: ${filesWithChanges}`, 'yellow'));
  
  console.log(colorize('\nNext steps:', 'green'));
  console.log(colorize('1. Make sure you\'ve added the tasks-core submodule', 'green'));
  console.log(colorize('2. Update your package.json to include @ix/tasks-core', 'green'));
  console.log(colorize('3. Update imports and component usage as suggested', 'green'));
  console.log(colorize('4. Test the new components with different business cases', 'green'));
  console.log(colorize('\nFor more information, see /docs/TASKS_CORE_INTEGRATION.md', 'blue'));
};

// Run the script
main();