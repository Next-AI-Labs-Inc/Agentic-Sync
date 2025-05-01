#!/usr/bin/env node

// Create a colored icon version with a clear background for better visibility
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Log function to show progress
function log(message) {
  console.log(`[ICON] ${message}`);
}

// Install canvas if needed
if (!fs.existsSync(path.join(__dirname, '..', 'node_modules', 'canvas'))) {
  log('Installing canvas dependency for image processing...');
  try {
    require('child_process').execSync('npm install --no-save canvas', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to install canvas. Will try to continue...');
  }
}

// Sizes needed for Tauri
const sizes = [
  { name: '32x32.png', width: 32, height: 32 },
  { name: '128x128.png', width: 128, height: 128 },
  { name: '128x128@2x.png', width: 256, height: 256 },
  { name: 'icon.ico', width: 256, height: 256 },
  { name: 'icon.icns', width: 512, height: 512 }
];

// Colors for the icon background
const bgColor = '#1E3A8A'; // Dark blue background
const fgColor = '#FFFFFF';  // White foreground

// Function to create a simple X icon with the text "IX"
async function createIcon(size, outputPath) {
  try {
    const canvas = createCanvas(size.width, size.height);
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size.width, size.height);
    
    // Draw text
    const fontSize = Math.floor(size.width * 0.5); // Size relative to width
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = fgColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('IX', size.width / 2, size.height / 2);
    
    // Try using the source image if it exists
    try {
      const sourcePath = path.join(__dirname, '..', 'icons', 'logo_src.png');
      if (fs.existsSync(sourcePath)) {
        log('Using source image as overlay');
        const img = await loadImage(sourcePath);
        
        // Calculate scaling to fit within the icon
        const scale = Math.min(
          (size.width * 0.8) / img.width,
          (size.height * 0.8) / img.height
        );
        
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (size.width - scaledWidth) / 2;
        const y = (size.height - scaledHeight) / 2;
        
        // Clear the canvas and draw the colored background again
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size.width, size.height);
        
        // Draw the image centered
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
      }
    } catch (imgError) {
      log(`Could not load source image, using text fallback: ${imgError.message}`);
    }
    
    // Save the canvas to a file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    log(`Created ${size.name} (${size.width}x${size.height})`);
    
    return true;
  } catch (error) {
    console.error(`Error creating icon ${size.name}:`, error);
    return false;
  }
}

// Ensure icons directory exists
const iconsDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create all sized icons
async function createAllIcons() {
  log('Creating colored icons with background...');
  
  let success = true;
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, size.name);
    const result = await createIcon(size, outputPath);
    if (!result) success = false;
  }
  
  if (success) {
    log('All icons created successfully! 🎉');
  } else {
    log('Some icons may not have been created properly.');
  }
}

// Run the icon creation
createAllIcons();