#!/usr/bin/env node

// A very simple script to copy logo_src.png to all required icon locations
// This is used as a fallback method if Sharp doesn't work
const fs = require('fs');
const path = require('path');

// Log function to show progress
function log(message) {
  console.log(`[ICON] ${message}`);
}

// Source image path
const sourcePath = path.join(__dirname, '..', 'icons', 'logo_src.png');
const iconsDir = path.join(__dirname, '..', 'icons');

// Check if source image exists
if (!fs.existsSync(sourcePath)) {
  console.error(`Source image not found at: ${sourcePath}`);
  process.exit(1);
}

// Create the icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// List of required icon files
const iconFiles = [
  '32x32.png',
  '128x128.png',
  '128x128@2x.png',
  'icon.ico',
  'icon.icns'
];

// Copy source to all required icon files
log('Using simple icon copy method from source image');
iconFiles.forEach(iconFile => {
  const destPath = path.join(iconsDir, iconFile);
  log(`Copying source to ${iconFile}`);
  fs.copyFileSync(sourcePath, destPath);
});

log('Simple icon copy complete! Source image copied to all required locations.');
log('Note: For proper icons with correct sizing, use a dedicated icon generator tool.');