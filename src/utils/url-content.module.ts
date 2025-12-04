/**
 * Get the YouTube embed URL for a given video URL.
 * @param url - YouTube video URL, ex: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/IilTAW3ugN0?si=Bomx_NsD-xEzH6YB
 * @returns YouTube embed URL
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
 * Check if a URL is a valid YouTube video URL.
 * @param url - YouTube video URL, ex: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/IilTAW3ugN0?si=Bomx_NsD-xEzH6YB
 * @returns True if the URL is valid, false otherwise.
 */
export function isValidYouTubeUrl(url: string): boolean {
  const youTubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}(?:[?&].*)?$/
  return youTubeRegex.test(url)
}
