#!/usr/bin/env node

/**
 * Memory Health Test Script
 * 
 * This script analyzes system memory usage and provides color-coded output
 * showing the health status of different memory metrics.
 */

const { execSync } = require('child_process');
const os = require('os');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

// Status indicators
const status = {
  excellent: `${colors.green}EXCELLENT${colors.reset}`,
  good: `${colors.cyan}GOOD${colors.reset}`,
  fair: `${colors.blue}FAIR${colors.reset}`,
  warning: `${colors.yellow}WARNING${colors.reset}`,
  critical: `${colors.red}CRITICAL${colors.reset}`
};

// Function to get status based on percentage ranges
function getStatusByPercent(percent, { excellentMax = 40, goodMax = 60, fairMax = 80, warningMax = 90 } = {}) {
  if (percent <= excellentMax) return status.excellent;
  if (percent <= goodMax) return status.good;
  if (percent <= fairMax) return status.fair;
  if (percent <= warningMax) return status.warning;
  return status.critical;
}

// Function to format bytes in human-readable format
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

// Function to format percentage
function formatPercent(percent) {
  return `${percent.toFixed(1)}%`;
}

// Function to display a metric with color-coded status
function displayMetric(name, value, percent, ranges) {
  const statusIndicator = getStatusByPercent(percent, ranges);
  console.log(`${colors.bold}${name}:${colors.reset} ${value} (${formatPercent(percent)}) ${statusIndicator}`);
}

// Function to execute a command and return the output
function exec(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
}

// Get Node.js processes
function getNodeProcesses() {
  try {
    // Use ps command to get memory usage of Node.js processes
    const processData = exec('ps -eo pid,comm,rss,%mem | grep node | sort -nrk 3 | head -10');
    
    if (!processData) return [];
    
    return processData.split('\n')
      .map(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4 && parts[1].includes('node')) {
          return {
            pid: parts[0],
            command: parts[1],
            rss: parseInt(parts[2], 10) * 1024, // Convert KB to bytes
            memPercent: parseFloat(parts[3])
          };
        }
        return null;
      })
      .filter(Boolean);
  } catch (error) {
    console.error('Error getting Node.js processes:', error.message);
    return [];
  }
}

// Function to analyze system memory (macOS specific since we're on MacOS)
function analyzeMacMemory() {
  try {
    // Parse macOS memory information
    const physMemInfo = exec('top -l 1 | grep PhysMem');
    
    if (!physMemInfo) {
      throw new Error('Could not get PhysMem information');
    }
    
    // Parse physical memory info
    // Format example: "PhysMem: 16G used (7278M wired, 1450M compressor), 16G unused."
    const memMatch = physMemInfo.match(/PhysMem: (\d+)([KMGT]) used.*?(\d+)([KMGT]) unused/i);
    const compressorMatch = physMemInfo.match(/(\d+)([KMGT]) compressor/i);
    
    if (!memMatch) {
      throw new Error('Could not parse memory information');
    }
    
    // Parse values with unit conversion
    const unitMultiplier = {
      'K': 1024,
      'M': 1024 * 1024,
      'G': 1024 * 1024 * 1024,
      'T': 1024 * 1024 * 1024 * 1024
    };
    
    const usedMemBytes = parseInt(memMatch[1], 10) * unitMultiplier[memMatch[2]];
    const unusedMemBytes = parseInt(memMatch[3], 10) * unitMultiplier[memMatch[4]];
    const totalMemBytes = usedMemBytes + unusedMemBytes;
    
    let compressorBytes = 0;
    if (compressorMatch) {
      compressorBytes = parseInt(compressorMatch[1], 10) * unitMultiplier[compressorMatch[2]];
    }
    
    const usedMemPercent = (usedMemBytes / totalMemBytes) * 100;
    const compressorPercent = (compressorBytes / totalMemBytes) * 100;
    
    return {
      totalMem: totalMemBytes,
      usedMem: usedMemBytes,
      unusedMem: unusedMemBytes,
      compressorMem: compressorBytes,
      usedMemPercent,
      compressorPercent
    };
  } catch (error) {
    console.error('Error analyzing memory:', error.message);
    return null;
  }
}

// Main function to run the health check
function runMemoryHealthCheck() {
  console.log(`${colors.bold}${colors.magenta}======= SYSTEM MEMORY HEALTH CHECK =======${colors.reset}\n`);
  
  // Get memory information
  const memInfo = analyzeMacMemory();
  
  if (!memInfo) {
    console.error('Failed to analyze memory information.');
    return;
  }
  
  // Display system memory statistics
  console.log(`${colors.bold}${colors.cyan}System Memory (RAM):${colors.reset}`);
  console.log(`${colors.bold}Total Memory:${colors.reset} ${formatBytes(memInfo.totalMem)}`);
  
  // Display used memory with status
  displayMetric(
    'Used Memory',
    `${formatBytes(memInfo.usedMem)} of ${formatBytes(memInfo.totalMem)}`,
    memInfo.usedMemPercent,
    { excellentMax: 30, goodMax: 50, fairMax: 70, warningMax: 85 }
  );
  
  // Display unused memory with status
  displayMetric(
    'Free Memory',
    formatBytes(memInfo.unusedMem),
    100 - memInfo.usedMemPercent,
    { excellentMax: 30, goodMax: 50, fairMax: 70, warningMax: 85 }
  );
  
  // Display memory compression with status (lower is better)
  displayMetric(
    'Memory Compression',
    formatBytes(memInfo.compressorMem),
    memInfo.compressorPercent,
    { excellentMax: 5, goodMax: 10, fairMax: 15, warningMax: 20 }
  );
  
  // Display system memory pressure thresholds
  console.log(`\n${colors.bold}Memory Usage Thresholds:${colors.reset}`);
  console.log(`${status.excellent}: <30% used - Optimal performance`);
  console.log(`${status.good}: 30-50% used - Very good performance`);
  console.log(`${status.fair}: 50-70% used - Good performance`);
  console.log(`${status.warning}: 70-85% used - Potential for slowdowns`);
  console.log(`${status.critical}: >85% used - Performance degradation likely`);
  
  // Get Node.js processes
  const nodeProcesses = getNodeProcesses();
  
  // Display Node.js process information
  console.log(`\n${colors.bold}${colors.cyan}Node.js Processes (Top 5 by memory usage):${colors.reset}`);
  
  if (nodeProcesses.length === 0) {
    console.log('No Node.js processes found.');
  } else {
    // Table header
    console.log(`${colors.bold}PID    | Memory Usage       | % of RAM  | Status${colors.reset}`);
    console.log(`-------+-------------------+----------+--------`);
    
    // Display each process
    nodeProcesses.slice(0, 5).forEach(proc => {
      const memStatus = getStatusByPercent(proc.memPercent * 25, {
        excellentMax: 5, goodMax: 10, fairMax: 20, warningMax: 40
      });
      
      console.log(
        `${proc.pid.padEnd(7)} | ${formatBytes(proc.rss).padEnd(18)} | ${proc.memPercent.toFixed(2).padStart(8)}% | ${memStatus}`
      );
    });
    
    console.log(`\n${colors.bold}Node.js Process Thresholds:${colors.reset}`);
    console.log(`${status.excellent}: <0.2% of RAM - Minimal usage`);
    console.log(`${status.good}: 0.2-0.4% of RAM - Normal usage`);
    console.log(`${status.fair}: 0.4-0.8% of RAM - Moderate usage`);
    console.log(`${status.warning}: 0.8-1.6% of RAM - High usage`);
    console.log(`${status.critical}: >1.6% of RAM - Excessive usage`);
  }
  
  // Display overall memory health assessment
  let overallStatus;
  if (memInfo.usedMemPercent > 85 || memInfo.compressorPercent > 20) {
    overallStatus = status.critical;
  } else if (memInfo.usedMemPercent > 70 || memInfo.compressorPercent > 15) {
    overallStatus = status.warning;
  } else if (memInfo.usedMemPercent > 50 || memInfo.compressorPercent > 10) {
    overallStatus = status.fair;
  } else if (memInfo.usedMemPercent > 30 || memInfo.compressorPercent > 5) {
    overallStatus = status.good;
  } else {
    overallStatus = status.excellent;
  }
  
  console.log(`\n${colors.bold}${colors.magenta}Overall Memory Health:${colors.reset} ${overallStatus}`);
  
  if (overallStatus === status.excellent || overallStatus === status.good) {
    console.log(`Your system memory is in excellent condition. No action needed.`);
  } else if (overallStatus === status.fair) {
    console.log(`Your system memory is in good condition, but consider closing unused applications.`);
  } else if (overallStatus === status.warning) {
    console.log(`Your system memory is under pressure. Consider closing applications or restarting memory-intensive services.`);
  } else {
    console.log(`Your system memory is critically low. Close applications and consider restarting your computer.`);
  }
}

// Run the health check
runMemoryHealthCheck();