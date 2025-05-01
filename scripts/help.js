#!/usr/bin/env node

/**
 * Interactive script documentation viewer
 * Run with: npm run help
 */

const readline = require('readline');
const { execSync } = require('child_process');

const commands = [
  {
    name: 'dev',
    category: 'Development',
    description: 'Starts Next.js development server on port 3020',
    usage: 'npm run dev',
    details: 'Use this as your primary development command. Features hot-reloading and developer-friendly error messages.',
    when: 'When actively developing locally',
    examples: ['npm run dev']
  },
  {
    name: 'build',
    category: 'Production',
    description: 'Creates optimized production build',
    usage: 'npm run build',
    details: 'Validates and builds all pages and components for production deployment. Use before serving with "npm run prod".',
    when: 'Before deploying to production or testing a production build',
    examples: ['npm run build', 'npm run build && npm run prod']
  },
  {
    name: 'start',
    category: 'Development',
    description: 'Alias for "npm run dev"',
    usage: 'npm start',
    details: 'Starts the development server - identical to "npm run dev".',
    when: 'When you want to use the standard npm command',
    examples: ['npm start']
  },
  {
    name: 'prod',
    category: 'Production',
    description: 'Serves built application on port 3020',
    usage: 'npm run prod',
    details: 'Serves the optimized production build. Requires running "npm run build" first.',
    when: 'When testing the production build locally',
    examples: ['npm run build && npm run prod']
  },
  {
    name: 'lint',
    category: 'Quality',
    description: 'Runs ESLint to check code quality',
    usage: 'npm run lint',
    details: 'Identifies code issues, enforces style guidelines, and catches potential bugs.',
    when: 'Before committing changes or during development to maintain code quality',
    examples: ['npm run lint']
  },
  {
    name: 'test',
    category: 'Testing',
    description: 'Runs all Jest tests once',
    usage: 'npm run test',
    details: 'Executes all test suites to verify application functionality.',
    when: 'Before marking tasks complete or submitting pull requests',
    examples: ['npm run test']
  },
  {
    name: 'test:watch',
    category: 'Testing',
    description: 'Runs tests in watch mode',
    usage: 'npm run test:watch',
    details: 'Continuously runs tests as files change. Perfect for test-driven development.',
    when: 'When actively developing with a TDD approach',
    examples: ['npm run test:watch']
  },
  {
    name: 'test:coverage',
    category: 'Testing',
    description: 'Runs tests with coverage report',
    usage: 'npm run test:coverage',
    details: 'Shows which parts of your code are covered by tests with detailed reporting.',
    when: 'When evaluating test quality or identifying untested code',
    examples: ['npm run test:coverage']
  },
  {
    name: 'migrate-initiatives',
    category: 'Data',
    description: 'Converts initiatives to new format',
    usage: 'npm run migrate-initiatives',
    details: 'Updates initiative data to conform to schema changes.',
    when: 'After making changes to the initiatives data structure',
    examples: ['npm run migrate-initiatives']
  },
  {
    name: 'test:initiatives-api',
    category: 'API',
    description: 'Tests initiatives API functionality',
    usage: 'npm run test:initiatives-api',
    details: 'Validates that the initiatives API is working correctly.',
    when: 'When modifying the initiatives API or related code',
    examples: ['npm run test:initiatives-api']
  },
  {
    name: 'log:initiatives',
    category: 'Data',
    description: 'Prints initiative data to console',
    usage: 'npm run log:initiatives',
    details: 'Displays initiative data for debugging purposes.',
    when: 'When investigating data issues or verifying data structure',
    examples: ['npm run log:initiatives']
  },
  {
    name: 'dev:optimized',
    category: 'Development',
    description: 'Runs optimized dev server on port 3045',
    usage: 'npm run dev:optimized',
    details: 'Development server with production optimizations for performance testing.',
    when: 'When testing production-like performance locally',
    examples: ['npm run dev:optimized']
  },
  {
    name: 'start:all',
    category: 'Environment',
    description: 'Starts all related services',
    usage: 'npm run start:all',
    details: 'Launches the complete testing environment with all required services.',
    when: 'When testing the entire application ecosystem',
    examples: ['npm run start:all']
  },
  {
    name: 'verify-startup',
    category: 'Verification',
    description: 'Confirms app starts correctly',
    usage: 'npm run verify-startup',
    details: 'Part of the CI/CD pipeline that verifies the application can start.',
    when: 'When verifying deployment or environment configuration',
    examples: ['npm run verify-startup']
  },
  {
    name: 'verify-build',
    category: 'Verification',
    description: 'Validates build process succeeds',
    usage: 'npm run verify-build',
    details: 'Part of the CI/CD pipeline that checks the build process.',
    when: 'When validating that production builds will succeed',
    examples: ['npm run verify-build']
  },
  {
    name: 'verify',
    category: 'Verification',
    description: 'Runs all verification checks',
    usage: 'npm run verify',
    details: 'Comprehensive verification of the application functionality.',
    when: 'Before submitting pull requests or deploying',
    examples: ['npm run verify']
  },
  {
    name: 'tauri',
    category: 'Desktop',
    description: 'Base Tauri CLI access',
    usage: 'npm run tauri -- [command]',
    details: 'Provides access to the Tauri CLI for desktop application development.',
    when: 'When working with the desktop application',
    examples: ['npm run tauri -- info']
  },
  {
    name: 'tauri:dev',
    category: 'Desktop',
    description: 'Runs Tauri app in dev mode',
    usage: 'npm run tauri:dev',
    details: 'Develops the desktop application with hot reloading.',
    when: 'When developing the desktop application version',
    examples: ['npm run tauri:dev']
  },
  {
    name: 'tauri:build',
    category: 'Desktop',
    description: 'Creates desktop application binaries',
    usage: 'npm run tauri:build',
    details: 'Builds the installable desktop application for distribution.',
    when: 'When creating a release version of the desktop app',
    examples: ['npm run tauri:build']
  },
  {
    name: 'help',
    category: 'Documentation',
    description: 'Shows this interactive help menu',
    usage: 'npm run help',
    details: 'Displays detailed documentation about available npm scripts.',
    when: 'When you need information about available commands',
    examples: ['npm run help', 'npm run help dev']
  }
];

// Sort commands first by category, then by name
commands.sort((a, b) => {
  if (a.category !== b.category) {
    return a.category.localeCompare(b.category);
  }
  return a.name.localeCompare(b.name);
});

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Color mapping for categories
const categoryColors = {
  'Development': colors.green,
  'Production': colors.yellow,
  'Quality': colors.blue,
  'Testing': colors.cyan,
  'Data': colors.magenta,
  'API': colors.red,
  'Environment': colors.blue,
  'Verification': colors.yellow,
  'Desktop': colors.cyan,
  'Documentation': colors.green
};

// Setup readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get terminal size
const terminalWidth = process.stdout.columns || 80;
const terminalHeight = process.stdout.rows || 24;

// Current navigation state
let currentIndex = 0;
let currentView = 'main'; // 'main', 'details', 'run'
let selectedCommand = null;
let searchQuery = '';

// Settings for display
const categoryWidth = 15;  // Width for the category column
const commandWidth = 20;   // Width for the command name column

// Clear the terminal screen
function clearScreen() {
  process.stdout.write('\x1Bc');
}

// Create a horizontal divider
function divider(char = '─') {
  return char.repeat(terminalWidth);
}

// Create a box around text
function box(text, padding = 1) {
  const lines = text.split('\n');
  const width = Math.max(...lines.map(line => line.length)) + (padding * 2);
  
  let result = '┌' + '─'.repeat(width) + '┐\n';
  
  lines.forEach(line => {
    result += '│' + ' '.repeat(padding) + line + ' '.repeat(width - line.length - padding) + ' '.repeat(padding) + '│\n';
  });
  
  result += '└' + '─'.repeat(width) + '┘';
  return result;
}

// Format text to fit within a certain width
function formatText(text, maxWidth) {
  if (!text) return '';
  
  const words = text.split(' ');
  let result = '';
  let currentLine = '';
  
  words.forEach(word => {
    if ((currentLine + word).length > maxWidth) {
      result += currentLine.trim() + '\n';
      currentLine = '';
    }
    
    currentLine += word + ' ';
  });
  
  if (currentLine.trim().length > 0) {
    result += currentLine.trim();
  }
  
  return result;
}

// Truncate string with ellipsis if longer than maxLength
function truncate(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

// Display all commands with category prefixes in a clean table
function showMainMenu() {
  clearScreen();
  
  console.log(`\n${colors.bright}${colors.cyan}=== IX Tasks Interactive Help Menu ===${colors.reset}\n`);
  console.log(`Navigate with ${colors.yellow}↑/↓${colors.reset} keys, ${colors.yellow}Enter${colors.reset} for details, ${colors.yellow}s${colors.reset} to search, ${colors.yellow}q${colors.reset} to quit\n`);
  
  // Header row
  console.log(`  ${colors.bright}${'CATEGORY'.padEnd(categoryWidth)}${'COMMAND'.padEnd(commandWidth)}DESCRIPTION${colors.reset}`);
  console.log(`  ${divider('-')}`);
  
  // Display all commands in a single list with category prefixes
  commands.forEach((cmd, index) => {
    const isSelected = index === currentIndex;
    const categoryColor = categoryColors[cmd.category] || colors.white;
    
    if (isSelected) {
      // Highlight the selected command with background
      console.log(`  ${colors.bgCyan}${colors.black} ${cmd.category.padEnd(categoryWidth - 1)}${cmd.name.padEnd(commandWidth)} ${cmd.description} ${colors.reset}`);
    } else {
      // Regular command display
      console.log(`  ${categoryColor}${cmd.category.padEnd(categoryWidth - 1)}${colors.reset}${colors.green}${cmd.name.padEnd(commandWidth)}${colors.reset}${truncate(cmd.description, terminalWidth - categoryWidth - commandWidth - 5)}`);
    }
  });
  
  console.log(`\n${colors.dim}Press ${colors.yellow}Enter${colors.reset}${colors.dim} to view detailed information and run the selected command${colors.reset}`);
}

// Display detailed information about a specific command
function showCommandDetails(command) {
  clearScreen();
  
  const headerText = `Command: ${command.name}`;
  const headerPadding = Math.floor((terminalWidth - headerText.length) / 2);
  
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(headerPadding)} ${headerText} ${'='.repeat(headerPadding)}${colors.reset}\n`);
  
  const categoryColor = categoryColors[command.category] || colors.white;
  console.log(`${colors.bright}Category:${colors.reset} ${categoryColor}${command.category}${colors.reset}`);
  console.log(`${colors.bright}Description:${colors.reset} ${command.description}`);
  console.log(`${colors.bright}Usage:${colors.reset} ${colors.yellow}${command.usage}${colors.reset}`);
  
  console.log(`\n${colors.bright}Details:${colors.reset}`);
  console.log(`  ${formatText(command.details, terminalWidth - 4)}`);
  
  console.log(`\n${colors.bright}When to use:${colors.reset}`);
  console.log(`  ${formatText(command.when, terminalWidth - 4)}`);
  
  if (command.examples && command.examples.length > 0) {
    console.log(`\n${colors.bright}Examples:${colors.reset}`);
    command.examples.forEach(example => {
      console.log(`  ${colors.yellow}${example}${colors.reset}`);
    });
  }
  
  console.log(`\n${divider()}`);
  console.log(`${colors.bright}${colors.green}Press ${colors.yellow}Enter${colors.reset}${colors.bright}${colors.green} to run this command${colors.reset}`);
  console.log(`${colors.bright}Press ${colors.yellow}Backspace${colors.reset}${colors.bright} to go back to the main menu${colors.reset}`);
  console.log(`${colors.bright}Press ${colors.yellow}q${colors.reset}${colors.bright} to quit${colors.reset}`);
}

// Show confirmation before running a command
function showRunConfirmation(command) {
  clearScreen();
  
  console.log(`\n${colors.bright}${colors.cyan}=== Execute Command: ${command.name} ===${colors.reset}\n`);
  
  console.log(box(`You are about to execute:\n${colors.yellow}${command.usage}${colors.reset}\n\n${formatText(command.details, terminalWidth - 10)}`));
  
  console.log(`\n${colors.bright}${colors.red}Are you sure you want to run this command?${colors.reset}\n`);
  console.log(`${colors.bright}Press ${colors.yellow}y${colors.reset}${colors.bright} to confirm or any other key to cancel.${colors.reset}\n`);
}

// Execute a command
function executeCommand(command) {
  clearScreen();
  console.log(`\n${colors.bright}${colors.cyan}=== Executing: ${command.name} ===${colors.reset}\n`);
  
  try {
    // Extract the actual command from usage (removing 'npm run' or 'npm')
    let cmd = command.usage;
    if (cmd.startsWith('npm run ')) {
      cmd = cmd.substring(8);
    } else if (cmd.startsWith('npm ')) {
      cmd = cmd.substring(4);
    }
    
    // Some commands have arguments or are complex
    if (cmd.includes(' -- ')) {
      // Handle Tauri with arguments
      console.log(`${colors.yellow}Complex command detected. Please run manually:${colors.reset}`);
      console.log(`  ${colors.green}${command.usage}${colors.reset}\n`);
    } else {
      // Clean up the command (remove any && or multiple commands)
      const cleanCmd = cmd.split(' ')[0]; // Just take the first part before any space
      
      console.log(`${colors.yellow}Running: npm run ${cleanCmd}${colors.reset}\n`);
      console.log(`${colors.dim}Press Ctrl+C to abort${colors.reset}\n`);
      
      rl.close();
      execSync(`npm run ${cleanCmd}`, { stdio: 'inherit' });
      process.exit(0);
    }
  } catch (error) {
    console.error(`\n${colors.red}Error executing command:${colors.reset}\n`, error);
  }
  
  console.log(`\n${colors.dim}Press any key to return to the menu...${colors.reset}`);
}

// Show search interface
function showSearchScreen() {
  clearScreen();
  
  console.log(`\n${colors.bright}${colors.cyan}=== Search Commands ===${colors.reset}\n`);
  console.log(`${colors.yellow}Enter search term:${colors.reset} ${searchQuery}${colors.blink}_${colors.reset}\n`);
  
  if (searchQuery.length > 0) {
    const results = commands.filter(cmd => 
      cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (results.length > 0) {
      console.log(`${colors.bright}Search Results:${colors.reset}\n`);
      
      // Header row
      console.log(`  ${colors.bright}${'CATEGORY'.padEnd(categoryWidth)}${'COMMAND'.padEnd(commandWidth)}DESCRIPTION${colors.reset}`);
      console.log(`  ${divider('-')}`);
      
      results.forEach((cmd, index) => {
        const isSelected = index === currentIndex;
        const categoryColor = categoryColors[cmd.category] || colors.white;
        
        if (isSelected) {
          // Highlight the selected command with background
          console.log(`  ${colors.bgCyan}${colors.black} ${cmd.category.padEnd(categoryWidth - 1)}${cmd.name.padEnd(commandWidth)} ${cmd.description} ${colors.reset}`);
        } else {
          // Regular command display
          console.log(`  ${categoryColor}${cmd.category.padEnd(categoryWidth - 1)}${colors.reset}${colors.green}${cmd.name.padEnd(commandWidth)}${colors.reset}${truncate(cmd.description, terminalWidth - categoryWidth - commandWidth - 5)}`);
        }
      });
    } else {
      console.log(`  ${colors.red}No results found for '${searchQuery}'${colors.reset}`);
    }
  }
  
  console.log(`\n${colors.dim}Press ${colors.yellow}Enter${colors.reset}${colors.dim} to select a command, ${colors.yellow}Backspace${colors.reset}${colors.dim} to delete, or ${colors.yellow}Esc${colors.reset}${colors.dim} to cancel search${colors.reset}`);
}

// Filter commands based on search query
function getSearchResults() {
  if (searchQuery.length === 0) return [];
  
  return commands.filter(cmd => 
    cmd.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
}

// Display the appropriate view based on current state
function displayMenu() {
  switch (currentView) {
    case 'main':
      showMainMenu();
      break;
    case 'details':
      showCommandDetails(selectedCommand);
      break;
    case 'run':
      showRunConfirmation(selectedCommand);
      break;
    case 'search':
      showSearchScreen();
      break;
  }
}

// Handle user input
function handleKeypress(str, key) {
  // Handle Ctrl+C to exit
  if (key.ctrl && key.name === 'c') {
    rl.close();
    process.exit(0);
  }

  switch (currentView) {
    case 'main':
      handleMainMenuKeypress(key);
      break;
    case 'details':
      handleDetailsKeypress(key);
      break;
    case 'run':
      handleRunKeypress(key);
      break;
    case 'search':
      handleSearchKeypress(str, key);
      break;
  }
  
  displayMenu();
}

// Handle keypress in main menu
function handleMainMenuKeypress(key) {
  switch (key.name) {
    case 'up':
      currentIndex = (currentIndex - 1 + commands.length) % commands.length;
      break;
    case 'down':
      currentIndex = (currentIndex + 1) % commands.length;
      break;
    case 'return':
      selectedCommand = commands[currentIndex];
      currentView = 'details';
      break;
    case 's':
      currentView = 'search';
      searchQuery = '';
      currentIndex = 0;
      break;
    case 'q':
      rl.close();
      process.exit(0);
      break;
  }
}

// Handle keypress in command details view
function handleDetailsKeypress(key) {
  switch (key.name) {
    case 'return':
      currentView = 'run';
      break;
    case 'backspace':
      currentView = 'main';
      break;
    case 'q':
      rl.close();
      process.exit(0);
      break;
  }
}

// Handle keypress in run confirmation view
function handleRunKeypress(key) {
  if (key.name === 'y') {
    // Actually execute the command
    executeCommand(selectedCommand);
  } else {
    // Return to details view if any other key is pressed
    currentView = 'details';
  }
}

// Handle keypress in search view
function handleSearchKeypress(str, key) {
  switch (key.name) {
    case 'escape':
      currentView = 'main';
      break;
    case 'backspace':
      if (searchQuery.length > 0) {
        searchQuery = searchQuery.slice(0, -1);
        currentIndex = 0;
      } else {
        currentView = 'main';
      }
      break;
    case 'return':
      if (searchQuery.length > 0) {
        const results = getSearchResults();
        
        if (results.length > 0) {
          selectedCommand = results[currentIndex];
          currentView = 'details';
        }
      }
      break;
    case 'up':
      if (searchQuery.length > 0) {
        const results = getSearchResults();
        
        if (results.length > 0) {
          currentIndex = (currentIndex - 1 + results.length) % results.length;
        }
      }
      break;
    case 'down':
      if (searchQuery.length > 0) {
        const results = getSearchResults();
        
        if (results.length > 0) {
          currentIndex = (currentIndex + 1) % results.length;
        }
      }
      break;
    default:
      // Add typed character to search query
      if (!key.ctrl && !key.meta && str && str.length === 1) {
        searchQuery += str;
        currentIndex = 0;
      }
      break;
  }
}

// Handle terminal resizing
process.stdout.on('resize', () => {
  displayMenu();
});

// Start the application
clearScreen();
displayMenu();

// Handle keyboard input
process.stdin.setRawMode(true);
process.stdin.resume();

// Trigger keypress events on stdin
readline.emitKeypressEvents(process.stdin, rl);

// Override readline _writeToOutput to support the raw mode
rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.output && rl.output.write) {
    rl.output.write(stringToWrite);
  }
};

// Listen for keypress events
process.stdin.on('keypress', handleKeypress);