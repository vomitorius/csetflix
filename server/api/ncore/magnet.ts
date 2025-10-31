// Ncore.pro magnet link API endpoint
import { NcoreClient } from '~/server/utils/ncoreClient'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const torrentId = query.id as string

    if (!torrentId) {
      return {
        success: false,
        error: 'Torrent ID is required'
      }
    }

    // Get Ncore credentials from environment
    const config = useRuntimeConfig()
    const username = process.env.NCORE_USERNAME || config.ncoreUsername
    const password = process.env.NCORE_PASSWORD || config.ncorePassword

    if (!username || !password) {
      return {
        success: false,
        error: 'Ncore credentials not configured. Please set NCORE_USERNAME and NCORE_PASSWORD in .env file'
      }
    }

    // Use TypeScript Ncore client (no Python required)
    const client = new NcoreClient(username, password)
    const result = await client.getMagnetLink(torrentId)
    
    // Logout after getting magnet link
    await client.logout()
    
    return result

  } catch (error: any) {
    console.error('Ncore magnet error:', error)
    return {
      success: false,
      error: error.message || 'Failed to get magnet link from Ncore'
    }
  }
})
