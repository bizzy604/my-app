const fs = require('fs');
const path = require('path');

// Paths
const publicDir = path.join(__dirname, '../public');
const targetPublicDir = path.join(__dirname, '../.next/standalone/public');
const staticDir = path.join(__dirname, '../.next/static');
const targetStaticDir = path.join(__dirname, '../.next/standalone/.next/static');

// Create directories if they don't exist
if (!fs.existsSync(targetPublicDir)) {
  fs.mkdirSync(targetPublicDir, { recursive: true });
}

if (!fs.existsSync(path.dirname(targetStaticDir))) {
  fs.mkdirSync(path.dirname(targetStaticDir), { recursive: true });
}

// Copy function
function copyFolderRecursive(source, target) {
  // Check if folder needs to be created or integrated
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    const files = fs.readdirSync(source);
    files.forEach(function (file) {
      const currentSource = path.join(source, file);
      const currentTarget = path.join(target, file);
      if (fs.lstatSync(currentSource).isDirectory()) {
        copyFolderRecursive(currentSource, currentTarget);
      } else {
        fs.copyFileSync(currentSource, currentTarget);
      }
    });
  }
}

// Execute copy
try {
  console.log('Copying public directory to standalone output...');
  copyFolderRecursive(publicDir, targetPublicDir);
  console.log('Public directory successfully copied to standalone output!');
  
  // Also copy static directory which contains CSS
  if (fs.existsSync(staticDir)) {
    console.log('Copying static assets directory to standalone output...');
    copyFolderRecursive(staticDir, targetStaticDir);
    console.log('Static assets directory successfully copied to standalone output!');
  } else {
    console.log('Static assets directory not found. Skipping...');
  }
} catch (error) {
  console.error('Error copying directories:', error);
  process.exit(1);
}
