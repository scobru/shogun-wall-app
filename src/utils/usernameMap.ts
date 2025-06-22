import gun, { namespace } from '../api/gun'
import { getRandomUsername, makeId, IdTypes } from './index'

// Path in GunDB for storing username mappings
const USERNAME_MAP_PATH = `${namespace}/username_maps`

/**
 * Gets a stored username for a given public key
 * @param publicKey The public key to look up
 * @returns Promise that resolves to the username or null if not found
 */
export const getStoredUsernameForPublicKey = (publicKey: string): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!publicKey) {
      resolve(null)
      return
    }
    
    // Lookup in GunDB
    gun.get(USERNAME_MAP_PATH)
      .get(publicKey)
      .once((data: any) => {
        if (!data || !data.username) {
          resolve(null)
          return
        }
        resolve(data.username)
      })
  })
}

/**
 * Generates and stores a new random username for a public key
 * @param publicKey The public key to create username for
 * @returns Promise that resolves to the newly created username
 */
export const generateAndStoreUsername = async (publicKey: string): Promise<string> => {
  if (!publicKey) {
    throw new Error('Public key is required')
  }
  
  // Check if username already exists
  const existingUsername = await getStoredUsernameForPublicKey(publicKey)
  if (existingUsername) {
    return existingUsername
  }
  
  // Get a random username and add a unique suffix
  const baseUsername = getRandomUsername()
  const suffix = makeId(3, [IdTypes.numbers])
  const username = `${baseUsername}_${suffix}`
  
  // Store the mapping in GunDB
  return new Promise((resolve) => {
    gun.get(USERNAME_MAP_PATH)
      .get(publicKey)
      .put({
        username,
        createdAt: Date.now(),
        publicKey
      }, (ack) => {
        console.log('✅ Username stored for public key', ack)
        resolve(username)
      })
  })
}

/**
 * Gets or creates a username for a public key
 * @param publicKey The public key to get/create username for 
 * @returns Promise that resolves to the username
 */
export const getOrCreateUsernameForPublicKey = async (publicKey: string): Promise<string> => {
  if (!publicKey) {
    return 'anonymous'
  }
  
  // Try to get existing username
  const existingUsername = await getStoredUsernameForPublicKey(publicKey)
  if (existingUsername) {
    return existingUsername
  }
  
  // Create new username if not exists
  return generateAndStoreUsername(publicKey)
}

/**
 * Formats a public key for display (truncated)
 * @param publicKey The public key to format
 * @param maxLength Optional max length before truncation (default: 20)
 * @returns Formatted public key string
 */
export const formatPublicKey = (publicKey: string | null, maxLength: number = 20): string => {
  if (!publicKey) return ''
  if (publicKey.length <= maxLength) return publicKey
  
  // For very long keys, show more characters at the beginning and end
  const startChars = Math.max(6, Math.floor(maxLength * 0.4))
  const endChars = Math.max(4, Math.floor(maxLength * 0.3))
  
  return `${publicKey.substring(0, startChars)}...${publicKey.substring(publicKey.length - endChars)}`
}

/**
 * Determines if a string looks like a Gun.js public key
 * @param userString The string to check
 * @returns true if it looks like a public key
 */
export const isPublicKey = (userString: string): boolean => {
  if (!userString || typeof userString !== 'string') return false
  
  // Gun.js public keys are:
  // - Very long (>50 characters)  
  // - Contain a dot (base64 format)
  // - Don't contain underscores (usernames do)
  // - Only contain base64 characters
  return (
    userString.length > 50 &&
    userString.includes('.') &&
    !userString.includes('_') &&
    /^[A-Za-z0-9+/=.-]+$/.test(userString)
  )
}

/**
 * Formats an author display name, handling both usernames and public keys
 * @param user The user identifier (username or public key)
 * @returns Formatted display name
 */
export const formatAuthorDisplay = (user: string | null | undefined): string => {
  if (!user) return 'Autore sconosciuto'
  
  // If it's a public key, try to get the mapped username first
  if (isPublicKey(user)) {
    // For real-time display, we'll show the formatted public key
    // The actual username mapping lookup is handled by the AuthContext
    return formatPublicKey(user)
  }
  
  // If it's already a username, return it as is
  return user
} 