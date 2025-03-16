/**
 * Combined script to start both the API server and Next.js frontend
 * This allows you to run both servers with a single command
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

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

// Configuration
const API_SERVER_DIR = path.resolve(process.env.IX_API_PATH || '../../ixcoach-api');
const API_PORT = process.env.API_PORT || 3002;
const FRONTEND_PORT = 3045;
const USE_OPTIMIZED_MODE = process.env.OPTIMIZE || 'true';

// Check if API directory exists
if (!fs.existsSync(API_SERVER_DIR)) {
  console.error(`${colors.red}Error: API directory not found at ${API_SERVER_DIR}${colors.reset}`);
  console.error(`${colors.yellow}Set the IX_API_PATH environment variable to point to your API directory${colors.reset}`);
  process.exit(1);
}

console.log(`
${colors.cyan}╔════════════════════════════════════════════════════╗
║                IX Tasks Combined Starter               ║
╚════════════════════════════════════════════════════╝${colors.reset}

${colors.green}Starting both API server and Next.js frontend...${colors.reset}

API Server: ${colors.yellow}${API_SERVER_DIR}${colors.reset} (Port: ${colors.magenta}${API_PORT}${colors.reset})
Frontend: ${colors.yellow}${path.resolve(__dirname, '..')}${colors.reset} (Port: ${colors.magenta}${FRONTEND_PORT}${colors.reset})
Optimized Mode: ${colors.cyan}${USE_OPTIMIZED_MODE === 'true' ? 'ENABLED' : 'DISABLED'}${colors.reset}
`);

// Function to start a process with colorized output
function startProcess(name, command, args, color, cwd) {
  console.log(`${color}Starting ${name}...${colors.reset}`);
  
  const proc = spawn(command, args, { 
    cwd: cwd || process.cwd(),
    shell: true,
    env: { ...process.env }
  });
  
  proc.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.log(`${color}[${name}]${colors.reset} ${line}`);
      }
    }
  });
  
  proc.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        // Don't color webpack compilation warnings/errors since they have their own colors
        if (line.includes('webpack.js') || line.includes('error') || line.includes('warning')) {
          console.error(`[${name}] ${line}`);
        } else {
          console.error(`${color}[${name}]${colors.reset} ${line}`);
        }
      }
    }
  });
  
  proc.on('close', (code) => {
    console.log(`${color}${name} process exited with code ${code}${colors.reset}`);
    if (code !== 0) {
      console.log(`${colors.red}${name} failed to start. See errors above.${colors.reset}`);
    }
  });
  
  return proc;
}

// Start API server
const apiServer = startProcess(
  'API Server', 
  'npm', 
  ['run', 'dev'], 
  colors.green,
  API_SERVER_DIR
);

// Wait a bit for API server to start
setTimeout(() => {
  // Start Next.js frontend (optimized if requested)
  const nextCommand = USE_OPTIMIZED_MODE === 'true' ? 'dev:optimized' : 'dev';
  const frontendServer = startProcess(
    'Next.js Frontend', 
    'npm', 
    ['run', nextCommand], 
    colors.blue
  );
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}Shutting down all processes...${colors.reset}`);
    apiServer.kill();
    frontendServer.kill();
    process.exit(0);
  });
}, 2000);

console.log(`${colors.cyan}Press Ctrl+C to stop all servers${colors.reset}`);