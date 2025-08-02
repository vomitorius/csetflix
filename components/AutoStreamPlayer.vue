<!-- Auto Stream Player - Automatically selects best torrent and starts streaming -->
<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
    <div class="w-full h-full max-w-7xl max-h-screen p-2 md:p-4">
      <div class="bg-gray-900 rounded-lg overflow-hidden h-full flex flex-col">
        <!-- Header -->
        <div class="flex justify-between items-center p-3 md:p-4 bg-gray-800 flex-shrink-0">
          <h3 class="text-white text-lg md:text-xl font-semibold truncate flex-1 mr-4">
            {{ movieTitle || 'Loading...' }}
          </h3>
          <button 
            @click="closePlayer"
            class="text-white hover:text-red-400 text-2xl md:text-3xl flex-shrink-0 w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
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
    bestTorrent.value = selectBestTorrent(allTorrents)
    console.log('🏆 Selected best torrent:', bestTorrent.value.name)
    
  } catch (err) {
    console.error('❌ Search failed:', err)
    throw new Error('Failed to search for torrents')
  }
}

function selectBestTorrent(torrents: any[]) {
  // Filter out torrents with very low seeders
  const viable = torrents.filter(t => (t.seeders || 0) >= 1)
  
  if (viable.length === 0) {
    return torrents[0] // Return first available if all have low seeders
  }
  
  // Score torrents based on multiple factors
  const scored = viable.map(torrent => {
    let score = 0
    
    // Seeder count (primary factor - 60% weight)
    score += (torrent.seeders || 0) * 0.6
    
    // Quality detection (20% weight)
    const name = torrent.name?.toLowerCase() || ''
    if (name.includes('1080p')) score += 50
    else if (name.includes('720p')) score += 30
    else if (name.includes('2160p') || name.includes('4k')) score += 40
    
    // Prefer standard formats (10% weight)
    if (name.includes('mp4') || name.includes('mkv')) score += 10
    
    // Size preference (10% weight) - prefer reasonable sizes
    const sizeStr = torrent.size || ''
    const sizeMatch = sizeStr.match(/(\d+\.?\d*)\s*(GB|MB)/i)
    if (sizeMatch) {
      const size = parseFloat(sizeMatch[1])
      const unit = sizeMatch[2].toUpperCase()
      const sizeInGB = unit === 'GB' ? size : size / 1024
      
      // Prefer 1-8GB range for movies
      if (sizeInGB >= 1 && sizeInGB <= 8) score += 15
      else if (sizeInGB >= 0.5 && sizeInGB <= 15) score += 10
    }
    
    return { ...torrent, score }
  })
  
  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score)
  
  console.log('🎯 Torrent scores:', scored.slice(0, 3).map(t => ({ 
    name: t.name?.substring(0, 50), 
    seeders: t.seeders, 
    score: t.score 
  })))
  
  return scored[0]
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
  emit('close')
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
  
  // Reset torrent store state
  torrentStore.resetSearchState()
}

onUnmounted(() => {
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