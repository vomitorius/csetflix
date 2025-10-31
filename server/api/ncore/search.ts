// Ncore.pro search API endpoint
import { NcoreClient } from '~/server/utils/ncoreClient'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const movieTitle = query.title as string

    if (!movieTitle) {
      return {
        success: false,
        error: 'Movie title is required'
      }
    }

    // Get Ncore credentials from environment
    const config = useRuntimeConfig()
    const username = process.env.NCORE_USERNAME || config.ncoreUsername
    const password = process.env.NCORE_PASSWORD || config.ncorePassword
    const passkey = process.env.NCORE_PASSKEY || config.ncorePasskey

    if (!username || !password || !passkey) {
      return {
        success: false,
        error: 'Ncore credentials not configured. Please set NCORE_USERNAME, NCORE_PASSWORD and NCORE_PASSKEY in .env file'
      }
    }

    // Use TypeScript Ncore client (no Python required)
    const client = new NcoreClient(username, password, passkey)
    const result = await client.search(movieTitle)
    
    // Logout after search
    await client.logout()
    
    return result

  } catch (error: any) {
    console.error('Ncore search error:', error)
    return {
      success: false,
      error: error.message || 'Failed to search Ncore',
      torrents: []
    }
  }
})
