const { spawn } = require('child_process');
const { existsSync, writeFileSync } = require('fs');
const path = require('path');

// Configuration
const PORT = 3045; // Must match port in package.json
const STARTUP_TIMEOUT = 30000; // 30 seconds max to start up
const HEALTH_CHECK_URL = `http://localhost:${PORT}`;
const LOG_FILE = path.join(__dirname, '..', '.app-startup-test.log');

console.log('🧪 Verifying Next.js app startup...');
console.log(`📋 Logs will be saved to: ${LOG_FILE}`);

// Start a clean log file
writeFileSync(LOG_FILE, `App startup verification started at ${new Date().toISOString()}\n`, 'utf8');

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

// Start the Next.js app in development mode
const app = spawn('npm', ['run', 'dev'], { 
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, FORCE_COLOR: '1' }
});

let isAppStarted = false;
let hasErrorOccurred = false;
let timeoutId;

// Set a timeout to kill the process if it takes too long
timeoutId = setTimeout(() => {
  if (!isAppStarted) {
    appendLog('❌ ERROR: App startup timed out after ' + (STARTUP_TIMEOUT/1000) + ' seconds');
    hasErrorOccurred = true;
    cleanup(1);
  }
}, STARTUP_TIMEOUT);

// Listen for app output (stdout)
app.stdout.on('data', (data) => {
  const output = data.toString();
  appendLog(`[stdout] ${output.trim()}`);
  
  // Check for common startup success indicators
  if (output.includes('ready started server') || 
      output.includes('ready - started server on') ||
      output.includes(`localhost:${PORT}`)) {
    isAppStarted = true;
    appendLog('✅ SUCCESS: App started successfully!');
    
    // Perform a health check on the app
    performHealthCheck();
  }
  
  // Check for common error patterns
  if (output.includes('ERROR') || 
      output.includes('FATAL') ||
      output.includes('EADDRINUSE') ||
      output.includes('Failed to compile')) {
    appendLog('❌ ERROR detected in output');
    hasErrorOccurred = true;
  }
});

// Listen for app errors (stderr)
app.stderr.on('data', (data) => {
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
  
  // Kill the Next.js process
  try {
    app.kill('SIGTERM');
    appendLog('🛑 Terminated Next.js process');
  } catch (err) {
    appendLog(`Error killing process: ${err.message}`);
  }
  
  // Determine final result
  if (hasErrorOccurred) {
    appendLog('❌ VERIFICATION FAILED: Next.js app has errors on startup');
    process.exit(1);
  } else if (isAppStarted) {
    appendLog('✅ VERIFICATION PASSED: Next.js app started successfully');
    process.exit(0);
  } else {
    appendLog('❓ VERIFICATION INCONCLUSIVE: Could not determine app status');
    process.exit(exitCode);
  }
}

// Handle process exit
app.on('exit', (code) => {
  appendLog(`Next.js process exited with code ${code}`);
  if (code !== 0 && !hasErrorOccurred) {
    hasErrorOccurred = true;
  }
  cleanup();
});

// Perform a basic health check
function performHealthCheck() {
  appendLog(`Performing health check on ${HEALTH_CHECK_URL}...`);
  
  // Using a simple HTTP request to check if the server responds
  const http = require('http');
  
  const req = http.get(HEALTH_CHECK_URL, (res) => {
    appendLog(`Health check response: ${res.statusCode}`);
    
    if (res.statusCode >= 200 && res.statusCode < 400) {
      appendLog('✅ Health check passed: Server is responding');
    } else {
      appendLog(`❌ Health check failed: Server responded with status ${res.statusCode}`);
      hasErrorOccurred = true;
    }
    
    // Wait a moment to capture any additional logs, then exit
    setTimeout(() => cleanup(), 3000);
  });
  
  req.on('error', (err) => {
    appendLog(`❌ Health check failed: ${err.message}`);
    hasErrorOccurred = true;
    cleanup(1);
  });
  
  // Set a timeout for the health check itself
  req.setTimeout(10000, () => {
    appendLog('❌ Health check timed out');
    hasErrorOccurred = true;
    req.destroy();
    cleanup(1);
  });
}

// Handle signal interrupts
process.on('SIGINT', () => {
  appendLog('Received SIGINT signal');
  cleanup();
});

process.on('SIGTERM', () => {
  appendLog('Received SIGTERM signal');
  cleanup();
});

appendLog('Waiting for Next.js app to start...');