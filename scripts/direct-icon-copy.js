#!/usr/bin/env node

// Directly copy the existing logo_src.png to all required Tauri icon files
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
  console.error(`Source image does not exist at: ${sourcePath}`);
  process.exit(1);
}

// Create the icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// List of target icons to create (required by Tauri)
const targetIcons = [
  '32x32.png',
  '128x128.png',
  '128x128@2x.png',
  'icon.ico',
  'icon.icns'
];

// Copy source to all target icons
log('Directly copying logo_src.png to all icon locations');
targetIcons.forEach(iconName => {
  const targetPath = path.join(iconsDir, iconName);
  log(`Copying to ${iconName}`);
  fs.copyFileSync(sourcePath, targetPath);
});

log('Direct icon copy complete! logo_src.png copied to all required locations.');
log('Warning: This method uses the original image without resizing. If icons look wrong, try a more sophisticated approach.');