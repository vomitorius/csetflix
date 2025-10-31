// Ncore.pro magnet link API endpoint
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

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

    // Call Python script to get magnet link
    // Pass credentials via environment variables for security
    const scriptPath = path.join(process.cwd(), 'server', 'scripts', 'ncore_magnet.py')
    const command = `python3 "${scriptPath}" "${torrentId}"`

    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30 second timeout
      env: {
        ...process.env,
        NCORE_USERNAME: username,
        NCORE_PASSWORD: password
      }
    })

    if (stderr) {
      console.error('Ncore magnet stderr:', stderr)
    }

    const result = JSON.parse(stdout)
    return result

  } catch (error: any) {
    console.error('Ncore magnet error:', error)
    return {
      success: false,
      error: error.message || 'Failed to get magnet link from Ncore'
    }
  }
})
