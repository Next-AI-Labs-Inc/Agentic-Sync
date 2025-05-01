const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

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

function generateIXIcon(width, height, outputPath) {
  // Create a canvas with the desired dimensions
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fill the background
  ctx.fillStyle = '#00084D'; // Dark blue background
  ctx.fillRect(0, 0, width, height);

  // Calculate dimensions
  const padding = width * 0.15;
  const fontSize = width * 0.5;
  
  // Draw "IX" text
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = '#FFFFFF'; // White text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Position text in the center
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Draw text
  ctx.fillText('IX', centerX, centerY);

  // Export canvas to PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`Generated icon: ${outputPath}`);
}

// Generate icons for all sizes
sizes.forEach(size => {
  const outputPath = path.join(iconsDir, size.name);
  generateIXIcon(size.width, size.height, outputPath);
});

console.log('Icon generation complete!');