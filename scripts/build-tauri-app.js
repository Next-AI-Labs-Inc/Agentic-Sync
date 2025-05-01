#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set the current working directory to the project root
process.chdir(path.resolve(__dirname, '..'));

// Log function to show progress
function log(message) {
  console.log(`\n[BUILD] ${message}`);
}

// Error handling
function handleError(error, message) {
  console.error(`\n❌ ERROR: ${message}`);
  console.error(error.toString());
  process.exit(1);
}

// Execute commands with proper error handling
function execute(command, errorMessage) {
  try {
    log(`Executing: ${command}`);
    return execSync(command, { stdio: 'inherit' });
  } catch (error) {
    handleError(error, errorMessage);
  }
}

// Main build function
async function buildApp() {
  try {
    log('Starting IX Agent Sync build process');
    
    // Generate simple icons (no canvas dependency required)
    log('Generating simple icons');
    execute('npm run generate-icons', 'Failed to generate icons');
    
    // Skip installing dependencies to avoid canvas build issues
    log('Skipping dependency installation (already installed)');
    
    // Build Next.js static assets
    log('Building Next.js static assets');
    execute('npm run build', 'Failed to build Next.js static assets');
    
    // Build Tauri desktop app
    log('Building Tauri desktop app with v1.5.9');
    execute('cd src-tauri && npx @tauri-apps/cli@1.5.9 build', 'Failed to build Tauri desktop app');
    
    log('Build completed successfully! 🎉');
    
    // Find the built app path
    let platform = process.platform;
    let appPath = '';
    
    if (platform === 'darwin') {
      appPath = path.resolve(__dirname, '../src-tauri/target/release/bundle/dmg/IX Agent Sync_0.1.0_aarch64.dmg');
    } else if (platform === 'win32') {
      appPath = path.resolve(__dirname, '../src-tauri/target/release/bundle/msi/IX Agent Sync_0.1.0_x64_en-US.msi');
    } else if (platform === 'linux') {
      appPath = path.resolve(__dirname, '../src-tauri/target/release/bundle/appimage/ix-agent-sync_0.1.0_amd64.AppImage');
    }
    
    if (fs.existsSync(appPath)) {
      log(`App built successfully at: ${appPath}`);
    } else {
      log(`Build appears successful, but unable to locate app at expected path.`);
      log(`Check in src-tauri/target/release/bundle/ for your compiled application.`);
    }
    
  } catch (error) {
    handleError(error, 'An unexpected error occurred during the build process');
  }
}

// Run the build process
buildApp();