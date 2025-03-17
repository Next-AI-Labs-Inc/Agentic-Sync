const { spawn } = require('child_process');
const { writeFileSync } = require('fs');
const path = require('path');

// Configuration
const LOG_FILE = path.join(__dirname, '..', '.app-verification.log');
console.log('🧪 Running comprehensive app verification...');
console.log(`📋 Logs will be saved to: ${LOG_FILE}`);

// Start a clean log file
writeFileSync(LOG_FILE, `App verification started at ${new Date().toISOString()}\n`, 'utf8');

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

// Function to run a verification script
async function runVerification(scriptName) {
  return new Promise((resolve) => {
    appendLog(`\n=== Running ${scriptName} ===\n`);
    
    const verification = spawn('node', [`scripts/${scriptName}.js`], { 
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '1' }
    });
    
    verification.stdout.on('data', (data) => {
      const output = data.toString();
      appendLog(output.trim());
    });
    
    verification.stderr.on('data', (data) => {
      const output = data.toString();
      appendLog(`[stderr] ${output.trim()}`);
    });
    
    verification.on('exit', (code) => {
      if (code === 0) {
        appendLog(`✅ ${scriptName} passed!`);
        resolve(true);
      } else {
        appendLog(`❌ ${scriptName} failed with code ${code}`);
        resolve(false);
      }
    });
  });
}

// Main verification function
async function runAllVerifications() {
  appendLog('Starting verification process...');
  
  // Run both verifications
  const buildResult = await runVerification('verify-app-build');
  const startupResult = await runVerification('verify-app-startup');
  
  // Determine overall result
  if (buildResult && startupResult) {
    appendLog('\n✅ ALL VERIFICATIONS PASSED! Your app is working correctly.');
    process.exit(0);
  } else {
    appendLog('\n❌ VERIFICATION FAILED! Your app has issues that need to be fixed.');
    if (!buildResult) appendLog('- Build verification failed. Check .app-build-test.log for details.');
    if (!startupResult) appendLog('- Startup verification failed. Check .app-startup-test.log for details.');
    process.exit(1);
  }
}

// Run all verifications
runAllVerifications().catch(err => {
  appendLog(`Error during verification: ${err.message}`);
  process.exit(1);
});