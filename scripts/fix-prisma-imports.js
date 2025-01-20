const fs = require('fs')
const path = require('path')

function updatePrismaImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  
  // Replace default import with named import
  const updatedContent = content.replace(
    /import prisma from ['"]@\/lib\/prisma['"];?/g, 
    "import { prisma } from '@/lib/prisma';"
  )

  fs.writeFileSync(filePath, updatedContent, 'utf8')
  console.log(`Updated ${filePath}`)
}

const directories = [
  'd:/E-Procurement System/app/my-app/app',
  'd:/E-Procurement System/app/my-app/lib'
]

directories.forEach(dir => {
  const walkDir = (currentPath) => {
    const files = fs.readdirSync(currentPath)
    files.forEach(file => {
      const fullPath = path.join(currentPath, file)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory()) {
        walkDir(fullPath)
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        updatePrismaImports(fullPath)
      }
    })
  }
  walkDir(dir)
})
