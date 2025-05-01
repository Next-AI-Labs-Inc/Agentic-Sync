#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const sharp = require('sharp');

// Log function to show progress
function log(message) {
  console.log(`[ICON] ${message}`);
}

// Check if we need to install sharp
if (!fs.existsSync(path.join(__dirname, '..', 'node_modules', 'sharp'))) {
  log('Installing sharp dependency for image processing...');
  try {
    execSync('npm install --no-save sharp', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to install sharp. Continuing with basic icon generation.');
  }
}

// Icon sizes to generate
const pngSizes = [
  { width: 32, height: 32, name: '32x32.png' },
  { width: 128, height: 128, name: '128x128.png' },
  { width: 256, height: 256, name: '128x128@2x.png' }
];

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

// Function to process the image using sharp
async function processImage() {
  try {
    log('Reading source image...');
    const sourceBuffer = fs.readFileSync(sourcePath);
    
    // Generate PNG icons with Sharp
    log('Generating PNG icons...');
    for (const size of pngSizes) {
      const outputPath = path.join(iconsDir, size.name);
      log(`Creating ${size.width}x${size.height} icon: ${size.name}`);
      
      await sharp(sourceBuffer)
        .resize(size.width, size.height)
        .png({ quality: 90 })
        .toFile(outputPath);
      
      log(`Created ${size.name}`);
    }
    
    // For Windows ICO and macOS ICNS, we'll create copies of PNG files
    // These will need to be manually converted on the appropriate platforms
    // Copy the largest PNG as a placeholder for icon.ico
    log('Creating placeholder for Windows ICO...');
    fs.copyFileSync(
      path.join(iconsDir, '128x128@2x.png'),
      path.join(iconsDir, 'icon.ico')
    );
    
    // Copy the largest PNG as a placeholder for icon.icns
    log('Creating placeholder for macOS ICNS...');
    fs.copyFileSync(
      path.join(iconsDir, '128x128@2x.png'),
      path.join(iconsDir, 'icon.icns')
    );
    
    log('Icon generation complete! 🎉');
    log(`Icons are available in: ${iconsDir}`);
    log('Note: icon.ico and icon.icns are placeholder PNGs. For proper icons, you\'ll need to convert them on Windows/macOS systems.');
  } catch (error) {
    console.error('Error processing image:', error);
    process.exit(1);
  }
}

// Process the image
processImage();