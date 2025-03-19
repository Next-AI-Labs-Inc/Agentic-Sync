// Creates latest.json for Tauri auto-updates
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get version from package.json
const packageJson = require('../package.json');
const version = packageJson.version;

// GitHub repo information
const owner = 'jryanhaber';
const repo = 'ix';
const releaseTag = `v${version}`;

// Build paths for different platforms
const platforms = {
  windows: {
    url: `https://github.com/${owner}/${repo}/releases/download/${releaseTag}/IX.Agent.Sync_${version}_x64_en-US.msi`,
    signature: ''  // This should be filled with the actual signature
  },
  darwin: {
    url: `https://github.com/${owner}/${repo}/releases/download/${releaseTag}/IX.Agent.Sync_${version}_aarch64.dmg`,
    signature: ''  // This should be filled with the actual signature
  },
  linux: {
    url: `https://github.com/${owner}/${repo}/releases/download/${releaseTag}/ix-agent-sync_${version}_amd64.AppImage`,
    signature: ''  // This should be filled with the actual signature
  }
};

// Create latest.json
const latestJson = {
  version,
  notes: `Stable release ${version}`,
  pub_date: new Date().toISOString(),
  platforms
};

// Write to file
const outputPath = path.join(__dirname, '../dist/latest.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(latestJson, null, 2));

console.log(`Created latest.json for version ${version}`);
console.log(`Output: ${outputPath}`);