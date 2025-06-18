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
 * @returns Formatted public key string
 */
export const formatPublicKey = (publicKey: string | null): string => {
  if (!publicKey) return ''
  if (publicKey.length <= 12) return publicKey
  
  return `${publicKey.substring(0, 6)}...${publicKey.substring(publicKey.length - 6)}`
} 