const fs = require('fs')
const path = require('path')

function cleanupImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')

  const unusedImports = lines
    .filter(line => line.startsWith('import ') && 
      !line.includes(' from ') && 
      !line.includes('type ') && 
      !line.includes('interface '))
    .map(line => line.trim())

  const cleanedLines = lines.filter(line => !unusedImports.includes(line))

  fs.writeFileSync(filePath, cleanedLines.join('\n'), 'utf8')
  console.log(`Cleaned ${filePath}`)
}

const directories = [
  'd:/E-Procurement System/app/my-app/app',
  'd:/E-Procurement System/app/my-app/components'
]

directories.forEach(dir => {
  const walkDir = (currentPath) => {
    const files = fs.readdirSync(currentPath)
    files.forEach(file => {
      const fullPath = path.join(currentPath, file)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        walkDir(fullPath)
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        cleanupImports(fullPath)
      }
    })
  }
  walkDir(dir)
})
