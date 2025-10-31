// Ncore.pro search API endpoint
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

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

    if (!username || !password) {
      return {
        success: false,
        error: 'Ncore credentials not configured. Please set NCORE_USERNAME and NCORE_PASSWORD in .env file'
      }
    }

    // Call Python script to search Ncore
    const scriptPath = path.join(process.cwd(), 'server', 'scripts', 'ncore_search.py')
    const command = `python3 "${scriptPath}" "${movieTitle}" "${username}" "${password}"`

    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000 // 30 second timeout
    })

    if (stderr) {
      console.error('Ncore search stderr:', stderr)
    }

    const result = JSON.parse(stdout)
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
