/**
 * Utility functions for handling hashtags in GunDB compatible format
 */

/**
 * Converte una stringa di hashtag separata da virgole in array
 * @param hashtagString - Stringa di hashtag separata da virgole
 * @returns Array di hashtag puliti
 */
export const parseHashtags = (hashtagString?: string): string[] => {
   if (!hashtagString || typeof hashtagString !== 'string') {
      return []
   }
   
   return hashtagString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
}

/**
 * Converte un array di hashtag in stringa separata da virgole
 * @param hashtags - Array di hashtag
 * @returns Stringa separata da virgole o undefined se vuoto
 */
export const stringifyHashtags = (hashtags: string[]): string | undefined => {
   if (!hashtags || hashtags.length === 0) {
      return undefined
   }
   
   return hashtags
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .join(',')
}

/**
 * Formatta un hashtag per la visualizzazione (aggiunge # se mancante)
 * @param tag - Il tag da formattare
 * @returns Tag formattato con #
 */
export const formatHashtagForDisplay = (tag: string): string => {
   const cleanTag = tag.trim()
   return cleanTag.startsWith('#') ? cleanTag : `#${cleanTag}`
} 