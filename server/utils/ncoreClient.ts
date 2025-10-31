/**
 * Ncore.pro Client - TypeScript implementation
 * Replaces Python ncoreparser library for serverless environments
 */
import axios, { type AxiosInstance } from 'axios'
import { wrapper } from 'axios-cookiejar-support'
import { CookieJar } from 'tough-cookie'
import { parse } from 'node-html-parser'
import { createHash } from 'crypto'
import bencode from 'bencode'

interface NcoreTorrent {
  id: string
  title: string
  type: string
  size: string
  seeders: number
  leechers: number
  uploaded: string
  url: string
}

interface SearchResult {
  success: boolean
  torrents: NcoreTorrent[]
  count: number
  error?: string
}

interface MagnetResult {
  success: boolean
  magnet?: string
  error?: string
}

// Ncore.pro search categories
enum SearchCategory {
  HD_HUN = 'hd_hun',      // Film (HUN HD)
  HD_ENG = 'hd',          // Film (ENG HD)
  SD_HUN = 'xvid_hun',    // Film (HUN SD)
  SD_ENG = 'xvid',        // Film (ENG SD)
  DVD_HUN = 'dvd_hun',    // Film (HUN DVD)
  DVD_ENG = 'dvd'         // Film (ENG DVD)
}

export class NcoreClient {
  private axiosInstance: AxiosInstance
  private isLoggedIn: boolean = false
  private username: string
  private password: string
  private passkey: string
  private jar: CookieJar

  constructor(username: string, password: string, passkey: string) {
    this.username = username
    this.password = password
    this.passkey = passkey
    this.jar = new CookieJar()
    
    this.axiosInstance = wrapper(axios.create({
      baseURL: 'https://ncore.pro',
      timeout: 30000,
      jar: this.jar,
      withCredentials: true,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'hu-HU,hu;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    }))
  }

  async login(): Promise<boolean> {
    try {
      console.log('[NcoreClient] Logging in with username:', this.username)
      
      // Perform login
      const loginData = new URLSearchParams({
        'nev': this.username,
        'pass': this.password
      })

      const response = await this.axiosInstance.post('/login.php', loginData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      console.log('[NcoreClient] Login response status:', response.status)
      console.log('[NcoreClient] Login response URL:', response.request?.res?.responseUrl || response.config.url)
      
      // Check if login was successful
      const responseHtml = response.data
      const hasUserData = responseHtml.includes('Feltöltés') || responseHtml.includes('Letöltés')
      const redirectedToIndex = response.request?.res?.responseUrl?.includes('/index.php')
      
      this.isLoggedIn = hasUserData || redirectedToIndex
      console.log('[NcoreClient] Login successful:', this.isLoggedIn)
      
      if (!this.isLoggedIn) {
        throw new Error('Login failed - invalid credentials or session issue')
      }
      
      return this.isLoggedIn
    } catch (error: any) {
      console.error('[NcoreClient] Login failed:', error.message)
      this.isLoggedIn = false
      throw new Error(`Login failed: ${error.message}`)
    }
  }

  async search(movieTitle: string): Promise<SearchResult> {
    if (!this.isLoggedIn) {
      await this.login()
    }

    const results: NcoreTorrent[] = []
    const categories = [
      SearchCategory.HD_HUN,    // Film (HUN HD) - prioritized
      SearchCategory.HD_ENG,    // Film (ENG HD) - prioritized
      SearchCategory.DVD_HUN,   // Film (HUN DVD)
      SearchCategory.DVD_ENG,   // Film (ENG DVD)
      SearchCategory.SD_HUN,    // Film (HUN SD)
      SearchCategory.SD_ENG     // Film (ENG SD)
    ]

    try {
      for (const category of categories) {
        try {
          // Python ncoreparser URL format: /torrents.php?oldal=1&tipus=<type>&kivalasztott_tipus=uploaded&rendez=desc&mire=<pattern>&miben=name
          const searchUrl = `/torrents.php?oldal=1&tipus=${category}&kivalasztott_tipus=seeders&rendez=DESC&mire=${encodeURIComponent(movieTitle)}&miben=name`
          
          console.log(`[NcoreClient] Searching category ${category} for: ${movieTitle}`)
          console.log(`[NcoreClient] URL: ${searchUrl}`)
          const response = await this.axiosInstance.get(searchUrl)
          console.log(`[NcoreClient] Response status: ${response.status}`)
          
          const html = parse(response.data)
          
          // Parse the torrent table - Python uses regex to find patterns
          const torrentRows = html.querySelectorAll('.box_torrent')
          console.log(`[NcoreClient] Found ${torrentRows.length} torrent rows in category ${category}`)
          
          // Check for "no results" message
          const noResultsDiv = html.querySelector('.lista_mini_error')
          if (noResultsDiv && noResultsDiv.text.includes('Nincs találat')) {
            console.log(`[NcoreClient] No results found in category ${category}`)
            continue
          }
          
          for (let i = 0; i < Math.min(torrentRows.length, 10); i++) {
            const row = torrentRows[i]
            
            try {
              // Python regex: onclick="torrent\(([0-9]+)\); return false;" title="(.*?)"
              const titleLink = row.querySelector('a[onclick*="torrent"]')
              if (!titleLink) continue
              
              const onclick = titleLink.getAttribute('onclick') || ''
              const torrentId = onclick.match(/torrent\((\d+)\)/)?.[1] || ''
              const title = titleLink.getAttribute('title') || titleLink.text.trim()
              
              if (!torrentId) continue
              
              const sizeElement = row.querySelector('.box_meret2')
              const seedersElement = row.querySelector('.box_s2 a')
              const leechersElement = row.querySelector('.box_l2 a')
              const uploadedElement = row.querySelector('.box_feltoltve2')
              
              const torrent: NcoreTorrent = {
                id: torrentId,
                title: title,
                type: category,
                size: sizeElement?.text.trim() || 'Unknown',
                seeders: parseInt(seedersElement?.text.trim() || '0'),
                leechers: parseInt(leechersElement?.text.trim() || '0'),
                uploaded: uploadedElement?.text.trim() || '',
                url: `https://ncore.pro/torrents.php?action=details&id=${torrentId}`
              }
              
              console.log(`[NcoreClient] Found torrent: ${title} (ID: ${torrentId}, Seeders: ${torrent.seeders})`)
              results.push(torrent)
            } catch (parseError) {
              console.error('[NcoreClient] Error parsing torrent row:', parseError)
              continue
            }
          }
        } catch (categoryError: any) {
          console.error(`Search failed for category ${category}:`, categoryError.message)
          continue
        }
      }

      // Sort by seeders
      results.sort((a, b) => b.seeders - a.seeders)

      return {
        success: true,
        torrents: results.slice(0, 20),
        count: results.length
      }
    } catch (error: any) {
      return {
        success: false,
        torrents: [],
        count: 0,
        error: error.message || 'Search failed'
      }
    }
  }

  async getMagnetLink(torrentId: string): Promise<MagnetResult> {
    if (!this.isLoggedIn) {
      await this.login()
    }

    try {
      // Download the torrent file - requires passkey parameter
      const downloadUrl = `/torrents.php?action=download&id=${torrentId}&key=${this.passkey}`
      console.log('[NcoreClient] Downloading torrent from:', downloadUrl)
      
      const response = await this.axiosInstance.get(downloadUrl, {
        responseType: 'arraybuffer'
      })

      console.log('[NcoreClient] Download response status:', response.status)
      console.log('[NcoreClient] Download response headers:', response.headers)
      console.log('[NcoreClient] Response data length:', response.data.length)
      console.log('[NcoreClient] First 100 bytes:', Buffer.from(response.data).slice(0, 100).toString('utf-8'))

      // Check if we got HTML instead of a torrent file
      const firstChar = Buffer.from(response.data)[0]
      console.log('[NcoreClient] First byte value:', firstChar, 'char:', String.fromCharCode(firstChar))
      
      if (firstChar === 60) { // '<' character (HTML)
        const htmlContent = Buffer.from(response.data).toString('utf-8')
        console.error('[NcoreClient] Got HTML instead of torrent file:', htmlContent.substring(0, 500))
        throw new Error('Failed to download torrent - got HTML response instead of torrent file. You may need to solve a CAPTCHA or re-login.')
      }

      // Parse the torrent file to create magnet link
      const torrentData = response.data
      const magnetLink = this.torrentToMagnet(torrentData)

      return {
        success: true,
        magnet: magnetLink
      }
    } catch (error: any) {
      console.error('[NcoreClient] getMagnetLink error:', error)
      return {
        success: false,
        error: error.message || 'Failed to get magnet link'
      }
    }
  }

  private torrentToMagnet(torrentBuffer: Buffer): string {
    try {
      console.log('[NcoreClient] Converting torrent to magnet, buffer size:', torrentBuffer.length)
      
      // Parse bencode torrent file
      const torrentData = bencode.decode(torrentBuffer)
      
      // Check if we have the info dictionary
      if (!torrentData.info) {
        throw new Error('Invalid torrent file: info dictionary not found')
      }
      
      // Calculate info hash from the bencoded info dictionary
      const infoBuffer = bencode.encode(torrentData.info)
      const infoHash = createHash('sha1').update(infoBuffer).digest('hex')
      
      console.log('[NcoreClient] Info hash:', infoHash)
      
      // Extract torrent name
      const name = torrentData.info.name?.toString('utf-8') || 'torrent'
      console.log('[NcoreClient] Torrent name:', name)
      
      // Build magnet link
      let magnet = `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(name)}`
      
      // Collect all trackers in a Set to avoid duplicates
      const trackers = new Set<string>()
      
      // Add tracker URLs from torrent file
      if (torrentData.announce) {
        const tracker = torrentData.announce.toString('utf-8')
        trackers.add(tracker)
        console.log('[NcoreClient] Added original tracker:', tracker)
      }
      
      // Add announce list trackers
      if (torrentData['announce-list'] && Array.isArray(torrentData['announce-list'])) {
        for (const tierList of torrentData['announce-list']) {
          if (Array.isArray(tierList)) {
            for (const trackerBuffer of tierList) {
              const tracker = trackerBuffer.toString('utf-8')
              trackers.add(tracker)
            }
          }
        }
        console.log('[NcoreClient] Added', torrentData['announce-list'].length, 'tracker tiers from torrent')
      }
      
      // Add public trackers to improve peer discovery for Webtor.io
      // These are reliable, high-performance public trackers that help with magnetization
      const publicTrackers = [
        'udp://tracker.opentrackr.org:1337/announce',
        'udp://open.stealth.si:80/announce',
        'udp://tracker.torrent.eu.org:451/announce',
        'udp://tracker.bittor.pw:1337/announce',
        'udp://public.popcorn-tracker.org:6969/announce',
        'udp://tracker.dler.org:6969/announce',
        'udp://exodus.desync.com:6969/announce',
        'udp://open.demonii.com:1337/announce',
        'udp://tracker.openbittorrent.com:6969/announce',
        'udp://tracker.internetwarriors.net:1337/announce',
        'udp://tracker.leechers-paradise.org:6969/announce',
        'udp://tracker.coppersurfer.tk:6969/announce',
        'udp://tracker.zer0day.to:1337/announce',
        'udp://eddie4.nl:6969/announce',
        'wss://tracker.openwebtorrent.com',
        'wss://tracker.webtorrent.dev',
        'wss://tracker.files.fm:7073/announce'
      ]
      
      for (const tracker of publicTrackers) {
        trackers.add(tracker)
      }
      
      console.log('[NcoreClient] Total trackers:', trackers.size)
      
      // Append all trackers to magnet link
      // Convert Set to Array for compatibility with older TypeScript targets
      const trackerList = Array.from(trackers)
      for (const tracker of trackerList) {
        magnet += `&tr=${encodeURIComponent(tracker)}`
      }
      
      console.log('[NcoreClient] Magnet link created successfully with', trackers.size, 'trackers')
      return magnet
    } catch (error: any) {
      console.error('[NcoreClient] Error converting torrent to magnet:', error)
      throw new Error(`Failed to convert torrent to magnet: ${error.message}`)
    }
  }

  async logout(): Promise<void> {
    try {
      // Logout endpoint may not exist or return 404, but clear session anyway
      await this.axiosInstance.get('/logout.php').catch(() => {})
      this.jar = new CookieJar() // Clear cookies
      this.isLoggedIn = false
      console.log('[NcoreClient] Logged out')
    } catch (error) {
      // Ignore logout errors
    }
  }
}
