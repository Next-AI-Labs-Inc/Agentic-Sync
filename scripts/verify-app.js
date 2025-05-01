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
  
  // Print to console
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
  
  // Run all verifications
  const buildResult = await runVerification('verify-app-build');
  const startupResult = await runVerification('verify-app-startup');
  const concurrentResult = await runVerification('verify-app-concurrent');
  
  // Determine overall result
  if (buildResult && startupResult && concurrentResult) {
    appendLog('\n✅ VERIFICATION SUMMARY: ALL TESTS PASSED');
    appendLog('✅ App builds successfully');
    appendLog('✅ App starts and responds to requests');
    appendLog('✅ App handles concurrent operations properly');
    appendLog('\n🎉 Your application is working correctly!');
    process.exit(0);
  } else {
    appendLog('\n❌ VERIFICATION SUMMARY: TESTS FAILED');
    
    if (!buildResult) {
      appendLog('❌ BUILD TEST FAILED');
      appendLog('   The application could not be built correctly.');
      appendLog('   Check .app-build-test.log for detailed error messages.');
      appendLog('   Common issues: Syntax errors, missing dependencies, configuration problems');
    } else {
      appendLog('✅ Build test passed');
    }
    
    if (!startupResult) {
      appendLog('❌ STARTUP TEST FAILED');
      appendLog('   The application failed to start or respond to requests.');
      appendLog('   Check .app-startup-test.log for detailed error messages.');
      appendLog('   Common issues: Runtime errors, port conflicts, server configuration');
    } else {
      appendLog('✅ Startup test passed');
    }
    
    if (!concurrentResult) {
      appendLog('❌ CONCURRENT OPERATIONS TEST FAILED');
      appendLog('   The application failed to run dev and production servers simultaneously.');
      
      // Read the concurrent test log to provide specific details
      try {
        const fs = require('fs');
        const concurrentLog = fs.readFileSync(path.join(__dirname, '..', '.app-concurrent-test.log'), 'utf8');
        
        // Extract specific failure details
        let failureReason = 'Unknown reason';
        let actionableSteps = '';
        
        if (concurrentLog.includes('Dev server is not responding')) {
          failureReason = 'The development server failed to respond to requests';
          actionableSteps = '   • Check if port 3020 is already in use by another application\n' +
                           '   • Try manually running "npm run dev" to see specific errors\n' + 
                           '   • Ensure development dependencies are properly installed';
        } else if (concurrentLog.includes('Production server is not responding')) {
          failureReason = 'The production server failed to respond to requests';
          actionableSteps = '   • Check if port 3030 is already in use by another application\n' +
                           '   • Verify the production build with "npm run build" first\n' + 
                           '   • Check for environment-specific configuration issues';
        } else if (concurrentLog.includes('Verification timed out')) {
          failureReason = 'The verification process timed out after 60 seconds';
          actionableSteps = '   • Check for slow startup issues on your system\n' +
                           '   • Look for resource constraints (CPU/memory)\n' + 
                           '   • Try increasing the timeout in verify-app-concurrent.js';
        } else if (concurrentLog.includes('Failed to start production server')) {
          failureReason = 'Could not start the production server';
          actionableSteps = '   • Check for build errors with "npm run build"\n' +
                           '   • Verify you have the right permissions to start servers\n' + 
                           '   • Check that all necessary environment variables are set';
        } else if (concurrentLog.includes('Failed to start dev server')) {
          failureReason = 'Could not start the development server';
          actionableSteps = '   • Verify your Node.js installation\n' +
                           '   • Try clearing node_modules and reinstalling dependencies\n' + 
                           '   • Check for JavaScript errors in your development code';
        }
        
        appendLog(`   FAILURE DETAILS: ${failureReason}`);
        if (actionableSteps) {
          appendLog('   \n   RECOMMENDED ACTIONS:');
          appendLog(actionableSteps);
        }
        
        // Look for specific error messages in the log
        const errorMatches = concurrentLog.match(/(\[DEV ERR\]|\[PROD ERR\]).*(\n|$)/g);
        if (errorMatches && errorMatches.length > 0) {
          appendLog('   \n   SPECIFIC ERRORS DETECTED:');
          // Show the first 3 error messages (most relevant)
          errorMatches.slice(0, 3).forEach(error => {
            appendLog(`   • ${error.trim()}`);
          });
        }
        
      } catch (err) {
        // If we can't read the log file, give generic but useful advice
        appendLog('   Could not read detailed error log. Common issues include:');
        appendLog('   • Port conflicts - check if ports 3020 and 3030 are already in use');
        appendLog('   • Server startup failures - try running servers individually');
        appendLog('   • Resource limitations - ensure your system has enough memory');
        appendLog('   • Run "node scripts/verify-app-concurrent.js" directly for more details');
      }
    } else {
      appendLog('✅ Concurrent operations test passed');
      appendLog('   ✓ Development server runs correctly on port 3020');
      appendLog('   ✓ Production server runs correctly on port 3030');
      appendLog('   ✓ Both servers operate simultaneously without conflicts');
    }
    
    appendLog('\n📋 Review the logs above and in the log files for specific errors');
    process.exit(1);
  }
}

// Run all verifications
runAllVerifications().catch(err => {
  appendLog(`Error during verification: ${err.message}`);
  process.exit(1);
});