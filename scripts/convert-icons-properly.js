#!/usr/bin/env node

// Proper icon conversion using ImageMagick
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Log function to show progress
function log(message) {
  console.log(`[ICON] ${message}`);
}

// Check if ImageMagick is installed
try {
  execSync('which convert', { stdio: 'pipe' });
  log('ImageMagick found, will use it for proper icon conversion');
} catch (error) {
  console.error('ImageMagick not found. Please install it with: brew install imagemagick');
  process.exit(1);
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

// Generate PNG icons at different sizes
log('Generating PNG icons at different sizes...');
[
  { size: 32, name: '32x32.png' },
  { size: 128, name: '128x128.png' },
  { size: 256, name: '128x128@2x.png' }
].forEach(icon => {
  const outputPath = path.join(iconsDir, icon.name);
  log(`Creating ${icon.name} (${icon.size}x${icon.size})...`);
  execSync(`convert "${sourcePath}" -resize ${icon.size}x${icon.size} "${outputPath}"`, { stdio: 'pipe' });
});

// Generate Windows ICO file with multiple sizes
log('Generating Windows ICO file...');
const icoPath = path.join(iconsDir, 'icon.ico');
try {
  execSync(`convert "${sourcePath}" -define icon:auto-resize=256,128,64,48,32,16 "${icoPath}"`, { stdio: 'pipe' });
  log('Windows ICO file created successfully');
} catch (error) {
  log('Error creating ICO file. Falling back to simpler approach...');
  execSync(`convert "${sourcePath}" -resize 256x256 "${icoPath}"`, { stdio: 'pipe' });
}

// Create a proper macOS ICNS file
log('Generating macOS ICNS file...');
const icnsPath = path.join(iconsDir, 'icon.icns');
try {
  // Create a temporary iconset directory
  const iconsetDir = path.join(iconsDir, 'tmp.iconset');
  if (fs.existsSync(iconsetDir)) {
    execSync(`rm -rf "${iconsetDir}"`, { stdio: 'pipe' });
  }
  fs.mkdirSync(iconsetDir, { recursive: true });
  
  // Generate the iconset files
  const sizes = [16, 32, 64, 128, 256, 512, 1024];
  for (const size of sizes) {
    execSync(`convert "${sourcePath}" -resize ${size}x${size} "${iconsetDir}/icon_${size}x${size}.png"`, { stdio: 'pipe' });
    // Create 2x versions for retina display
    if (size <= 512) {
      execSync(`convert "${sourcePath}" -resize ${size * 2}x${size * 2} "${iconsetDir}/icon_${size}x${size}@2x.png"`, { stdio: 'pipe' });
    }
  }
  
  // Try to use iconutil if we're on macOS
  try {
    execSync(`iconutil -c icns "${iconsetDir}" -o "${icnsPath}"`, { stdio: 'pipe' });
    log('ICNS file created using iconutil');
  } catch (e) {
    // If iconutil fails, try using convert directly
    log('iconutil not available, falling back to ImageMagick for ICNS...');
    execSync(`convert "${iconsetDir}/icon_1024x1024.png" "${icnsPath}"`, { stdio: 'pipe' });
  }
  
  // Clean up the temporary directory
  execSync(`rm -rf "${iconsetDir}"`, { stdio: 'pipe' });
  
} catch (error) {
  log(`Error creating ICNS file: ${error.message}. Falling back to simple conversion...`);
  execSync(`convert "${sourcePath}" -resize 1024x1024 "${icnsPath}"`, { stdio: 'pipe' });
}

log('Icon generation complete! All formats created properly using ImageMagick.');
log('Icons are available in the icons directory and ready for Tauri to use.');