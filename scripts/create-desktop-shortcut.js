/**
 * Create a desktop shortcut for the IX Tasks application
 * This script generates a desktop shortcut (.desktop file on Linux, .app on macOS, or .bat/.lnk on Windows)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Get current directory
const currentDir = path.resolve(__dirname, '..');
const homeDir = os.homedir();
const desktopDir = path.join(homeDir, 'Desktop');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`
${colors.cyan}╔════════════════════════════════════════════════════╗
║            IX Tasks Desktop Shortcut Creator          ║
╚════════════════════════════════════════════════════╝${colors.reset}
`);

// Check desktop directory
if (!fs.existsSync(desktopDir)) {
  console.error(`${colors.red}Desktop directory not found at: ${desktopDir}${colors.reset}`);
  process.exit(1);
}

const platform = os.platform();

switch (platform) {
  case 'darwin': // macOS
    createMacOSShortcut();
    break;
  case 'win32': // Windows
    createWindowsShortcut();
    break;
  case 'linux': // Linux
    createLinuxShortcut();
    break;
  default:
    console.error(`${colors.red}Unsupported platform: ${platform}${colors.reset}`);
    process.exit(1);
}

function createMacOSShortcut() {
  // Create a shell script that will launch the app
  const scriptPath = path.join(desktopDir, 'IXTasks.command');
  const scriptContent = `#!/bin/bash
cd "${currentDir}"
echo "Starting IX Tasks..."
npm run start:all
`;

  try {
    fs.writeFileSync(scriptPath, scriptContent);
    fs.chmodSync(scriptPath, '755'); // Make executable
    
    console.log(`${colors.green}Desktop shortcut created at:${colors.reset} ${scriptPath}`);
    console.log(`${colors.yellow}You can now double-click the "IXTasks.command" icon on your Desktop to launch the application.${colors.reset}`);

    try {
      // Try to create an app icon (optional)
      execSync(`touch "${path.join(desktopDir, 'IXTasks.command')}"`, { stdio: 'ignore' });
      console.log(`${colors.green}Icon updated.${colors.reset}`);
    } catch (err) {
      // Ignore errors with icon
    }
  } catch (err) {
    console.error(`${colors.red}Error creating shortcut:${colors.reset}`, err.message);
  }
}

function createWindowsShortcut() {
  // Create a batch file
  const batchPath = path.join(desktopDir, 'IXTasks.bat');
  const batchContent = `@echo off
echo Starting IX Tasks...
cd /d "${currentDir.replace(/\//g, '\\')}"
npm run start:all
pause
`;

  try {
    fs.writeFileSync(batchPath, batchContent);
    console.log(`${colors.green}Desktop shortcut created at:${colors.reset} ${batchPath}`);
    console.log(`${colors.yellow}You can now double-click the "IXTasks.bat" icon on your Desktop to launch the application.${colors.reset}`);
  } catch (err) {
    console.error(`${colors.red}Error creating shortcut:${colors.reset}`, err.message);
  }
}

function createLinuxShortcut() {
  // Create a desktop entry file
  const desktopEntryPath = path.join(desktopDir, 'IXTasks.desktop');
  const desktopEntryContent = `[Desktop Entry]
Type=Application
Name=IX Tasks
Comment=Task Management Application
Exec=bash -c "cd ${currentDir} && npm run start:all"
Terminal=true
Categories=Development;
`;

  try {
    fs.writeFileSync(desktopEntryPath, desktopEntryContent);
    fs.chmodSync(desktopEntryPath, '755'); // Make executable
    
    console.log(`${colors.green}Desktop shortcut created at:${colors.reset} ${desktopEntryPath}`);
    console.log(`${colors.yellow}You can now double-click the "IXTasks" icon on your Desktop to launch the application.${colors.reset}`);
  } catch (err) {
    console.error(`${colors.red}Error creating shortcut:${colors.reset}`, err.message);
  }
}

console.log(`
${colors.cyan}To access the optimized minimal version:${colors.reset}
${colors.yellow}http://localhost:3045/minimal${colors.reset}

This loads only the core task functionality without any other features.
`);