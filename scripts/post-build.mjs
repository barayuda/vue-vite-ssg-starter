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

  // Get HTML files from root directory
  const rootHtmlFiles = fs.readdirSync(distPath)
    .filter(file => file.endsWith('.html') && file !== 'index.html')

  // Get HTML files from guides subdirectory (dynamic routes)
  const guidesPath = resolve(distPath, 'guides')
  const guidesHtmlFiles = fs.existsSync(guidesPath)
    ? fs.readdirSync(guidesPath)
        .filter(file => file.endsWith('.html') && file !== 'index.html')
    : []

  if (rootHtmlFiles.length === 0 && guidesHtmlFiles.length === 0) {
    console.log('ℹ️ No HTML files to move (excluding index.html)')
    return
  }

  // Move root HTML files
  rootHtmlFiles.forEach((file) => {
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

  // Move guides HTML files (dynamic routes) into subdirectories
  guidesHtmlFiles.forEach((file) => {
    const baseName = file.replace('.html', '')
    const folderPath = resolve(guidesPath, baseName)
    const originalPath = resolve(guidesPath, file)
    const newPath = resolve(folderPath, 'index.html')

    try {
      // Create folder if it doesn't exist
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true })
      }

      // Move and rename file
      fs.renameSync(originalPath, newPath)
      console.log(`✅ Moved guides/${file} to guides/${baseName}/index.html`)
    }
    catch (err) {
      console.error(`❌ Failed to move guides/${file}:`, err)
    }
  })

  const totalFiles = rootHtmlFiles.length + guidesHtmlFiles.length
  console.log(`🎉 Move Static HTML completed! Processed ${totalFiles} files.`)
}

// Run the function
moveStaticHtmlFiles().catch((error) => {
  console.error('❌ Post-build script failed:', error)
  process.exit(1)
})
