#!/usr/bin/env node

import fs from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Post-build script to move static HTML files
 * Runs after vite-ssg build completes
 */
async function moveStaticHtmlFiles() {
  console.log('⏳ Starting Move Static HTML...')

  const distPath = resolve(__dirname, '../dist')

  if (!fs.existsSync(distPath)) {
    console.warn('Dist directory not found, skipping HTML file processing')
    return
  }

  const htmlFiles = fs.readdirSync(distPath)
    .filter(file => file.endsWith('.html') && file !== 'index.html')

  if (htmlFiles.length === 0) {
    console.log('ℹ️ No HTML files to move (excluding index.html)')
    return
  }

  htmlFiles.forEach((file) => {
    const baseName = file.replace('.html', '')
    const folderPath = resolve(distPath, baseName)
    const originalPath = resolve(distPath, file)
    const newPath = resolve(folderPath, 'index.html')

    try {
      // Create folder if it doesn't exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
      }

      // Move and rename file
      fs.renameSync(originalPath, newPath)
      console.log(`✅ Moved ${file} to ${baseName}/index.html`)
    }
    catch (err) {
      console.error(`❌ Failed to move ${file}:`, err)
    }
  })

  console.log(`🎉 Move Static HTML completed! Processed ${htmlFiles.length} files.`)
}

// Run the function
moveStaticHtmlFiles().catch((error) => {
  console.error('❌ Post-build script failed:', error)
  process.exit(1)
})
