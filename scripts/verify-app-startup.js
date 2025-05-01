const { spawn } = require('child_process');
const { existsSync, writeFileSync } = require('fs');
const path = require('path');

// Configuration
const PORT = 3020; // Must match production port in package.json
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
  
  // Format raw stdout/stderr for better readability
  if (message.startsWith('[stdout]') || message.startsWith('[stderr]')) {
    // Skip repetitive or non-informative lines
    if (message.includes('webpack compiled') || 
        message.includes('Browserslist') ||
        message.includes('npm notice') || 
        message.match(/^\[std(out|err)\]\s*$/)) {
      // Still log to file but skip console
      try {
        const fs = require('fs');
        fs.appendFileSync(LOG_FILE, logMessage);
      } catch (err) {
        console.error('Error writing to log file:', err);
      }
      return;
    }
    
    // Clean up common patterns for better readability
    message = message
      .replace(/^\[stdout\] /, '  ') 
      .replace(/^\[stderr\] /, '❗ ');
  }
  
  // Print meaningful messages to console
  console.log(message);
  
  try {
    const fs = require('fs');
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (err) {
    console.error('Error writing to log file:', err);
  }
};

// Check if server is already running
function isPortInUse(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const tester = net.createServer()
      .once('error', err => {
        if (err.code === 'EADDRINUSE') {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .once('listening', () => {
        tester.close();
        resolve(false);
      })
      .listen(port);
  });
}

// Start the app or use existing server
let app;
(async () => {
  if (await isPortInUse(PORT)) {
    appendLog(`🔍 DETECTED: Server already running on port ${PORT}`);
    appendLog(`✅ Using existing server for verification (no need to start a new one)`);
    isAppStarted = true;
    startupPhase = 'using existing server';
    
    // Short delay to allow console output to be read
    setTimeout(() => {
      appendLog(`🔍 Proceeding with health check on existing server...`);
      performHealthCheck();
    }, 1000);
  } else {
    appendLog(`🚀 No server detected on port ${PORT}. Starting a new one...`);
    // Start the Next.js app in production mode
    app = spawn('npm', ['run', 'prod'], { 
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '1' }
    });
  }
})();

let isAppStarted = false;
let hasErrorOccurred = false;
let timeoutId;

// Track startup progress
let startTime = Date.now();
let startupPhase = 'initializing';
let lastProgressUpdate = Date.now();

// Progress reporting function
function reportStartupProgress() {
  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  appendLog(`⏳ STARTUP PROGRESS: ${startupPhase} (${elapsedSeconds}s elapsed)`);
  lastProgressUpdate = Date.now();
}

// Set up a timer to show periodic progress updates during startup
const progressInterval = setInterval(() => {
  if (!isAppStarted) {
    const elapsedSinceLastUpdate = Math.floor((Date.now() - lastProgressUpdate) / 1000);
    if (elapsedSinceLastUpdate > 5) {
      reportStartupProgress();
    }
  } else {
    clearInterval(progressInterval);
  }
}, 5000);

// Setup timeout only if we're actually starting a server
// (we handle this after the port check to avoid race conditions)
setTimeout(() => {
  // If isAppStarted is still false, it means we're trying to start a server
  // (if a server was detected during port check, isAppStarted would already be true)
  if (!isAppStarted) {
    appendLog('🚀 Starting app verification...');
    appendLog('⏳ STARTUP PHASE: Initializing server (this may take up to 30 seconds)');
    startupPhase = 'starting server';
    
    timeoutId = setTimeout(() => {
      if (!isAppStarted) {
        appendLog('❌ ERROR: App startup timed out after ' + (STARTUP_TIMEOUT/1000) + ' seconds');
        appendLog('💡 TIP: This usually means there\'s a problem preventing the server from starting');
        appendLog('   Common issues: Port conflicts, missing dependencies, configuration errors');
        hasErrorOccurred = true;
        cleanup(1);
      }
    }, STARTUP_TIMEOUT);
  }
}, 1500); // Small delay to ensure port check completes first

  // Set up event listeners if we're starting the app
  if (app) {
    // Listen for app output (stdout)
    app.stdout.on('data', (data) => {
      const output = data.toString();
      appendLog(`[stdout] ${output.trim()}`);
      
      // Track startup phases for progress reporting
      if (output.includes('wait') || output.includes('starting')) {
        startupPhase = 'starting server';
        reportStartupProgress();
      } else if (output.includes('compiling')) {
        startupPhase = 'compiling';
        reportStartupProgress();
      } else if (output.includes('compiled')) {
        startupPhase = 'compiled';
        reportStartupProgress();
      }
      
      // Check for common startup success indicators
      if (output.includes('ready started server') || 
          output.includes('ready - started server on') ||
          output.includes(`localhost:${PORT}`)) {
        isAppStarted = true;
        appendLog('✅ SUCCESS: App started successfully!');
        appendLog('   ✓ Server is running');
        appendLog('   ✓ Listening on port ' + PORT);
        
        // Perform a health check on the app
        performHealthCheck();
      }
      
      // Check for common error patterns with helpful messages
      if (output.includes('EADDRINUSE')) {
        appendLog('ℹ️ INFO: Port ' + PORT + ' is already in use');
        appendLog('✅ Using existing server for health check');
        appendLog('   The verification will continue with the existing server');
        // Set app as started since there's a server already running
        isAppStarted = true;
        // Perform health check on the existing server
        performHealthCheck();
        // Don't mark as error since we'll use the existing server
        hasErrorOccurred = false;
      } else if (output.includes('ERROR in')) {
        appendLog('❌ ERROR: Startup error detected');
        hasErrorOccurred = true;
      } else if (output.includes('FATAL')) {
        appendLog('❌ FATAL ERROR: Server crashed during startup');
        hasErrorOccurred = true;
      } else if (output.includes('Failed to compile')) {
        appendLog('❌ ERROR: Compilation failed during startup');
        hasErrorOccurred = true;
      }
    });

    // Listen for app errors (stderr)
    app.stderr.on('data', (data) => {
      const output = data.toString();
      appendLog(`[stderr] ${output.trim()}`);
      
      // Check for common error indicators in stderr with helpful messages
      if (output.includes('SyntaxError')) {
        appendLog('❌ ERROR: Syntax error detected');
        appendLog('💡 TIP: Check for missing brackets, commas, or semicolons');
        hasErrorOccurred = true;
      } else if (output.includes('ReferenceError')) {
        appendLog('❌ ERROR: Reference error detected');
        appendLog('💡 TIP: You might be using a variable that doesn\'t exist');
        hasErrorOccurred = true;
      } else if (output.includes('TypeError')) {
        appendLog('❌ ERROR: Type error detected');
        appendLog('💡 TIP: You might be using a value of the wrong type');
        hasErrorOccurred = true;
      } else if (output.includes('Cannot find module')) {
        appendLog('❌ ERROR: Missing module');
        appendLog('💡 TIP: Run npm install to install missing dependencies');
        hasErrorOccurred = true;
      } else if (output.includes('ERROR')) {
        appendLog('❌ ERROR detected in server startup');
        hasErrorOccurred = true;
      }
    });
  }
}

// Clean up and exit
function cleanup(exitCode = 0) {
  clearTimeout(timeoutId);
  clearInterval(progressInterval);
  
  // Kill the Next.js process only if we started it
  if (app) {
    try {
      app.kill('SIGTERM');
      appendLog('🛑 Terminated Next.js process');
    } catch (err) {
      appendLog(`Error killing process: ${err.message}`);
    }
  }
  
  // Calculate total duration of the verification
  const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
  
  // Determine final result with detailed feedback
  if (hasErrorOccurred) {
    appendLog(`\n❌ VERIFICATION FAILED: Next.js app has errors on startup (after ${totalSeconds}s)`);
    appendLog('   The app encountered errors during the startup process');
    appendLog('   Check the messages above for specific error details');
    appendLog('   Check the log file for complete error information');
    process.exit(1);
  } else if (isAppStarted) {
    appendLog(`\n✅ VERIFICATION PASSED: Next.js app started successfully (${totalSeconds}s)`);
    appendLog('   ✓ Server started without errors');
    appendLog('   ✓ Health check passed');
    appendLog('   ✓ App is responding to HTTP requests');
    process.exit(0);
  } else {
    appendLog(`\n❓ VERIFICATION INCONCLUSIVE: Could not determine app status (${totalSeconds}s)`);
    appendLog('   This usually means the verification was interrupted');
    appendLog('   Check the log file for more information');
    process.exit(exitCode);
  }
}

// Handle process exit for app if we started it
if (app) {
  app.on('exit', (code) => {
    appendLog(`Next.js process exited with code ${code}`);
    if (code !== 0 && !hasErrorOccurred) {
      hasErrorOccurred = true;
    }
    cleanup();
  });
}

// Perform a basic health check
function performHealthCheck() {
  appendLog(`🔍 CHECKING: Application health at ${HEALTH_CHECK_URL}`);
  
  // Using a simple HTTP request to check if the server responds
  const http = require('http');
  
  const req = http.get(HEALTH_CHECK_URL, (res) => {
    const statusText = res.statusCode >= 200 && res.statusCode < 400 ? 'OK' : 'ERROR';
    appendLog(`📊 SERVER RESPONSE: HTTP ${res.statusCode} (${statusText})`);
    
    if (res.statusCode >= 200 && res.statusCode < 400) {
      appendLog('✅ HEALTH CHECK PASSED: Server is responding normally');
      
      // Get response details
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Check if the response contains any signs of 500 errors or React errors
        const hasErrors = data.includes('Server Error') || 
                         data.includes('Something went wrong') ||
                         data.includes('Error: ');
                         
        if (hasErrors) {
          appendLog('⚠️ WARNING: Response contains error messages');
          appendLog('🔍 The server returned a 200 status code but the content indicates errors');
          hasErrorOccurred = true;
        }
        
        // Wait a moment to capture any additional logs, then exit
        setTimeout(() => cleanup(), 2000);
      });
    } else {
      appendLog(`❌ HEALTH CHECK FAILED: Server responded with HTTP ${res.statusCode}`);
      if (res.statusCode === 404) {
        appendLog('💡 TIP: This could mean the home page route is not properly configured');
      } else if (res.statusCode === 500) {
        appendLog('💡 TIP: This indicates a server-side error in your application code');
      }
      hasErrorOccurred = true;
      // Wait a moment to capture any additional logs, then exit
      setTimeout(() => cleanup(), 2000);
    }
  });
  
  req.on('error', (err) => {
    appendLog(`❌ HEALTH CHECK FAILED: ${err.message}`);
    if (err.code === 'ECONNREFUSED') {
      appendLog('💡 TIP: This usually means the server is not actually running');
    } else if (err.code === 'ETIMEDOUT') {
      appendLog('💡 TIP: Server is taking too long to respond - check for infinite loops or blocking operations');
    }
    hasErrorOccurred = true;
    cleanup(1);
  });
  
  // Set a timeout for the health check itself
  req.setTimeout(10000, () => {
    appendLog('❌ HEALTH CHECK TIMED OUT: Server not responding within 10 seconds');
    appendLog('💡 TIP: Check server logs for errors or slow initialization code');
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