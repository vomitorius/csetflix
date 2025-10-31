/**
 * Ncore.pro Client - TypeScript implementation
 * Replaces Python ncoreparser library for serverless environments
 */
import axios, { AxiosInstance } from 'axios'
import { parse } from 'node-html-parser'
import { createHash } from 'crypto'

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

  constructor(username: string, password: string) {
    this.username = username
    this.password = password
    
    this.axiosInstance = axios.create({
      baseURL: 'https://ncore.pro',
      timeout: 30000,
      withCredentials: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'hu-HU,hu;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    })
  }

  async login(): Promise<boolean> {
    try {
      // First, get the login page to get any CSRF tokens or cookies
      const loginPageResponse = await this.axiosInstance.get('/login.php')
      
      // Perform login
      const loginData = new URLSearchParams({
        'nev': this.username,
        'pass': this.password,
        'submitted': '1'
      })

      const response = await this.axiosInstance.post('/login.php', loginData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': 'https://ncore.pro/login.php'
        },
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400
      })

      // Check if login was successful by looking for redirect or checking response
      this.isLoggedIn = response.status === 302 || response.data.includes('logout.php')
      
      return this.isLoggedIn
    } catch (error: any) {
      console.error('Login failed:', error.message)
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
          const searchUrl = `/torrents.php?mire=${encodeURIComponent(movieTitle)}&miben=${category}&tipus=kivalasztottak_kozott&submit.x=0&submit.y=0&submit=Ok&tags=`
          
          console.log(`Searching Ncore category ${category} for: ${movieTitle}`)
          const response = await this.axiosInstance.get(searchUrl)
          const html = parse(response.data)
          
          // Parse the torrent table
          const torrentRows = html.querySelectorAll('.box_torrent')
          console.log(`Found ${torrentRows.length} torrent rows in category ${category}`)
          
          for (let i = 0; i < Math.min(torrentRows.length, 5); i++) {
            const row = torrentRows[i]
            
            try {
              // Extract torrent data from the HTML structure
              const titleElement = row.querySelector('.torrent_txt a, .torrent_txt2 a')
              const sizeElement = row.querySelector('.box_meret2')
              const seedersElement = row.querySelector('.box_s2 a')
              const leechersElement = row.querySelector('.box_l2 a')
              const uploadedElement = row.querySelector('.box_feltoltve2')
              
              if (titleElement) {
                const title = titleElement.text.trim()
                const torrentUrl = titleElement.getAttribute('href') || ''
                const torrentId = torrentUrl.match(/id=(\d+)/)?.[1] || ''
                
                const torrent: NcoreTorrent = {
                  id: torrentId,
                  title: title,
                  type: category,
                  size: sizeElement?.text.trim() || 'Unknown',
                  seeders: parseInt(seedersElement?.text.trim() || '0'),
                  leechers: parseInt(leechersElement?.text.trim() || '0'),
                  uploaded: uploadedElement?.text.trim() || '',
                  url: `https://ncore.pro${torrentUrl}`
                }
                
                results.push(torrent)
              }
            } catch (parseError) {
              console.error('Error parsing torrent row:', parseError)
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
      // Download the torrent file
      const downloadUrl = `/torrents.php?action=download&id=${torrentId}`
      const response = await this.axiosInstance.get(downloadUrl, {
        responseType: 'arraybuffer'
      })

      // Parse the torrent file to create magnet link
      const torrentData = response.data
      const magnetLink = this.torrentToMagnet(torrentData)

      return {
        success: true,
        magnet: magnetLink
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get magnet link'
      }
    }
  }

  private torrentToMagnet(torrentBuffer: Buffer): string {
    try {
      // Simple bencode parser for extracting info hash
      const torrentData = this.parseBencode(torrentBuffer)
      
      // Extract info dictionary
      const infoStart = torrentBuffer.indexOf(Buffer.from('4:info'))
      if (infoStart === -1) {
        throw new Error('Invalid torrent file: info dictionary not found')
      }
      
      // Find the info dictionary boundaries
      const infoDict = this.extractInfoDict(torrentBuffer, infoStart + 6)
      
      // Calculate info hash
      const infoHash = createHash('sha1').update(infoDict).digest('hex')
      
      // Extract name from torrent
      const nameMatch = torrentBuffer.toString('binary').match(/4:name\d+:([^]+?)(?:12:piece length|e|d)/)
      let name = 'torrent'
      if (nameMatch) {
        const nameLength = parseInt(nameMatch[0].match(/4:name(\d+):/)?.[1] || '0')
        const nameStart = torrentBuffer.indexOf(Buffer.from('4:name')) + 6 + nameLength.toString().length + 1
        name = torrentBuffer.slice(nameStart, nameStart + nameLength).toString('utf-8')
      }
      
      // Build magnet link
      let magnet = `magnet:?xt=urn:btih:${infoHash}&dn=${encodeURIComponent(name)}`
      
      // Add tracker URLs
      const trackerMatch = torrentBuffer.toString('binary').match(/8:announce\d+:([^]+?)(?:13:announce-list|d|e)/)
      if (trackerMatch) {
        const trackerLength = parseInt(trackerMatch[0].match(/8:announce(\d+):/)?.[1] || '0')
        const trackerStart = torrentBuffer.indexOf(Buffer.from('8:announce')) + 10 + trackerLength.toString().length + 1
        const tracker = torrentBuffer.slice(trackerStart, trackerStart + trackerLength).toString('utf-8')
        magnet += `&tr=${encodeURIComponent(tracker)}`
      }
      
      return magnet
    } catch (error: any) {
      throw new Error(`Failed to convert torrent to magnet: ${error.message}`)
    }
  }

  private extractInfoDict(buffer: Buffer, start: number): Buffer {
    // Extract the info dictionary by finding matching 'd' and 'e' markers
    let depth = 0
    let i = start
    const startPos = start
    
    while (i < buffer.length) {
      const char = buffer[i]
      
      if (char === 0x64) { // 'd' - dictionary start
        depth++
      } else if (char === 0x65) { // 'e' - dictionary/list end
        depth--
        if (depth === 0) {
          return buffer.slice(startPos - 1, i + 1)
        }
      } else if (char === 0x6c) { // 'l' - list start
        depth++
      }
      
      i++
    }
    
    throw new Error('Invalid torrent file structure')
  }

  private parseBencode(buffer: Buffer): any {
    // Simplified bencode parser - just for validation
    return { parsed: true }
  }

  async logout(): Promise<void> {
    try {
      await this.axiosInstance.get('/logout.php')
      this.isLoggedIn = false
    } catch (error) {
      // Ignore logout errors
    }
  }
}
