const { spawn } = require('child_process');
const { writeFileSync } = require('fs');
const path = require('path');

// Configuration
const BUILD_TIMEOUT = 300000; // 5 minutes max to build
const LOG_FILE = path.join(__dirname, '..', '.app-build-test.log');

console.log('🧪 Verifying Next.js app build...');
console.log(`📋 Logs will be saved to: ${LOG_FILE}`);

// Start a clean log file
writeFileSync(LOG_FILE, `App build verification started at ${new Date().toISOString()}\n`, 'utf8');

// Function to append to the log file
const appendLog = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  
  try {
    const fs = require('fs');
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (err) {
    console.error('Error writing to log file:', err);
  }
};

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
  if (output.includes('compiled successfully') || 
      output.includes('successfully generated')) {
    appendLog('✅ Build step succeeded!');
  }
  
  // Check for common error patterns
  if (output.includes('ERROR') || 
      output.includes('FATAL') ||
      output.includes('Failed to compile') ||
      output.includes('Build failed')) {
    appendLog('❌ ERROR detected in output');
    hasErrorOccurred = true;
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
    process.exit(1);
  } else if (isBuildSuccessful) {
    appendLog('✅ VERIFICATION PASSED: Next.js app built successfully');
    process.exit(0);
  } else {
    appendLog('❓ VERIFICATION INCONCLUSIVE: Could not determine build status');
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