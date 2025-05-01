/**
 * Component Import Verification Script
 * 
 * This script checks for inconsistencies in component imports, identifying issues where:
 * 1. Components are imported from @ix/* packages but still defined locally
 * 2. Components are marked as deprecated but still imported locally
 * 3. Import paths don't match the expected pattern for either local or shared components
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Map of shared components and their expected import paths
const sharedComponents = {
  'LoadingSpinner': '@ix/loading-spinner',
  'Popover': '@ix/popover',
  'RouteTransition': '@ix/route-transition',
  'DropdownMenu': '@ix/dropdown-menu'
};

console.log('🔍 Checking component imports...');

// Check if shared-tools packages exist
let missingPackages = [];
Object.entries(sharedComponents).forEach(([name, pkg]) => {
  const pkgPath = path.resolve(__dirname, '..', '..', 'shared-tools/packages', pkg.replace('@ix/', ''));
  if (!fs.existsSync(pkgPath)) {
    missingPackages.push(pkg);
  }
});

if (missingPackages.length > 0) {
  console.warn(`⚠️ Warning: The following shared packages are missing:`);
  missingPackages.forEach(pkg => console.warn(`  - ${pkg}`));
  console.warn('Run npm run setup:components to set up the shared components');
}

// Find all .tsx and .ts files
const files = glob.sync('src/**/*.{tsx,ts}', { ignore: ['**/node_modules/**'] });
console.log(`📂 Checking ${files.length} files for component imports...`);

let errors = 0;
let warnings = 0;
let mismatchedFiles = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let fileHasIssues = false;
  
  Object.entries(sharedComponents).forEach(([name, pkg]) => {
    // Check for actual import from @ix/* packages (not just in comments/examples)
    const sharedImportRegex = new RegExp(`^\\s*import\\s+{\\s*${name}\\s*}\\s+from\\s+['"]${pkg}['"]`, 'm');
    
    // Check for local component definition or import
    const localDefRegex = new RegExp(`export\\s+default\\s+function\\s+${name}\\s*\\(`);
    const localClassDefRegex = new RegExp(`export\\s+default\\s+class\\s+${name}\\s+`);
    const localImportRegex = new RegExp(`import\\s+${name}\\s+from\\s+['"]@/components/${name}['"]`);
    
    const usesSharedImport = sharedImportRegex.test(content);
    const hasLocalDef = localDefRegex.test(content) || localClassDefRegex.test(content);
    const usesLocalImport = localImportRegex.test(content);
    
    // Check for component defined locally but imported from shared package
    if (usesSharedImport && hasLocalDef) {
      console.error(`❌ ERROR in ${file}: Importing ${name} from ${pkg} but also defines it locally`);
      errors++;
      fileHasIssues = true;
    }
    
    // Check for files that import the component from both sources
    if (usesSharedImport && usesLocalImport) {
      console.error(`❌ ERROR in ${file}: Importing ${name} from both ${pkg} and locally`);
      errors++;
      fileHasIssues = true;
    }
    
    // Check for deprecated comment but still using local import
    const deprecatedCommentRegex = new RegExp(`@deprecated.*${pkg}`);
    if (deprecatedCommentRegex.test(content) && usesLocalImport) {
      console.warn(`⚠️ WARNING in ${file}: Using deprecated local ${name} component`);
      warnings++;
      fileHasIssues = true;
    }
    
    // Check for deprecated component that's being imported from shared
    if (deprecatedCommentRegex.test(content) && hasLocalDef && usesSharedImport) {
      console.warn(`⚠️ WARNING in ${file}: Component is marked deprecated but imported from shared library`);
      warnings++;
      fileHasIssues = true;
    }
  });
  
  if (fileHasIssues) {
    mismatchedFiles.push(file);
  }
});

if (errors === 0 && warnings === 0) {
  console.log('✅ All component imports are consistent');
} else {
  console.log(`\n📊 Import Verification Summary:`);
  console.log(`Found ${errors} errors and ${warnings} warnings in ${mismatchedFiles.length} files`);
  
  if (mismatchedFiles.length > 0) {
    console.log('\n📝 Files with issues:');
    mismatchedFiles.forEach(file => console.log(`  - ${file}`));
  }
  
  console.log('\n🛠️ To fix these issues:');
  console.log('1. Run npm run setup:components to ensure shared components are available');
  console.log('2. For each component, ensure all files use the same import style (either local or shared)');
  console.log('3. Verify that package.json correctly references the shared components');
  console.log('4. Run npm run verify before committing to ensure all issues are resolved');
  
  if (errors > 0) {
    process.exit(1);
  }
}