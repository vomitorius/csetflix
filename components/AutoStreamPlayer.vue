<!-- Auto Stream Player - Automatically selects best torrent and starts streaming -->
<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
    <div ref="playerContainerRef" class="w-full h-full max-w-7xl max-h-screen p-2 md:p-4" :class="{ 'max-w-none p-0': isFullscreen }">
      <div class="bg-gray-900 rounded-lg overflow-hidden h-full flex flex-col">
        <!-- Header -->
        <div class="flex justify-between items-center p-3 md:p-4 bg-gray-800 flex-shrink-0">
          <h3 class="text-white text-lg md:text-xl font-semibold truncate flex-1 mr-4">
            {{ movieTitle || 'Loading...' }}
          </h3>
          <div class="flex items-center gap-2">
            <!-- Change Source Button -->
            <button 
              @click="changeSource"
              class="text-white hover:text-orange-400 text-sm md:text-base px-2 py-1 rounded transition-colors border border-gray-600 hover:border-orange-400"
              :title="`Change source (${currentSourceIndex + 1}/${availableTorrents.length})`"
              v-if="!isLoading && !error && availableTorrents.length > 1"
              :disabled="isChangingSource"
            >
              <span v-if="isChangingSource" class="flex items-center gap-1">
                <div class="loading loading-spinner loading-xs"></div>
                <span class="hidden md:inline">Switching...</span>
              </span>
              <span v-else class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span class="hidden md:inline">Source {{ currentSourceIndex + 1 }}/{{ availableTorrents.length }}</span>
                <span class="md:hidden">{{ currentSourceIndex + 1 }}/{{ availableTorrents.length }}</span>
              </span>
            </button>
            <!-- Fullscreen Button -->
            <button 
              @click="toggleFullscreen"
              class="text-white hover:text-blue-400 text-xl p-1 rounded transition-colors"
              :title="isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'"
              v-if="!isLoading && !error"
            >
              <!-- Exit Fullscreen Icon -->
              <svg v-if="isFullscreen" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <!-- Enter Fullscreen Icon -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <!-- Close Button -->
            <button 
              @click="closePlayer"
              class="text-white hover:text-red-400 text-2xl md:text-3xl flex-shrink-0 w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="flex-1 flex items-center justify-center p-4">
          <div class="text-center text-white max-w-md">
            <div class="loading loading-spinner loading-lg text-red-600 mb-4"></div>
            <p class="text-lg mb-2">{{ loadingText }}</p>
            <p class="text-sm text-gray-400 mt-2">{{ statusText }}</p>
            
            <!-- Progress indicator for torrent search -->
            <div v-if="searchProgress.current > 0" class="mt-4">
              <div class="w-64 bg-gray-700 rounded-full h-2 mx-auto">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  :style="{ width: (searchProgress.current / searchProgress.total * 100) + '%' }"
                ></div>
              </div>
              <p class="text-xs text-gray-400 mt-2">
                {{ searchProgress.current }}/{{ searchProgress.total }} sources checked
              </p>
            </div>
          </div>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="flex-1 flex items-center justify-center p-4">
          <div class="text-center text-white max-w-md">
            <div class="text-red-500 text-4xl md:text-6xl mb-4">⚠️</div>
            <h3 class="text-lg font-semibold text-red-400 mb-2">Streaming Error</h3>
            <p class="text-gray-300 mb-4 text-sm md:text-base">{{ error }}</p>
            <div class="space-x-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button 
                @click="retryStream"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm md:text-base"
              >
                Retry
              </button>
              <button 
                @click="openWebtorInNewTab"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm md:text-base"
                v-if="bestTorrent"
              >
                Open in Webtor.io
              </button>
              <button 
                @click="closePlayer"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm md:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
        
        <!-- Webtor SDK Player Container -->
        <div v-else class="flex-1 min-h-0 relative">
          <div 
            :id="playerId" 
            class="webtor w-full h-full bg-gray-900"
            :class="{ 'opacity-0': webtorLoading }"
          />
          
          <!-- Loading overlay for Webtor player -->
          <div v-if="webtorLoading" class="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div class="text-center text-white">
              <div class="loading loading-spinner loading-lg text-red-600 mb-4"></div>
              <p class="text-lg mb-2">Initializing Player</p>
              <p class="text-sm text-gray-400">Setting up stream...</p>
            </div>
          </div>
        </div>
        
        <!-- Stream Info Footer -->
        <div v-if="!isLoading && !error && bestTorrent" class="p-3 md:p-4 bg-gray-800 text-white text-xs md:text-sm flex-shrink-0">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <div class="truncate">
              <span class="text-gray-400">Quality:</span> {{ getBestQuality() }}
            </div>
            <div class="truncate">
              <span class="text-gray-400">Size:</span> {{ bestTorrent.size || 'Unknown' }}
            </div>
            <div class="truncate">
              <span class="text-gray-400">Seeders:</span> {{ bestTorrent.seeders || 0 }}
            </div>
            <div class="truncate">
              <span class="text-gray-400">Source:</span> {{ bestTorrent.source || 'Auto' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTorrentStore } from '~/stores/torrent'

interface Props {
  movieTitle?: string
  isVisible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  movieTitle: 'Loading...'
})
const emit = defineEmits<{
  close: []
}>()

const torrentStore = useTorrentStore()

const isLoading = ref(true)
const error = ref<string>('')
const loadingText = ref('Finding best stream...')
const statusText = ref('Searching torrent sources')
const webtorLoading = ref(false)
const playerId = ref(`webtor-auto-${Date.now()}`)
const bestTorrent = ref<any>(null)
const magnetUri = ref('')
const webtorUrl = ref('')
const isFullscreen = ref(false)
const playerContainerRef = ref<HTMLDivElement>()

// New variables for source switching
const availableTorrents = ref<any[]>([])
const currentSourceIndex = ref(0)
const isChangingSource = ref(false)

const searchProgress = ref({
  current: 0,
  total: 2 // TorrentIO + BitSearch
})

// Load Webtor SDK script
const loadWebtorSDK = () => {
  return new Promise<void>((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).webtor) {
      resolve()
      return
    }

    const tryLoadFromCDN = () => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@webtor/embed-sdk-js/dist/index.min.js'
      script.charset = 'utf-8'
      script.async = true
      
      script.onload = () => {
        console.log('✅ Webtor SDK loaded successfully')
        resolve()
      }
      
      script.onerror = () => {
        console.warn('⚠️ CDN blocked, using fallback...')
        document.head.removeChild(script)
        useFallbackImplementation()
        resolve()
      }
      
      document.head.appendChild(script)
    }

    const useFallbackImplementation = () => {
      (window as any).webtor = (window as any).webtor || []
      ;(window as any).webtor.push = function(config: any) {
        const element = document.getElementById(config.id)
        if (element) {
          const encodedMagnet = encodeURIComponent(config.magnet)
          const encodedTitle = encodeURIComponent(config.title || 'Movie')
          const iframe = document.createElement('iframe')
          iframe.src = `https://webtor.io/web?magnet=${encodedMagnet}&lang=en&title=${encodedTitle}&autoplay=1`
          iframe.style.width = '100%'
          iframe.style.height = '100%'
          iframe.style.border = 'none'
          iframe.allowFullscreen = true
          iframe.allow = 'autoplay; encrypted-media; fullscreen'
          iframe.setAttribute('allowfullscreen', 'true')
          iframe.setAttribute('webkitallowfullscreen', 'true')
          iframe.setAttribute('mozallowfullscreen', 'true')
          element.innerHTML = ''
          element.appendChild(iframe)
          
          setTimeout(() => {
            if (config.on) {
              config.on('ready', {})
            }
          }, 2000)
        }
      }
    }

    tryLoadFromCDN()
  })
}

watch(() => props.isVisible, async (visible) => {
  if (visible && props.movieTitle) {
    await initializeAutoStream()
  } else if (!visible) {
    cleanup()
  }
}, { immediate: true })

// Set up fullscreen event listeners
onMounted(() => {
  if (typeof window !== 'undefined') {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)
  }
})

async function initializeAutoStream() {
  console.log('🚀 Starting auto stream for:', props.movieTitle)
  
  isLoading.value = true
  error.value = ''
  webtorLoading.value = false
  bestTorrent.value = null
  loadingText.value = 'Finding best stream...'
  statusText.value = 'Searching torrent sources'
  searchProgress.value.current = 0
  
  try {
    // Search for torrents from multiple sources
    await searchTorrents()
    
    if (!bestTorrent.value) {
      throw new Error('No suitable torrents found for streaming')
    }
    
    loadingText.value = 'Preparing stream...'
    statusText.value = 'Setting up Webtor player'
    
    // Get magnet URI
    await getMagnetUri()
    
    if (!magnetUri.value) {
      throw new Error('Failed to get magnet link')
    }
    
    // Load Webtor SDK and setup player
    await loadWebtorSDK()
    webtorLoading.value = true
    isLoading.value = false
    
    await nextTick()
    await setupWebtor()
    
  } catch (err) {
    console.error('❌ Auto stream failed:', err)
    error.value = (err as Error).message || 'Failed to start streaming'
    isLoading.value = false
    webtorLoading.value = false
  }
}

async function searchTorrents() {
  try {
    // Start both searches simultaneously
    const promises = [
      torrentStore.searchTorrents(props.movieTitle),
      // Give a small delay to update progress
      new Promise(resolve => setTimeout(resolve, 500))
    ]
    
    // Update progress as searches complete
    searchProgress.value.current = 1
    statusText.value = 'Checking TorrentIO and BitSearch...'
    
    await Promise.all(promises)
    searchProgress.value.current = 2
    
    // Combine results from both sources
    const allTorrents = [
      ...torrentStore.searchResults,
      ...torrentStore.titleSearchResults
    ]
    
    console.log('📊 Found torrents:', allTorrents.length)
    
    if (allTorrents.length === 0) {
      throw new Error('No torrents found')
    }
    
    // Select best torrent based on seeders and quality
    const allTorrentsList = selectBestTorrents(allTorrents)
    availableTorrents.value = allTorrentsList
    currentSourceIndex.value = 0
    bestTorrent.value = allTorrentsList[0]
    console.log('🏆 Selected best torrent:', bestTorrent.value.name)
    console.log('📋 Available alternatives:', allTorrentsList.length)
    
  } catch (err) {
    console.error('❌ Search failed:', err)
    throw new Error('Failed to search for torrents')
  }
}

function selectBestTorrents(torrents: any[]) {
  // Filter out torrents with very low seeders and invalid resolutions
  const viable = torrents.filter(t => {
    const seeders = t.seeders || 0
    const name = t.name?.toLowerCase() || ''
    
    // Must have at least 1 seeder
    if (seeders < 1) return false
    
    // Reject torrents with resolution higher than 1080p (as per requirements)
    if (name.includes('2160p') || name.includes('4k') || name.includes('2k')) {
      console.log('🚫 Rejecting high-res torrent:', t.name?.substring(0, 50))
      return false
    }
    
    // Must have a valid magnet link or way to get one
    if (!t.magnetLink && !t.magnet && !t.infoHash && !t.link) {
      console.log('🚫 Rejecting torrent without magnet:', t.name?.substring(0, 50))
      return false
    }
    
    return true
  })
  
  if (viable.length === 0) {
    console.warn('⚠️ No viable torrents found, using first available')
    return torrents.slice(0, 5) // Return first 5 available if all are filtered out
  }
  
  // Score torrents based on multiple factors with focus on seeders and 1080p max
  const scored = viable.map(torrent => {
    let score = 0
    const name = torrent.name?.toLowerCase() || ''
    
    // Seeder count (primary factor - 70% weight, increased importance)
    score += (torrent.seeders || 0) * 0.7
    
    // Quality detection (25% weight) - cap at 1080p as per requirements
    if (name.includes('1080p')) score += 60        // Highest score for 1080p
    else if (name.includes('720p')) score += 40    // Good score for 720p
    else if (name.includes('480p')) score += 20    // Lower score for 480p
    // Note: 4K/2160p already filtered out above
    
    // Movie title matching (bonus points for better matches)
    const movieWords = props.movieTitle?.toLowerCase().split(/\s+/) || []
    const torrentWords = name.split(/\s+/)
    let matchCount = 0
    
    movieWords.forEach(word => {
      if (word.length > 2 && torrentWords.some(tw => tw.includes(word) || word.includes(tw))) {
        matchCount++
      }
    })
    
    // Bonus for title matching (up to 15 points)
    score += Math.min(matchCount * 3, 15)
    
    // Prefer standard formats (5% weight)
    if (name.includes('mp4') || name.includes('mkv') || name.includes('avi')) score += 8
    
    // Size preference - reject extremely large files that might be wrong content
    const sizeStr = torrent.size || ''
    const sizeMatch = sizeStr.match(/(\d+\.?\d*)\s*(GB|MB)/i)
    if (sizeMatch) {
      const size = parseFloat(sizeMatch[1])
      const unit = sizeMatch[2].toUpperCase()
      const sizeInGB = unit === 'GB' ? size : size / 1024
      
      // Prefer reasonable movie sizes (1-4GB for 1080p, 0.5-2GB for 720p)
      if (name.includes('1080p')) {
        if (sizeInGB >= 1.5 && sizeInGB <= 4) score += 12
        else if (sizeInGB >= 1 && sizeInGB <= 6) score += 8
        else if (sizeInGB > 10) score -= 20 // Penalize very large files
      } else if (name.includes('720p')) {
        if (sizeInGB >= 0.8 && sizeInGB <= 2.5) score += 12
        else if (sizeInGB >= 0.5 && sizeInGB <= 4) score += 8
        else if (sizeInGB > 8) score -= 15 // Penalize very large files
      } else {
        // For other qualities, prefer moderate sizes
        if (sizeInGB >= 0.5 && sizeInGB <= 3) score += 8
        else if (sizeInGB > 6) score -= 10
      }
    }
    
    return { ...torrent, score }
  })
  
  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score)
  
  console.log('🎯 Torrent selection results:', scored.slice(0, 5).map(t => ({ 
    name: t.name?.substring(0, 60), 
    seeders: t.seeders, 
    score: Math.round(t.score * 10) / 10,
    size: t.size,
    source: t.source
  })))
  
  const selected = scored[0]
  console.log('🏆 Selected torrent:', {
    name: selected.name?.substring(0, 80),
    seeders: selected.seeders,
    score: Math.round(selected.score * 10) / 10,
    source: selected.source
  })
  
  // Return top 10 alternatives for source switching
  return scored.slice(0, 10)
}

function validateTorrentForMovie(torrent: any, movieTitle: string): boolean {
  // Extract display name from magnet link or use torrent name
  let torrentName = ''
  
  if (torrent.magnetLink || torrent.magnet) {
    const magnetUri = torrent.magnetLink || torrent.magnet
    const dnMatch = magnetUri.match(/dn=([^&]+)/)
    if (dnMatch) {
      torrentName = decodeURIComponent(dnMatch[1].replace(/\+/g, ' ')).toLowerCase()
    }
  }
  
  // Fallback to torrent name if no display name in magnet
  if (!torrentName && torrent.name) {
    torrentName = torrent.name.toLowerCase()
  }
  
  if (!torrentName) {
    console.warn('⚠️ Cannot validate torrent - no name available')
    return true // Allow if we can't determine name
  }
  
  // Split movie title into words and check for matches
  const movieWords = movieTitle.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove special characters
    .split(/\s+/)
    .filter(word => word.length > 2) // Only consider words longer than 2 chars
  
  // Check if at least half of the significant movie title words are in torrent name
  let matchCount = 0
  movieWords.forEach(word => {
    if (torrentName.includes(word)) {
      matchCount++
    }
  })
  
  const matchRatio = movieWords.length > 0 ? matchCount / movieWords.length : 0
  const isValid = matchRatio >= 0.4 // At least 40% of words should match
  
  console.log('🔍 Torrent validation:', {
    torrentName: torrentName.substring(0, 60),
    movieWords: movieWords.join(', '),
    matchCount,
    matchRatio: Math.round(matchRatio * 100) + '%',
    isValid
  })
  
  return isValid
}

async function getMagnetUri() {
  try {
    if (bestTorrent.value.magnet) {
      magnetUri.value = bestTorrent.value.magnet
    } else if (bestTorrent.value.magnetLink) {
      magnetUri.value = bestTorrent.value.magnetLink
    } else if (bestTorrent.value.infoHash) {
      magnetUri.value = `magnet:?xt=urn:btih:${bestTorrent.value.infoHash}&dn=${encodeURIComponent(bestTorrent.value.name)}`
    } else {
      // Try to get magnet link via the store
      await torrentStore.getMagnetLink(bestTorrent.value)
      magnetUri.value = torrentStore.currentMagnet
    }
    
    if (!magnetUri.value) {
      throw new Error('Could not obtain magnet URI')
    }
    
    // Validate that the magnet URI actually matches the movie we're looking for
    const isValid = validateTorrentForMovie(bestTorrent.value, props.movieTitle)
    if (!isValid) {
      console.warn('⚠️ Selected torrent may not match the movie, but proceeding anyway')
      // Note: We proceed anyway but log the warning since perfect matching is difficult
    }
    
    // Create Webtor URL for fallback
    const encodedMagnet = encodeURIComponent(magnetUri.value)
    const encodedTitle = encodeURIComponent(props.movieTitle)
    webtorUrl.value = `https://webtor.io/web?magnet=${encodedMagnet}&lang=en&title=${encodedTitle}&autoplay=1`
    
  } catch (err) {
    console.error('❌ Failed to get magnet URI:', err)
    throw new Error('Failed to get streaming link')
  }
}

async function setupWebtor() {
  try {
    if (typeof window !== 'undefined' && (window as any).webtor) {
      const webtor = (window as any).webtor = (window as any).webtor || []
      
      const playerConfig = {
        id: playerId.value,
        magnet: magnetUri.value,
        title: props.movieTitle,
        width: '100%',
        height: '100%',
        lang: 'en',
        controls: true,
        header: false, // Hide header for cleaner look
        autoplay: true, // Enable autoplay
        on: (event: string, data: any) => {
          console.log('🎮 Webtor event:', event, data)
          
          switch (event) {
            case 'ready':
              webtorLoading.value = false
              console.log('✅ Player ready')
              break
            case 'error':
              console.error('❌ Player error:', data)
              error.value = data.message || 'Player error occurred'
              webtorLoading.value = false
              break
            case 'play':
              console.log('▶️ Playback started')
              break
          }
        }
      }
      
      console.log('🔧 Setting up Webtor player')
      webtor.push(playerConfig)
      
      // Timeout fallback
      setTimeout(() => {
        if (webtorLoading.value) {
          console.log('⏰ Player setup timeout, considering ready')
          webtorLoading.value = false
        }
      }, 10000)
      
    } else {
      throw new Error('Webtor SDK not available')
    }
  } catch (err) {
    console.error('❌ Webtor setup failed:', err)
    error.value = 'Failed to setup player'
    webtorLoading.value = false
  }
}

function getBestQuality() {
  if (!bestTorrent.value?.name) return 'Unknown'
  
  const name = bestTorrent.value.name.toLowerCase()
  if (name.includes('2160p') || name.includes('4k')) return '4K'
  if (name.includes('1080p')) return '1080p'
  if (name.includes('720p')) return '720p'
  if (name.includes('480p')) return '480p'
  return 'SD'
}

function retryStream() {
  console.log('🔄 Retrying stream...')
  cleanup()
  setTimeout(() => {
    initializeAutoStream()
  }, 1000)
}

function openWebtorInNewTab() {
  if (webtorUrl.value) {
    window.open(webtorUrl.value, '_blank')
  }
}

function closePlayer() {
  console.log('🚪 Closing auto stream player')
  // Exit fullscreen if active before closing
  if (isFullscreen.value) {
    exitFullscreen()
  }
  emit('close')
}

// Fullscreen functionality
function toggleFullscreen() {
  if (isFullscreen.value) {
    exitFullscreen()
  } else {
    enterFullscreen()
  }
}

function enterFullscreen() {
  // Find the iframe element within the webtor container
  const webtorContainer = document.getElementById(playerId.value)
  if (!webtorContainer) {
    console.error('Webtor container not found')
    return
  }
  
  // Function to attempt fullscreen on iframe
  const attemptFullscreen = () => {
    const iframe = webtorContainer.querySelector('iframe')
    if (!iframe) {
      return false
    }
    
    try {
      // Request fullscreen on the iframe element itself
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen()
      } else if ((iframe as any).webkitRequestFullscreen) {
        (iframe as any).webkitRequestFullscreen()
      } else if ((iframe as any).mozRequestFullScreen) {
        (iframe as any).mozRequestFullScreen()
      } else if ((iframe as any).msRequestFullscreen) {
        (iframe as any).msRequestFullscreen()
      }
      console.log('🖥️ Requesting fullscreen for iframe')
      return true
    } catch (err) {
      console.error('Failed to enter fullscreen:', err)
      return false
    }
  }
  
  // Try immediately first
  if (attemptFullscreen()) {
    return
  }
  
  // If iframe not found, wait a bit and try again (for when webtor is still loading)
  console.log('🔄 Iframe not ready, waiting for webtor to load...')
  let attempts = 0
  const maxAttempts = 10
  const retryInterval = setInterval(() => {
    attempts++
    if (attemptFullscreen() || attempts >= maxAttempts) {
      clearInterval(retryInterval)
      if (attempts >= maxAttempts) {
        console.warn('⚠️ Could not find iframe for fullscreen after multiple attempts')
      }
    }
  }, 500)
}

function exitFullscreen() {
  try {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen()
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen()
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen()
    }
  } catch (err) {
    console.error('Failed to exit fullscreen:', err)
  }
}

// Handle fullscreen state changes
function handleFullscreenChange() {
  const fullscreenEl = document.fullscreenElement || 
                      (document as any).webkitFullscreenElement || 
                      (document as any).mozFullScreenElement || 
                      (document as any).msFullscreenElement
  
  // Check if the fullscreen element is an iframe within our webtor container
  const webtorContainer = document.getElementById(playerId.value)
  const iframe = webtorContainer?.querySelector('iframe')
  
  isFullscreen.value = !!fullscreenEl && fullscreenEl === iframe
  console.log('🖥️ Auto player fullscreen state changed:', isFullscreen.value)
}

async function changeSource() {
  if (isChangingSource.value || availableTorrents.value.length <= 1) return
  
  try {
    isChangingSource.value = true
    console.log('🔄 Changing torrent source...')
    
    // Move to next torrent in the list
    currentSourceIndex.value = (currentSourceIndex.value + 1) % availableTorrents.value.length
    const newTorrent = availableTorrents.value[currentSourceIndex.value]
    
    console.log('🎯 Switching to torrent:', {
      name: newTorrent.name?.substring(0, 80),
      seeders: newTorrent.seeders,
      source: newTorrent.source,
      index: currentSourceIndex.value + 1,
      total: availableTorrents.value.length
    })
    
    // Update current torrent
    bestTorrent.value = newTorrent
    
    // Clear existing player
    const playerElement = document.getElementById(playerId.value)
    if (playerElement) {
      playerElement.innerHTML = ''
    }
    
    // Get new magnet URI
    await getMagnetUri()
    
    if (!magnetUri.value) {
      throw new Error('Failed to get magnet link for new source')
    }
    
    // Create new player ID to ensure fresh webtor instance
    playerId.value = `webtor-auto-${Date.now()}`
    
    // Wait for DOM update
    await nextTick()
    
    // Setup webtor with new source
    webtorLoading.value = true
    await setupWebtor()
    
    console.log('✅ Successfully switched to new torrent source')
    
  } catch (err) {
    console.error('❌ Failed to change source:', err)
    // Revert to previous source on error
    currentSourceIndex.value = currentSourceIndex.value > 0 ? currentSourceIndex.value - 1 : availableTorrents.value.length - 1
    bestTorrent.value = availableTorrents.value[currentSourceIndex.value]
    
    // Show error message briefly
    error.value = 'Failed to switch source. Reverted to previous.'
    setTimeout(() => {
      error.value = ''
    }, 3000)
  } finally {
    isChangingSource.value = false
  }
}

function cleanup() {
  console.log('🧹 Cleaning up auto stream...')
  
  if (typeof window !== 'undefined') {
    const playerElement = document.getElementById(playerId.value)
    if (playerElement) {
      playerElement.innerHTML = ''
    }
  }
  
  // Reset state
  isLoading.value = true
  error.value = ''
  webtorLoading.value = false
  bestTorrent.value = null
  magnetUri.value = ''
  webtorUrl.value = ''
  playerId.value = `webtor-auto-${Date.now()}`
  searchProgress.value.current = 0
  
  // Reset source switching state
  availableTorrents.value = []
  currentSourceIndex.value = 0
  isChangingSource.value = false
  
  // Reset torrent store state
  torrentStore.resetSearchState()
}

onUnmounted(() => {
  // Clean up fullscreen event listeners
  if (typeof window !== 'undefined') {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
    document.removeEventListener('msfullscreenchange', handleFullscreenChange)
  }
  
  // Exit fullscreen if active
  if (isFullscreen.value) {
    exitFullscreen()
  }
  
  cleanup()
})
</script>

<style scoped>
/* Ensure proper mobile scaling */
@media (max-width: 768px) {
  .webtor {
    min-height: 300px;
  }
}

/* Hide scrollbars on mobile for cleaner look */
@media (max-width: 768px) {
  ::-webkit-scrollbar {
    display: none;
  }
  * {
    scrollbar-width: none;
  }
}
</style>