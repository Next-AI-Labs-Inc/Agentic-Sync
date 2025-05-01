#!/usr/bin/env node

/**
 * Script to install shared components from local packages
 * 
 * This script helps manage local development dependencies for @ix components.
 * It ensures the package.json has the correct local file references and creates symlinks if needed.
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
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m'
};

// Path to shared-tools packages
const sharedToolsPath = path.resolve(__dirname, '../../shared-tools/packages');

// List all component directories in shared-tools
function getAvailableComponents() {
  try {
    return fs.readdirSync(sharedToolsPath)
      .filter(dir => {
        const packagePath = path.join(sharedToolsPath, dir, 'package.json');
        return fs.existsSync(packagePath);
      });
  } catch (err) {
    console.error(`${COLORS.red}Error listing shared components: ${err.message}${COLORS.reset}`);
    return [];
  }
}

// Update package.json with local file references
function updatePackageJson(components) {
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = packageJson.dependencies || {};
    
    let changed = false;
    
    // Add or update each component dependency
    components.forEach(component => {
      const packageName = `@ix/${component}`;
      const localPath = `file:../shared-tools/packages/${component}`;
      
      if (!dependencies[packageName] || dependencies[packageName] !== localPath) {
        dependencies[packageName] = localPath;
        changed = true;
        console.log(`${COLORS.green}✓ Added/updated ${COLORS.brightWhite}${packageName}${COLORS.green} to package.json${COLORS.reset}`);
      } else {
        console.log(`${COLORS.brightYellow}→ ${COLORS.brightWhite}${packageName}${COLORS.brightYellow} already configured${COLORS.reset}`);
      }
    });
    
    if (changed) {
      packageJson.dependencies = dependencies;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`${COLORS.brightGreen}✓ package.json updated successfully${COLORS.reset}`);
    } else {
      console.log(`${COLORS.brightYellow}→ No changes needed in package.json${COLORS.reset}`);
    }
    
    return changed;
  } catch (err) {
    console.error(`${COLORS.red}Error updating package.json: ${err.message}${COLORS.reset}`);
    return false;
  }
}

// Install dependencies if needed
function installDependencies() {
  try {
    console.log(`${COLORS.brightCyan}Installing dependencies...${COLORS.reset}`);
    execSync('npm install --no-save', { stdio: 'inherit' });
    console.log(`${COLORS.brightGreen}✓ Dependencies installed successfully${COLORS.reset}`);
  } catch (err) {
    console.error(`${COLORS.red}Error installing dependencies: ${err.message}${COLORS.reset}`);
  }
}

// Main function
function main() {
  console.log(`${COLORS.brightBlue}================================${COLORS.reset}`);
  console.log(`${COLORS.brightMagenta}IX Shared Components Setup${COLORS.reset}`);
  console.log(`${COLORS.brightBlue}================================${COLORS.reset}\n`);
  
  // Get available components
  const components = getAvailableComponents();
  
  if (components.length === 0) {
    console.log(`${COLORS.yellow}No shared components found. Make sure the shared-tools packages exist.${COLORS.reset}`);
    return;
  }
  
  console.log(`${COLORS.cyan}Found ${components.length} shared components:${COLORS.reset}`);
  components.forEach(comp => console.log(`${COLORS.brightWhite}- ${comp}${COLORS.reset}`));
  console.log('');
  
  // Update package.json
  const changed = updatePackageJson(components);
  
  // Install dependencies if package.json was changed
  if (changed) {
    console.log(`\n${COLORS.cyan}Running npm install to update dependencies...${COLORS.reset}`);
    installDependencies();
  }
  
  console.log(`\n${COLORS.brightGreen}Setup complete!${COLORS.reset}`);
  console.log(`${COLORS.cyan}You can now import components like:${COLORS.reset}`);
  console.log(`${COLORS.brightWhite}import { ComponentName } from '@ix/component-name';${COLORS.reset}`);
  console.log(`\n${COLORS.brightBlue}================================${COLORS.reset}\n`);
}

main();