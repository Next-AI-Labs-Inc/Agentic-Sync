#!/usr/bin/env node

/**
 * This script fixes the package.json file for Vercel deployment.
 * 
 * The issue is that Vercel doesn't have access to local file dependencies
 * that are referenced with relative paths like "../shared-tools/packages/...".
 * 
 * This script creates a temporary version of package.json with those dependencies
 * removed or replaced with placeholder versions for deployment purposes.
 */

const fs = require('fs');
const path = require('path');

// Read the original package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = require(packageJsonPath);

// Create a deployable version for Vercel
const vercelPackageJson = JSON.parse(JSON.stringify(packageJson));

// Check if we have local file dependencies
const localFileDeps = Object.keys(vercelPackageJson.dependencies || {}).filter(
  dep => vercelPackageJson.dependencies[dep] && 
         typeof vercelPackageJson.dependencies[dep] === 'string' && 
         vercelPackageJson.dependencies[dep].startsWith('file:')
);

if (localFileDeps.length === 0) {
  console.log('No local file dependencies found in package.json.');
  process.exit(0);
}

console.log(`Found ${localFileDeps.length} local file dependencies:`);
localFileDeps.forEach(dep => console.log(`  - ${dep}: ${vercelPackageJson.dependencies[dep]}`));

// Handle the local file dependencies for Vercel deployment
localFileDeps.forEach(dep => {
  // Option 1: Remove the dependency (if it's optional for deployment)
  // delete vercelPackageJson.dependencies[dep];
  
  // Option 2: Replace with a placeholder version
  vercelPackageJson.dependencies[dep] = "0.0.0";
  
  // Option 3: Replace with a specific published version if available
  // vercelPackageJson.dependencies[dep] = "1.0.0";
});

// Add a note in the package.json
vercelPackageJson._vercelDeployment = {
  modified: new Date().toISOString(),
  note: "This is a modified version of package.json for Vercel deployment. Local file dependencies have been replaced."
};

// Write the modified package.json for Vercel
const vercelPackageJsonPath = path.join(process.cwd(), 'package.vercel.json');
fs.writeFileSync(vercelPackageJsonPath, JSON.stringify(vercelPackageJson, null, 2));

console.log(`Created ${vercelPackageJsonPath} for Vercel deployment.`);
console.log('To use this file for deployment, run:');
console.log('cp package.vercel.json package.json && vercel --prod && git checkout -- package.json');
console.log('This will:');
console.log('1. Replace package.json with the Vercel-compatible version');
console.log('2. Deploy to Vercel');
console.log('3. Restore your original package.json file after deployment');