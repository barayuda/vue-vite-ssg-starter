/**
 * @module utils/url-content
 * @description Utilities for processing and validating URL content, particularly YouTube URLs.
 * Provides functions to convert YouTube watch URLs to embed URLs with optimized parameters.
 */

/**
 * @function getYouTubeEmbedUrl
 * @description Converts a YouTube watch URL to an embed URL with optimized autoplay parameters.
 * Handles both standard youtube.com/watch URLs and shortened youtu.be URLs.
 *
 * @param {string} url - YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)
 * @returns {string} YouTube embed URL with autoplay parameters, or original URL if invalid
 *
 * @example
 * ```typescript
 * const embedUrl = getYouTubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
 * // Returns: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&...'
 * ```
 *
 * @remarks
 * - Returns original URL if not a valid YouTube URL
 * - Includes autoplay, mute, loop, and other mobile-friendly parameters
 * - Extracts video ID from both URL formats
 */
export function getYouTubeEmbedUrl(url: string): string {
  // Check if the URL is a valid YouTube URL
  if (!isValidYouTubeUrl(url)) {
    return url
  }
  else {
    // Handle shortened youtu.be URLs
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0]
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&modestbranding=1&playsinline=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&fs=0&color=white&disablekb=1&enablejsapi=1`
    }

    // Standard youtube.com URLs
    if (url.includes('v=')) {
      const videoId = url.split('v=')[1]
      // Enhanced parameters for mobile autoplay compatibility
      return `${url.replace('watch?v=', 'embed/')}?autoplay=1&mute=1&loop=1&playlist=${videoId}&modestbranding=1&playsinline=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&fs=0&color=white&disablekb=1&enablejsapi=1`
    }
  }
  return url
}

/**
 * @function isValidYouTubeUrl
 * @description Validates if a URL is a valid YouTube video URL.
 * Checks for both standard youtube.com/watch and shortened youtu.be formats.
 *
 * @param {string} url - YouTube video URL to validate
 * @returns {boolean} True if the URL is a valid YouTube video URL, false otherwise
 *
 * @example
 * ```typescript
 * if (isValidYouTubeUrl(url)) {
 *   const embedUrl = getYouTubeEmbedUrl(url)
 * }
 * ```
 *
 * @remarks
 * - Validates URL format using regex
 * - Supports both youtube.com and youtu.be domains
 * - Requires 11-character video ID
 */
export function isValidYouTubeUrl(url: string): boolean {
  const youTubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}(?:[?&].*)?$/
  return youTubeRegex.test(url)
}
