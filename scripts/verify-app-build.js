const { spawn } = require('child_process');
const { writeFileSync } = require('fs');
const path = require('path');

// Configuration
const BUILD_TIMEOUT = 300000; // 5 minutes max to build
const LOG_FILE = path.join(__dirname, '..', '.app-build-test.log');
let lastProgressUpdate = Date.now();
let buildPhase = 'initializing';

console.log('🧪 Verifying Next.js app build...');
console.log(`📋 Logs will be saved to: ${LOG_FILE}`);

// Start a clean log file
writeFileSync(LOG_FILE, `App build verification started at ${new Date().toISOString()}\n`, 'utf8');

// Function to append to the log file
const appendLog = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // Format raw stdout/stderr for better readability
  if (message.startsWith('[stdout]') || message.startsWith('[stderr]')) {
    const content = message.replace(/^\[(stdout|stderr)\]\s*/, '').trim();
    
    // Skip certain noisy output but still log to file
    if (content.match(/^\s*$/) || 
        content.includes('npm WARN') ||
        content.includes('npm notice') ||
        content.includes('Browserslist') ||
        content.match(/^\d+ vulnerable/)) {
      try {
        const fs = require('fs');
        fs.appendFileSync(LOG_FILE, logMessage);
      } catch (err) {
        console.error('Error writing to log file:', err);
      }
      return;
    }
    
    // Update progress indicators for build phases
    if (content.includes('Creating an optimized production build')) {
      buildPhase = 'compiling';
      reportProgress('Compiling code for production...');
    } else if (content.includes('Compiled successfully')) {
      buildPhase = 'optimizing';
      reportProgress('Optimizing build output...');
    } else if (content.includes('Collecting page data')) {
      buildPhase = 'collecting';
      reportProgress('Collecting page data...');
    } else if (content.includes('Generating static pages')) {
      buildPhase = 'generating';
      reportProgress('Generating static pages...');
    } else if (content.includes('Finalizing page optimization')) {
      buildPhase = 'finalizing';
      reportProgress('Finalizing optimizations...');
    }
    
    // Clean up the message for display
    if (content.includes('[DEV]') || content.includes('info  - ')) {
      // Don't display these in console but log to file
      try {
        const fs = require('fs');
        fs.appendFileSync(LOG_FILE, logMessage);
      } catch (err) {
        console.error('Error writing to log file:', err);
      }
      return;
    }
    
    // Format message for display
    message = message
      .replace(/^\[stdout\] /, '  ')
      .replace(/^\[stderr\] /, '❗ ');
  }
  
  // Show message in console
  console.log(message);
  
  try {
    const fs = require('fs');
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (err) {
    console.error('Error writing to log file:', err);
  }
};

// Report build progress periodically
function reportProgress(message) {
  const now = Date.now();
  // Only show progress messages every 5 seconds to avoid spam
  if (now - lastProgressUpdate > 5000) {
    appendLog(`🔄 BUILD PROGRESS: ${message}`);
    lastProgressUpdate = now;
  }
}

// Set up a timer to show periodic progress updates
const progressInterval = setInterval(() => {
  const elapsedSeconds = Math.floor((Date.now() - lastProgressUpdate) / 1000);
  if (elapsedSeconds > 10) {
    // If it's been more than 10 seconds since the last update
    let statusMessage = '';
    switch(buildPhase) {
      case 'initializing':
        statusMessage = 'Setting up build environment...';
        break;
      case 'compiling':
        statusMessage = 'Still compiling - this may take a while for large projects...';
        break;
      case 'optimizing':
        statusMessage = 'Optimizing build output - please wait...';
        break;
      case 'collecting':
        statusMessage = 'Collecting page data - this is normal...';
        break;
      case 'generating':
        statusMessage = 'Generating static pages - almost there...';
        break;
      case 'finalizing':
        statusMessage = 'Finalizing build - just a moment...';
        break;
      default:
        statusMessage = 'Building... please wait...';
    }
    appendLog(`⏳ ${statusMessage} (${elapsedSeconds}s)`);
    lastProgressUpdate = Date.now();
  }
}, 5000);

// Start the Next.js build process
const build = spawn('npm', ['run', 'build'], { 
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, FORCE_COLOR: '1' }
});

let isBuildSuccessful = false;
let hasErrorOccurred = false;
let timeoutId;

// Set a timeout to kill the process if it takes too long
timeoutId = setTimeout(() => {
  if (!isBuildSuccessful) {
    appendLog('❌ ERROR: Build timed out after ' + (BUILD_TIMEOUT/1000) + ' seconds');
    hasErrorOccurred = true;
    cleanup(1);
  }
}, BUILD_TIMEOUT);

// Listen for build output (stdout)
build.stdout.on('data', (data) => {
  const output = data.toString();
  appendLog(`[stdout] ${output.trim()}`);
  
  // Check for common build success indicators
  if (output.includes('compiled successfully')) {
    appendLog('✅ Code compiled successfully!');
  }
  
  if (output.includes('successfully generated') || 
      output.includes('Export successful')) {
    appendLog('✅ Pages generated successfully!');
    isBuildSuccessful = true;
  }
  
  // Check for common error patterns
  if (output.includes('ERROR in') || 
      output.includes('FATAL') ||
      output.includes('Failed to compile') ||
      output.includes('Build failed')) {
    appendLog('❌ Build error detected');
    hasErrorOccurred = true;
  }
  
  // Check for common warning patterns that should be highlighted
  if (output.includes('WARNING in') || output.includes('WARN ')) {
    appendLog('⚠️ Build warning: ' + output.trim().split('\n')[0]);
  }
});

// Listen for build errors (stderr)
build.stderr.on('data', (data) => {
  const output = data.toString();
  appendLog(`[stderr] ${output.trim()}`);
  
  // Check for common error indicators in stderr
  if (output.includes('ERROR') || 
      output.includes('FATAL') ||
      output.includes('Exception') ||
      output.includes('SyntaxError') ||
      output.includes('ReferenceError') ||
      output.includes('TypeError')) {
    appendLog('❌ ERROR detected in stderr');
    hasErrorOccurred = true;
  }
});

// Clean up and exit
function cleanup(exitCode = 0) {
  clearTimeout(timeoutId);
  clearInterval(progressInterval);
  
  // Try to kill the build process
  try {
    build.kill('SIGTERM');
    appendLog('🛑 Terminated build process');
  } catch (err) {
    appendLog(`Error killing process: ${err.message}`);
  }
  
  // Determine final result
  if (hasErrorOccurred) {
    appendLog('❌ VERIFICATION FAILED: Next.js app build has errors');
    appendLog('   Check the log file for detailed error messages');
    appendLog('   Common issues: Syntax errors, missing dependencies, incorrect imports');
    process.exit(1);
  } else if (isBuildSuccessful) {
    appendLog('✅ VERIFICATION PASSED: Next.js app built successfully');
    appendLog('   ✓ Code compiled without errors');
    appendLog('   ✓ All pages generated successfully');
    appendLog('   ✓ Build artifacts created correctly');
    process.exit(0);
  } else {
    appendLog('❓ VERIFICATION INCONCLUSIVE: Could not determine build status');
    appendLog('   This usually means the build process was interrupted');
    appendLog('   Check the log file for more information');
    process.exit(exitCode);
  }
}

// Handle process exit
build.on('exit', (code) => {
  appendLog(`Build process exited with code ${code}`);
  if (code === 0) {
    isBuildSuccessful = true;
    appendLog('✅ VERIFICATION PASSED: Next.js app built successfully');
    cleanup(0);
  } else {
    hasErrorOccurred = true;
    appendLog(`❌ VERIFICATION FAILED: Build exited with code ${code}`);
    cleanup(1);
  }
});

// Handle signal interrupts
process.on('SIGINT', () => {
  appendLog('Received SIGINT signal');
  cleanup();
});

process.on('SIGTERM', () => {
  appendLog('Received SIGTERM signal');
  cleanup();
});

appendLog('Building Next.js app...');