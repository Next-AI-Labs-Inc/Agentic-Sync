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
    
    // Convert logo_src.png to proper icon formats using ImageMagick
    log('Converting logo_src.png to proper icon formats using ImageMagick');
    try {
      execSync('npm run convert-icons-properly', { stdio: 'inherit' });
    } catch (error) {
      log('Proper icon conversion failed, falling back to direct copy');
      execSync('npm run direct-copy-icon', { stdio: 'inherit' });
    }
    
    // Skip installing dependencies to avoid canvas build issues
    log('Skipping dependency installation (already installed)');
    
    // Build Next.js static assets with TAURI_BUILD=true
    log('Building Next.js static assets for Tauri production build');
    execute('TAURI_BUILD=true npm run build', 'Failed to build Next.js static assets');
    
    // Build Tauri desktop app with TAURI_BUILD=true
    log('Building Tauri desktop app with v1.5.9 for production');
    execute('cd src-tauri && TAURI_BUILD=true npx @tauri-apps/cli@1.5.9 build', 'Failed to build Tauri desktop app');
    
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