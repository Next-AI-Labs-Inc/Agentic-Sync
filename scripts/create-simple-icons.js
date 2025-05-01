#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Log function to show progress
function log(message) {
  console.log(`[ICON] ${message}`);
}

// Icon sizes to generate
const sizes = [
  { width: 32, height: 32, name: '32x32.png' },
  { width: 128, height: 128, name: '128x128.png' },
  { width: 256, height: 256, name: '128x128@2x.png' }
];

// Create the icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Function to create a very simple placeholder icon file
function createSimpleIcon(outputPath, size) {
  log(`Creating placeholder icon: ${outputPath}`);
  
  // Create a 1x1 blue pixel PNG
  const buffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAI8V7TxIwAAAABJRU5ErkJggg==',
    'base64'
  );
  
  fs.writeFileSync(outputPath, buffer);
}

// Generate placeholder icons for all sizes
sizes.forEach(size => {
  const outputPath = path.join(iconsDir, size.name);
  createSimpleIcon(outputPath, size);
});

log('Simple icon placeholder creation complete!');
log('Note: These are placeholder icons. For real icons, you will need to create proper PNG files.');