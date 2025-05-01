/**
 * Script to verify that Tauri production build and dev build can run concurrently
 * without port conflicts
 */
const { spawn } = require('child_process');
const { writeFileSync } = require('fs');
const http = require('http');
const path = require('path');

// Configuration
const TAURI_DEV_PORT = 3020; // Default port for Tauri dev
const TAURI_PROD_PORT = 3030; // Suggested port for Tauri prod test
const PROD_APP_NAME = 'IX Agent Sync';
const VERIFICATION_TIMEOUT = 60000; // 60 seconds max for full verification
const LOG_FILE = path.join(__dirname, '..', '.app-concurrent-test.log');

// ANSI color codes for colorful console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}🧪 Verifying concurrent Tauri builds...${colors.reset}`);
console.log(`${colors.blue}📋 Logs will be saved to: ${LOG_FILE}${colors.reset}`);

// Start a clean log file
writeFileSync(LOG_FILE, `Concurrent builds verification started at ${new Date().toISOString()}\n`, 'utf8');

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

// Function to check if a port is in use
const checkPort = (port) => {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(port, () => {
      server.close(() => resolve(false)); // Port is free
    });
    server.on('error', () => resolve(true)); // Port is in use
  });
};

// Function to check if URL responds
const checkUrl = (url, timeout = 5000) => {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    
    req.on('error', () => resolve(false));
    req.setTimeout(timeout, () => {
      req.destroy();
      resolve(false);
    });
  });
};

// Main verification function
async function verifyTauriConcurrentBuilds() {
  let tauriDevProcess = null;
  let tauriProdProcess = null;
  let devPortInUse = false;
  let prodPortInUse = false;
  let devServerResponding = false;
  let prodServerResponding = false;
  let timeoutId;
  let success = false;

  try {
    appendLog(`${colors.blue}Checking if ports are already in use...${colors.reset}`);
    devPortInUse = await checkPort(TAURI_DEV_PORT);
    prodPortInUse = await checkPort(TAURI_PROD_PORT);
    
    if (devPortInUse) {
      appendLog(`${colors.yellow}Warning: Port ${TAURI_DEV_PORT} is already in use${colors.reset}`);
    }
    
    if (prodPortInUse) {
      appendLog(`${colors.yellow}Warning: Port ${TAURI_PROD_PORT} is already in use${colors.reset}`);
    }
    
    // Set timeout for the whole verification process
    timeoutId = setTimeout(() => {
      appendLog(`${colors.red}❌ TIMEOUT ERROR: Verification timed out after ${VERIFICATION_TIMEOUT/1000} seconds${colors.reset}`);
      appendLog(`${colors.yellow}The servers did not start and respond within the expected time frame.${colors.reset}`);
      appendLog(`${colors.yellow}This likely indicates one of the following issues:${colors.reset}`);
      appendLog(`${colors.yellow}1. System resource constraints (CPU/memory)${colors.reset}`);
      appendLog(`${colors.yellow}2. Network port conflicts with existing processes${colors.reset}`);
      appendLog(`${colors.yellow}3. Build or compilation errors blocking server startup${colors.reset}`);
      appendLog(`${colors.yellow}4. Slow disk I/O affecting application startup time${colors.reset}`);
      
      // Check which servers were running at time of timeout
      const devStatus = devServerResponding ? "responding" : "not responding";
      const prodStatus = prodServerResponding ? "responding" : "not responding";
      appendLog(`${colors.cyan}Current server status at timeout:${colors.reset}`);
      appendLog(`${colors.cyan}- Development server (port ${TAURI_DEV_PORT}): ${devStatus}${colors.reset}`);
      appendLog(`${colors.cyan}- Production server (port ${TAURI_PROD_PORT}): ${prodStatus}${colors.reset}`);
      
      appendLog(`${colors.cyan}RECOMMENDED ACTIONS:${colors.reset}`);
      appendLog(`${colors.cyan}• Run each server individually to isolate the problem${colors.reset}`);
      appendLog(`${colors.cyan}• Check for processes already using ports ${TAURI_DEV_PORT} and ${TAURI_PROD_PORT}${colors.reset}`);
      appendLog(`${colors.cyan}• Verify build succeeds with "npm run build"${colors.reset}`);
      appendLog(`${colors.cyan}• Monitor system resources during startup${colors.reset}`);
      cleanup(1);
    }, VERIFICATION_TIMEOUT);
    
    // 1. Start a production Next.js server on a different port
    appendLog(`${colors.green}Starting production Next.js server on port ${TAURI_PROD_PORT}...${colors.reset}`);
    const prodNextBin = path.join(__dirname, '..', 'node_modules', '.bin', 'next');
    tauriProdProcess = spawn(prodNextBin, ['start', '-p', TAURI_PROD_PORT], {
      env: { ...process.env, NEXT_PUBLIC_AUTH_OVERRIDE: 'true' },
      stdio: ['ignore', 'pipe', 'pipe'] 
    });
    
    // Create event listeners for prod process
    let prodServerStarted = false;
    tauriProdProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      appendLog(`[PROD] ${output}`);
      
      // Check if server is ready (looking for the Ready message)
      if (output.includes('Ready') || (output.includes('ready') && !prodServerStarted)) {
        appendLog(`${colors.green}✅ Production server started successfully on port ${TAURI_PROD_PORT}${colors.reset}`);
        prodServerStarted = true;
        
        // Start the dev server after prod is confirmed running
        startDevServer();
      }
    });
    
    tauriProdProcess.stderr.on('data', (data) => {
      const output = data.toString().trim();
      appendLog(`[PROD ERR] ${output}`);
    });
    
    tauriProdProcess.on('error', (err) => {
      appendLog(`${colors.red}❌ Failed to start production server: ${err.message}${colors.reset}`);
      cleanup(1);
    });
    
    tauriProdProcess.on('exit', (code) => {
      if (code !== null && code !== 0) {
        appendLog(`${colors.red}❌ Production server exited with code ${code}${colors.reset}`);
        cleanup(1);
      }
    });
    
    function startDevServer() {
      // 2. Start the Tauri dev server
      appendLog(`${colors.blue}Starting Tauri dev server on port ${TAURI_DEV_PORT}...${colors.reset}`);
      const devNextBin = path.join(__dirname, '..', 'node_modules', '.bin', 'next');
      tauriDevProcess = spawn(devNextBin, ['dev', '-p', TAURI_DEV_PORT], {
        env: { ...process.env, NEXT_PUBLIC_AUTH_OVERRIDE: 'true' },
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      // Create event listeners for dev process
      let devServerStarted = false;
      tauriDevProcess.stdout.on('data', async (data) => {
        const output = data.toString().trim();
        appendLog(`[DEV] ${output}`);
        
        // Check if server is ready (looking for the Ready message)
        if ((output.includes('Ready') || output.includes('ready')) && !devServerStarted) {
          appendLog(`${colors.green}✅ Dev server started successfully on port ${TAURI_DEV_PORT}${colors.reset}`);
          devServerStarted = true;
          
          // Wait a moment and then check both servers
          setTimeout(verifyBothServers, 3000);
        }
      });
      
      tauriDevProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        appendLog(`[DEV ERR] ${output}`);
      });
      
      tauriDevProcess.on('error', (err) => {
        appendLog(`${colors.red}❌ Failed to start dev server: ${err.message}${colors.reset}`);
        cleanup(1);
      });
      
      tauriDevProcess.on('exit', (code) => {
        if (code !== null && code !== 0) {
          appendLog(`${colors.red}❌ Dev server exited with code ${code}${colors.reset}`);
          cleanup(1);
        }
      });
    }
    
    async function verifyBothServers() {
      // 3. Verify both servers are responding
      appendLog(`${colors.cyan}Verifying both servers are responding...${colors.reset}`);
      
      devServerResponding = await checkUrl(`http://localhost:${TAURI_DEV_PORT}`);
      prodServerResponding = await checkUrl(`http://localhost:${TAURI_PROD_PORT}`);
      
      if (devServerResponding) {
        appendLog(`${colors.green}✅ Dev server is responding correctly${colors.reset}`);
      } else {
        appendLog(`${colors.red}❌ Dev server is not responding${colors.reset}`);
      }
      
      if (prodServerResponding) {
        appendLog(`${colors.green}✅ Production server is responding correctly${colors.reset}`);
      } else {
        appendLog(`${colors.red}❌ Production server is not responding${colors.reset}`);
      }
      
      // Verification result
      if (devServerResponding && prodServerResponding) {
        appendLog(`${colors.green}✅ VERIFICATION PASSED: Both servers can run concurrently!${colors.reset}`);
        appendLog(`${colors.green}✅ Dev server running on: http://localhost:${TAURI_DEV_PORT}${colors.reset}`);
        appendLog(`${colors.green}✅ Production server running on: http://localhost:${TAURI_PROD_PORT}${colors.reset}`);
        success = true;
      } else {
        appendLog(`${colors.red}❌ VERIFICATION FAILED: Servers cannot run concurrently${colors.reset}`);
        success = false;
      }
      
      // Cleanup after verification
      cleanup(success ? 0 : 1);
    }
  } catch (err) {
    appendLog(`${colors.red}❌ Unexpected error: ${err.message}${colors.reset}`);
    cleanup(1);
  }
  
  // Cleanup function
  function cleanup(exitCode = 0) {
    appendLog(`${colors.cyan}Cleaning up processes...${colors.reset}`);
    clearTimeout(timeoutId);
    
    if (tauriProdProcess) {
      try {
        tauriProdProcess.kill('SIGTERM');
        appendLog(`${colors.cyan}Terminated production server${colors.reset}`);
      } catch (err) {
        appendLog(`${colors.yellow}Error killing production server: ${err.message}${colors.reset}`);
      }
    }
    
    if (tauriDevProcess) {
      try {
        tauriDevProcess.kill('SIGTERM');
        appendLog(`${colors.cyan}Terminated dev server${colors.reset}`);
      } catch (err) {
        appendLog(`${colors.yellow}Error killing dev server: ${err.message}${colors.reset}`);
      }
    }
    
    // Log final result with detailed information
    if (success) {
      appendLog(`${colors.green}✅ VERIFICATION COMPLETE: Tauri production and dev builds can run concurrently${colors.reset}`);
      appendLog(`${colors.green}✓ Development server confirmed working on port ${TAURI_DEV_PORT}${colors.reset}`);
      appendLog(`${colors.green}✓ Production server confirmed working on port ${TAURI_PROD_PORT}${colors.reset}`);
      appendLog(`${colors.green}✓ Both servers run simultaneously without conflicts${colors.reset}`);
    } else {
      // Create a detailed failure report
      appendLog(`${colors.red}❌ VERIFICATION FAILED: Servers could not run concurrently${colors.reset}`);
      
      // Determine specific failure mode
      if (!devServerResponding && !prodServerResponding) {
        appendLog(`${colors.red}FAILURE DETAILS: Both development and production servers failed to respond${colors.reset}`);
        appendLog(`${colors.yellow}This indicates a serious system-wide issue preventing server startup.${colors.reset}`);
      } else if (!devServerResponding) {
        appendLog(`${colors.red}FAILURE DETAILS: Development server (port ${TAURI_DEV_PORT}) failed to respond${colors.reset}`);
        appendLog(`${colors.yellow}The production server was working, but the dev server failed.${colors.reset}`);
      } else if (!prodServerResponding) {
        appendLog(`${colors.red}FAILURE DETAILS: Production server (port ${TAURI_PROD_PORT}) failed to respond${colors.reset}`);
        appendLog(`${colors.yellow}The development server was working, but the production server failed.${colors.reset}`);
      }
      
      // Provide actionable next steps
      appendLog(`${colors.cyan}RECOMMENDED DIAGNOSTICS:${colors.reset}`);
      appendLog(`${colors.cyan}1. Check system resources (CPU/memory) during server startup${colors.reset}`);
      appendLog(`${colors.cyan}2. Verify network port availability with "lsof -i :${TAURI_DEV_PORT}" and "lsof -i :${TAURI_PROD_PORT}"${colors.reset}`);
      appendLog(`${colors.cyan}3. Test servers individually:${colors.reset}`);
      appendLog(`${colors.cyan}   - npm run dev (for development server)${colors.reset}`);
      appendLog(`${colors.cyan}   - npm run build && npm run start (for production server)${colors.reset}`);
      appendLog(`${colors.cyan}4. Check for errors in server logs or browser console${colors.reset}`);
    }
    
    process.exit(exitCode);
  }
}

// Handle signal interrupts
process.on('SIGINT', () => {
  appendLog('Received SIGINT signal');
  process.exit(1);
});

process.on('SIGTERM', () => {
  appendLog('Received SIGTERM signal');
  process.exit(1);
});

// Run the verification
verifyTauriConcurrentBuilds();