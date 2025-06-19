import { useEffect, useState } from 'react'

// URL regex pattern that matches most common URLs
const URL_REGEX = /(https?:\/\/(?:[-\w.])+(?::[0-9]+)?(?:\/(?:[\w/_.])*)?(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)/gi

/**
 * Hook to detect URLs in text and extract them
 * @param text - The text to scan for URLs
 * @param autoFillCallback - Callback function to auto-fill URL field when a URL is detected
 * @returns Object with detected URLs and utility functions
 */
export const useLinkDetection = (
  text: string = ''
) => {
  const [detectedUrls, setDetectedUrls] = useState<string[]>([])

  useEffect(() => {
    if (!text || typeof text !== 'string') {
      setDetectedUrls([])
      return
    }

    // Find all URLs in the text
    const matches = text.match(URL_REGEX)
    const urls = matches ? Array.from(new Set(matches)) : [] // Remove duplicates
    setDetectedUrls(urls)
  }, [text])

  // Function to manually extract URLs from clipboard
  const handlePaste = async (event?: ClipboardEvent) => {
    try {
      let clipboardText = ''
      
      if (event && event.clipboardData) {
        clipboardText = event.clipboardData.getData('text')
      } else if (navigator.clipboard) {
        clipboardText = await navigator.clipboard.readText()
      }

      if (clipboardText) {
        const matches = clipboardText.match(URL_REGEX)
        return matches && matches.length > 0 ? matches[0] : null
      }
    } catch (error) {
      console.warn('Could not read clipboard:', error)
    }
    return null
  }

  // Function to check if a string is a valid URL
  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  // Function to normalize URL (add https if missing)
  const normalizeUrl = (url: string): string => {
    if (!url) return url
    
    const trimmed = url.trim()
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`
    }
    return trimmed
  }

  return {
    detectedUrls,
    lastDetectedUrl: detectedUrls.length > 0 ? detectedUrls[detectedUrls.length - 1] : null,
    hasUrls: detectedUrls.length > 0,
    urlCount: detectedUrls.length,
    handlePaste,
    isValidUrl,
    normalizeUrl
  }
}

export default useLinkDetection 