#!/usr/bin/env node

/**
 * Memory Health Check Script
 * 
 * This script provides a detailed analysis of system memory health with color-coded output.
 * It can be used by both humans and AI agents to diagnose memory-related issues.
 * 
 * Usage:
 * - node check-memory-health.js           # Standard output with color
 * - node check-memory-health.js --json    # JSON output for programmatic use
 * - node check-memory-health.js --simple  # Simplified output without color
 * 
 * Output:
 * - Overall memory health assessment
 * - Detailed metrics with status indicators
 * - Node.js process memory usage
 * - Recommendations based on analysis
 */

const { execSync } = require('child_process');
const os = require('os');

// Parse command line arguments
const args = process.argv.slice(2);
const outputJson = args.includes('--json');
const simpleOutput = args.includes('--simple');

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
  excellent: simpleOutput ? 'EXCELLENT' : `${colors.green}EXCELLENT${colors.reset}`,
  good: simpleOutput ? 'GOOD' : `${colors.cyan}GOOD${colors.reset}`,
  fair: simpleOutput ? 'FAIR' : `${colors.blue}FAIR${colors.reset}`,
  warning: simpleOutput ? 'WARNING' : `${colors.yellow}WARNING${colors.reset}`,
  critical: simpleOutput ? 'CRITICAL' : `${colors.red}CRITICAL${colors.reset}`
};

// Function to get status based on percentage ranges
function getStatusByPercent(percent, { excellentMax = 40, goodMax = 60, fairMax = 80, warningMax = 90 } = {}) {
  if (percent <= excellentMax) return { status: status.excellent, level: 'excellent' };
  if (percent <= goodMax) return { status: status.good, level: 'good' };
  if (percent <= fairMax) return { status: status.fair, level: 'fair' };
  if (percent <= warningMax) return { status: status.warning, level: 'warning' };
  return { status: status.critical, level: 'critical' };
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
  const statusResult = getStatusByPercent(percent, ranges);
  
  if (!outputJson) {
    const bold = simpleOutput ? '' : colors.bold;
    const reset = simpleOutput ? '' : colors.reset;
    console.log(`${bold}${name}:${reset} ${value} (${formatPercent(percent)}) ${statusResult.status}`);
  }
  
  return {
    name,
    value,
    percent: parseFloat(percent.toFixed(1)),
    status: statusResult.level
  };
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
    if (!outputJson) {
      console.error('Error getting Node.js processes:', error.message);
    }
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
    if (!outputJson) {
      console.error('Error analyzing memory:', error.message);
    }
    return null;
  }
}

// Format Node.js process info with status
function formatNodeProcessInfo(proc) {
  const memMultiplier = 25; // Adjust the multiplier to make the percentage more sensitive
  const statusResult = getStatusByPercent(proc.memPercent * memMultiplier, {
    excellentMax: 5, goodMax: 10, fairMax: 20, warningMax: 40
  });
  
  const result = {
    pid: proc.pid,
    command: proc.command,
    memory: formatBytes(proc.rss),
    memoryBytes: proc.rss,
    percentOfRam: parseFloat(proc.memPercent.toFixed(2)),
    status: statusResult.level
  };
  
  if (!outputJson) {
    const processLine = `${proc.pid.padEnd(7)} | ${formatBytes(proc.rss).padEnd(18)} | ${proc.memPercent.toFixed(2).padStart(8)}% | ${statusResult.status}`;
    console.log(processLine);
  }
  
  return result;
}

// Main function to run the health check
function runMemoryHealthCheck() {
  // Results object for JSON output
  const results = {
    timestamp: new Date().toISOString(),
    system: os.type() + ' ' + os.release(),
    metrics: [],
    nodeProcesses: [],
    thresholds: {
      memory: {
        excellent: '<30% used - Optimal performance',
        good: '30-50% used - Very good performance',
        fair: '50-70% used - Good performance',
        warning: '70-85% used - Potential for slowdowns',
        critical: '>85% used - Performance degradation likely'
      },
      nodeProcess: {
        excellent: '<0.2% of RAM - Minimal usage',
        good: '0.2-0.4% of RAM - Normal usage',
        fair: '0.4-0.8% of RAM - Moderate usage',
        warning: '0.8-1.6% of RAM - High usage',
        critical: '>1.6% of RAM - Excessive usage'
      }
    },
    overall: {}
  };
  
  if (!outputJson) {
    const header = simpleOutput ? 
      '======= SYSTEM MEMORY HEALTH CHECK =======' :
      `${colors.bold}${colors.magenta}======= SYSTEM MEMORY HEALTH CHECK =======${colors.reset}`;
    console.log(header + '\n');
  }
  
  // Get memory information
  const memInfo = analyzeMacMemory();
  
  if (!memInfo) {
    const errorMsg = 'Failed to analyze memory information.';
    if (!outputJson) {
      console.error(errorMsg);
    }
    results.error = errorMsg;
    if (outputJson) {
      console.log(JSON.stringify(results, null, 2));
    }
    return;
  }
  
  // Display system memory statistics
  if (!outputJson) {
    const sectionHeader = simpleOutput ? 
      'System Memory (RAM):' :
      `${colors.bold}${colors.cyan}System Memory (RAM):${colors.reset}`;
    console.log(sectionHeader);
    
    const totalMemHeader = simpleOutput ? 'Total Memory:' : `${colors.bold}Total Memory:${colors.reset}`;
    console.log(`${totalMemHeader} ${formatBytes(memInfo.totalMem)}`);
  }
  
  // Add total memory to results
  results.totalMemory = {
    bytes: memInfo.totalMem,
    formatted: formatBytes(memInfo.totalMem)
  };
  
  // Display used memory with status
  const usedMemMetric = displayMetric(
    'Used Memory',
    `${formatBytes(memInfo.usedMem)} of ${formatBytes(memInfo.totalMem)}`,
    memInfo.usedMemPercent,
    { excellentMax: 30, goodMax: 50, fairMax: 70, warningMax: 85 }
  );
  results.metrics.push(usedMemMetric);
  
  // Display unused memory with status
  const freeMemMetric = displayMetric(
    'Free Memory',
    formatBytes(memInfo.unusedMem),
    100 - memInfo.usedMemPercent,
    { excellentMax: 30, goodMax: 50, fairMax: 70, warningMax: 85 }
  );
  results.metrics.push(freeMemMetric);
  
  // Display memory compression with status (lower is better)
  const compressionMetric = displayMetric(
    'Memory Compression',
    formatBytes(memInfo.compressorMem),
    memInfo.compressorPercent,
    { excellentMax: 5, goodMax: 10, fairMax: 15, warningMax: 20 }
  );
  results.metrics.push(compressionMetric);
  
  // Display system memory pressure thresholds
  if (!outputJson) {
    const thresholdHeader = simpleOutput ? 
      '\nMemory Usage Thresholds:' :
      `\n${colors.bold}Memory Usage Thresholds:${colors.reset}`;
    console.log(thresholdHeader);
    
    console.log(`${status.excellent}: <30% used - Optimal performance`);
    console.log(`${status.good}: 30-50% used - Very good performance`);
    console.log(`${status.fair}: 50-70% used - Good performance`);
    console.log(`${status.warning}: 70-85% used - Potential for slowdowns`);
    console.log(`${status.critical}: >85% used - Performance degradation likely`);
  }
  
  // Get Node.js processes
  const nodeProcesses = getNodeProcesses();
  
  // Display Node.js process information
  if (!outputJson) {
    const processHeader = simpleOutput ? 
      '\nNode.js Processes (Top 5 by memory usage):' :
      `\n${colors.bold}${colors.cyan}Node.js Processes (Top 5 by memory usage):${colors.reset}`;
    console.log(processHeader);
  }
  
  if (nodeProcesses.length === 0) {
    if (!outputJson) {
      console.log('No Node.js processes found.');
    }
  } else {
    // Table header for non-JSON output
    if (!outputJson) {
      const tableHeader = simpleOutput ? 
        'PID    | Memory Usage       | % of RAM  | Status' :
        `${colors.bold}PID    | Memory Usage       | % of RAM  | Status${colors.reset}`;
      console.log(tableHeader);
      console.log(`-------+-------------------+----------+--------`);
    }
    
    // Display each process
    nodeProcesses.slice(0, 5).forEach(proc => {
      const procInfo = formatNodeProcessInfo(proc);
      results.nodeProcesses.push(procInfo);
    });
    
    // Process thresholds explanation
    if (!outputJson) {
      const thresholdHeader = simpleOutput ? 
        '\nNode.js Process Thresholds:' :
        `\n${colors.bold}Node.js Process Thresholds:${colors.reset}`;
      console.log(thresholdHeader);
      
      console.log(`${status.excellent}: <0.2% of RAM - Minimal usage`);
      console.log(`${status.good}: 0.2-0.4% of RAM - Normal usage`);
      console.log(`${status.fair}: 0.4-0.8% of RAM - Moderate usage`);
      console.log(`${status.warning}: 0.8-1.6% of RAM - High usage`);
      console.log(`${status.critical}: >1.6% of RAM - Excessive usage`);
    }
  }
  
  // Determine overall memory health
  let overallStatus;
  let overallLevel;
  let recommendation;
  
  if (memInfo.usedMemPercent > 85 || memInfo.compressorPercent > 20) {
    overallStatus = status.critical;
    overallLevel = 'critical';
    recommendation = 'Your system memory is critically low. Close applications and consider restarting your computer.';
  } else if (memInfo.usedMemPercent > 70 || memInfo.compressorPercent > 15) {
    overallStatus = status.warning;
    overallLevel = 'warning';
    recommendation = 'Your system memory is under pressure. Consider closing applications or restarting memory-intensive services.';
  } else if (memInfo.usedMemPercent > 50 || memInfo.compressorPercent > 10) {
    overallStatus = status.fair;
    overallLevel = 'fair';
    recommendation = 'Your system memory is in good condition, but consider closing unused applications.';
  } else if (memInfo.usedMemPercent > 30 || memInfo.compressorPercent > 5) {
    overallStatus = status.good;
    overallLevel = 'good';
    recommendation = 'Your system memory is in excellent condition. No action needed.';
  } else {
    overallStatus = status.excellent;
    overallLevel = 'excellent';
    recommendation = 'Your system memory is in excellent condition. No action needed.';
  }
  
  // Add overall assessment to results
  results.overall = {
    status: overallLevel,
    recommendation
  };
  
  // Display overall assessment
  if (!outputJson) {
    const overallHeader = simpleOutput ? 
      '\nOverall Memory Health:' :
      `\n${colors.bold}${colors.magenta}Overall Memory Health:${colors.reset}`;
    console.log(`${overallHeader} ${overallStatus}`);
    console.log(recommendation);
  }
  
  // Output JSON if requested
  if (outputJson) {
    console.log(JSON.stringify(results, null, 2));
  }
  
  return results;
}

// Run the health check
runMemoryHealthCheck();