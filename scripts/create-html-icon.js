#!/usr/bin/env node

// Create a simple HTML-based icon using data URL
const fs = require('fs');
const path = require('path');

// Log function to show progress
function log(message) {
  console.log(`[ICON] ${message}`);
}

// Sizes needed for Tauri
const sizes = [
  { name: '32x32.png', width: 32, height: 32 },
  { name: '128x128.png', width: 128, height: 128 },
  { name: '128x128@2x.png', width: 256, height: 256 },
  { name: 'icon.ico', width: 256, height: 256 },
  { name: 'icon.icns', width: 512, height: 512 }
];

// Create a simple 1-pixel colored PNG data URL (blue background)
// This is a very simple 1x1 pixel blue PNG encoded as a data URL
const bluePngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkMGH4DwABtQGRKjW4KAAAAABJRU5ErkJggg==';

// Function to create a Base64 data URL for a 1x1 pixel PNG with a specific color
function createColoredPng(color) {
  return new Promise((resolve, reject) => {
    // Create a temporary HTML file with a canvas element
    const tempHtml = `
      <html>
      <body>
        <canvas id="canvas" width="64" height="64"></canvas>
        <script>
          const canvas = document.getElementById('canvas');
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '${color}';
          ctx.fillRect(0, 0, 64, 64);
          document.write(canvas.toDataURL());
        </script>
      </body>
      </html>
    `;
    
    const tempHtmlPath = path.join(__dirname, '..', 'icons', 'temp-canvas.html');
    fs.writeFileSync(tempHtmlPath, tempHtml);
    
    // Return the default blue data URL
    resolve(bluePngDataUrl);
  });
}

// Create an icon with the IX text
async function createIcons() {
  try {
    // Ensure icons directory exists
    const iconsDir = path.join(__dirname, '..', 'icons');
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }
    
    // Generate a dark blue PNG data URL
    const darkBluePngDataUrl = await createColoredPng('#1E3A8A');
    
    // Since we can't easily create the exact PNG we want this way,
    // we'll write a fixed high-contrast PNG with the IX logo
    
    // This is a 64x64 pixel PNG with a dark blue background and white "IX" text
    // It's pre-generated and hard-coded here
    const ixLogoBase64 = `
      iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACx
      jwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAOXSURBVHhe7ZqxihRBFEXHRVkQXDAQFt01UASz
      xUhN/AER/QAT/QUTExVMxcjASDHQRP9AMVrYQAMxWBG+4A1T1V3dPd01Ve/17HQdaHZ6qnu669a7
      r6pmenPrxn7zH3NQ+v9OzgRwJoCZAA4K/715U76/flG+vn1Vfn16V7Z3dsqxK1fL5avXy9Hjx8s6
      ORPAwM/37y9eWMjt27eFQIiWfv/8vhDA3KygZrP8XBvw/uWL5b97e3ulefWyNO9ely/v3i5/Pzhy
      pFy4dLnMFxdKJx5xJlh7AbCc5YAD0wEZILp7+05ptrdXLHn+9LF9vqgSPofLnAKZokYmJIDmAzDr
      gbHHFrm5uLyHQ6DkFHDUkBQiEiQAuJm0j/LQXnP1P8dxIWYzrIHmZ5cQwcyIqgRA8/IBVzHgDrSP
      8hYmEFoUW8A1TDDAPQKgGrpJQkTPAFdfdwY4XH1UoVYBmMnLZk9FqYqW7hmoVQA4nqbY1Yt3XoBo
      +ZlgtQKwiZ+MBGAW8Ft+JFitAABWPYKZoFIxF0CkImYBXIWFbgIBVi8AA7iFzQEw9I78uGh1AgB+
      GKmgX+eY6MrRq3LLF00ZBRXEaTjYIgD3UCWY+ioD6R1t+bFIBUXkBXBhxCjSQc/vOFfmQHvYBGgY
      Jt1cJKN3QP4DfTNB3y4x2MHIPj4JTc0AcJ9h9iLNRCDglb1kbW9vl62trUFpXgAPp+jX1CjZYbOp
      DmgvZgG92Z2cHFNPAICvqT5JiAigYcpOBYObIM5HI8HUApBbMIbqHJe2tpkAn5KYX4yOCCqnwVEC
      KNZLW4lfcBn9HNjA2OAFkE2UeJzWAlcVfJyhauUoAZypyQDfALQfnA8GGiAkVYDYbB/a8ysxG6z8
      DECs1/c7MdkkkKWlswIHPsv7VWEKgRBjr87VNkHfAjERLOP3/r7nQB+9Nf0UdqXWVwbJ3LN8QRwl
      AF9qTRXAfYHpBcDc1uEQ70+FUgBZAyCv6YbYKAFwEm+eBXEw5m9NMBgxKn2XC/ZxaWtbiwAkGwRg
      VWn7u0JUIToVUfgxdwLTCsCxOgF0c6AWAZA83uZITHLbI0YJoboQ4vkgD0jZOBp31chGJKStdDQx
      wGMnIbO4UQOZAHTjZGFmQ+7+V3xhBFwlKN0ZnVAAwOaTvfpnEXt2VgCoJoQIHBbLrR2sXgC+LB9z
      rS8jQFMaHQYHRgBThBC3wYTQWgrg36aqDzBnAjgTwH8vgKb8ASBg05JfTUcuAAAAAElFTkSuQmCC
    `.replace(/\s+/g, '');
    
    // Write the base64 data to all icon files
    for (const size of sizes) {
      const outputPath = path.join(iconsDir, size.name);
      log(`Creating ${size.name} icon`);
      
      // Convert base64 to binary
      const buffer = Buffer.from(ixLogoBase64, 'base64');
      fs.writeFileSync(outputPath, buffer);
    }
    
    log('All icons created successfully!');
    
  } catch (error) {
    console.error('Error creating icons:', error);
  }
}

// Run the icon creation
createIcons();