import type { Plugin } from 'vite'
import fs from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

/**
 * Vite plugin to move static HTML files into their own folders with index.html inside.
 *
 * This plugin moves static HTML files (except index.html and notfound.html) into their own folders.
 *
 * @example
 * - index.html -> Don't move
 * - hotels.html -> Create folder "hotels", rename "hotels.html" to "index.html" and move to inside as "hotels/index.html"
 *
 * @returns {Plugin} A Vite plugin that moves static HTML files into folders
 */
export function moveStaticHtmlPlugin(): Plugin {
  return {
    name: 'move-static-html',
    apply: 'build',
    enforce: 'post',
    version: '0.0.1',
    generateBundle() {
      // Schedule the file move operation to run after everything is done
      process.nextTick(async () => {
        // Wait a bit longer to ensure vite-ssg has completely finished
        await new Promise(resolve => setTimeout(resolve, 2000))

        console.log('⏳ Starting Move Static HTML...')
        const distPath = resolve(__dirname, '../dist')

        if (!fs.existsSync(distPath)) {
          console.warn('Dist directory not found, skipping HTML file processing')
          return
        }

        // Get HTML files from root directory
        const rootHtmlFiles = fs.readdirSync(distPath)
          .filter(file => file.endsWith('.html') && file !== 'index.html' && file !== 'notfound.html' && file !== '')

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
      })
    },
  }
}
