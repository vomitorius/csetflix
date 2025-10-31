<!-- Ncore Stream Player - Plays torrents from Ncore using native WebTorrent -->
<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
    <div ref="playerContainerRef" class="w-full h-full max-w-7xl max-h-screen p-2 md:p-4" :class="{ 'max-w-none p-0': isFullscreen }">
      <div class="bg-gray-900 rounded-lg overflow-hidden h-full flex flex-col">
        <!-- Header -->
        <div class="flex justify-between items-center p-3 md:p-4 bg-gray-800 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="bg-green-600 text-white px-3 py-1 rounded font-bold text-sm">NCORE</div>
            <h3 class="text-white text-lg md:text-xl font-semibold truncate flex-1 mr-4">
              {{ displayTitle || 'Loading...' }}
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <!-- Fullscreen Button -->
            <button 
              @click="toggleFullscreen"
              class="text-white hover:text-blue-400 text-xl p-1 rounded transition-colors"
              :title="isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'"
              v-if="!isLoading && !error && videoElement"
            >
              <svg v-if="isFullscreen" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
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
            <div class="loading loading-spinner loading-lg text-green-600 mb-4"></div>
            <p class="text-lg mb-2">{{ loadingText }}</p>
            <p class="text-sm text-gray-400 mt-2">{{ statusText }}</p>
            <div v-if="downloadProgress > 0" class="mt-4">
              <div class="w-64 bg-gray-700 rounded-full h-2 mx-auto">
                <div 
                  class="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  :style="{ width: downloadProgress + '%' }"
                ></div>
              </div>
              <p class="text-xs text-gray-400 mt-2">{{ downloadProgress.toFixed(1) }}% letöltve</p>
            </div>
          </div>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="flex-1 flex items-center justify-center p-4">
          <div class="text-center text-white max-w-md">
            <div class="text-red-500 text-4xl md:text-6xl mb-4">⚠️</div>
            <h3 class="text-lg font-semibold text-red-400 mb-2">Lejátszási hiba</h3>
            <p class="text-gray-300 mb-4 text-sm md:text-base">{{ error }}</p>
            <div class="space-x-2 flex flex-col sm:flex-row gap-2 justify-center">
              <button 
                @click="retryStream"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm md:text-base"
              >
                Újra próbálkozás
              </button>
              <button 
                @click="closePlayer"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm md:text-base"
              >
                Bezárás
              </button>
            </div>
          </div>
        </div>
        
        <!-- Video Player -->
        <div v-else class="flex-1 min-h-0 relative">
          <video
            ref="videoElement"
            class="w-full h-full bg-black"
            controls
            autoplay
            @loadstart="onVideoLoadStart"
            @loadeddata="onVideoLoaded"
            @error="onVideoError"
          />
        </div>
        
        <!-- Stream Info Footer -->
        <div v-if="!isLoading && !error" class="p-3 md:p-4 bg-gray-800 text-white text-xs md:text-sm flex-shrink-0">
          <div class="flex items-center gap-4 flex-wrap">
            <div class="flex items-center gap-2">
              <span class="text-gray-400">Forrás:</span>
              <span class="text-green-400 font-semibold">Ncore.pro</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-400">Állapot:</span>
              <span class="text-green-400">{{ streamStatus }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-400">Peers:</span>
              <span class="text-blue-400">{{ peerCount }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-400">Letöltés:</span>
              <span class="text-blue-400">{{ downloadSpeed }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-gray-400">Feltöltés:</span>
              <span class="text-blue-400">{{ uploadSpeed }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Add global WebTorrent type declaration
declare global {
  interface Window {
    WebTorrent: any
  }
}

interface Props {
  movieTitle?: string
  magnetLink: string
  isVisible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  movieTitle: 'Loading...',
  magnetLink: ''
})

const emit = defineEmits<{
  close: []
}>()

const videoElement = ref<HTMLVideoElement>()
const isLoading = ref(true)
const error = ref<string>('')
const loadingText = ref('Lejátszás indítása...')
const statusText = ref('WebTorrent inicializálása')
const isFullscreen = ref(false)
const playerContainerRef = ref<HTMLDivElement>()
const displayTitle = ref('')
const streamStatus = ref('Kapcsolódás')
const downloadProgress = ref(0)
const peerCount = ref(0)
const downloadSpeed = ref('0 B/s')
const uploadSpeed = ref('0 B/s')

let client: any = null
let torrent: any = null

// Load WebTorrent from CDN
function loadWebTorrentFromCDN(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.WebTorrent) {
      resolve()
      return
    }
    
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/webtorrent@latest/webtorrent.min.js'
    script.onload = () => {
      console.log('✅ WebTorrent loaded successfully')
      resolve()
    }
    script.onerror = () => {
      console.error('❌ Failed to load WebTorrent from CDN')
      reject(new Error('Failed to load WebTorrent from CDN'))
    }
    document.head.appendChild(script)
  })
}

watch(() => props.isVisible, async (visible) => {
  if (visible && props.magnetLink) {
    await initializeStream()
  } else if (!visible) {
    cleanup()
  }
}, { immediate: true })

onMounted(() => {
  if (typeof window !== 'undefined') {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)
  }
})

async function initializeStream() {
  console.log('🚀 Starting Ncore stream for:', props.movieTitle)
  
  isLoading.value = true
  error.value = ''
  loadingText.value = 'Lejátszás indítása...'
  statusText.value = 'WebTorrent inicializálása'
  streamStatus.value = 'Kapcsolódás'
  displayTitle.value = props.movieTitle || 'Loading...'
  
  try {
    if (!props.magnetLink) {
      throw new Error('Nincs magnet link')
    }
    
    // Cleanup previous session
    cleanup()
    
    // Load WebTorrent from CDN if not already loaded
    if (process.client) {
      if (!window.WebTorrent) {
        loadingText.value = 'WebTorrent betöltése...'
        statusText.value = 'Torrent könyvtár betöltése'
        await loadWebTorrentFromCDN()
      }
      
      // Create WebTorrent client
      statusText.value = 'Torrent kliens létrehozása...'
      client = new window.WebTorrent()
      
      loadingText.value = 'Torrent hozzáadása...'
      statusText.value = 'Magnet link feldolgozása'
      
      // Add torrent with WebTorrent trackers
      torrent = client.add(props.magnetLink, {
        announce: [
          'wss://tracker.btorrent.xyz',
          'wss://tracker.openwebtorrent.com',
          'wss://tracker.webtorrent.io'
        ]
      })
      
      setupTorrentEvents()
    } else {
      error.value = 'WebTorrent böngésző környezetet igényel'
      isLoading.value = false
    }
    
  } catch (err) {
    console.error('❌ Stream failed:', err)
    error.value = (err as Error).message || 'Nem sikerült elindítani a lejátszást'
    isLoading.value = false
  }
}

function setupTorrentEvents() {
  if (!torrent) return
  
  torrent.on('metadata', () => {
    console.log('📦 Torrent metadata fogadva')
    loadingText.value = 'Videó fájl keresése...'
    statusText.value = `${torrent!.files.length} fájl találva`
    
    // Find the largest video file
    const videoFile = torrent!.files.find((file: any) => 
      /\.(mp4|avi|mkv|mov|wmv|flv|webm|m4v)$/i.test(file.name)
    ) || torrent!.files.reduce((largest: any, file: any) => 
      file.length > largest.length ? file : largest
    )
    
    if (videoFile) {
      displayTitle.value = videoFile.name
      loadingText.value = 'Videó stream előkészítése...'
      statusText.value = `Streaming: ${videoFile.name}`
      
      // Render video to video element
      if (videoElement.value) {
        videoFile.renderTo(videoElement.value, {
          autoplay: true,
          controls: true
        })
        
        // Hide loading after a short delay to allow video to start
        setTimeout(() => {
          isLoading.value = false
          streamStatus.value = 'Streaming'
        }, 1000)
      }
    } else {
      error.value = 'Nem található videó fájl a torrentben'
      isLoading.value = false
    }
  })
  
  torrent.on('download', () => {
    if (torrent) {
      downloadProgress.value = (torrent.progress * 100)
      downloadSpeed.value = formatBytes(torrent.downloadSpeed) + '/s'
      uploadSpeed.value = formatBytes(torrent.uploadSpeed) + '/s'
    }
  })
  
  torrent.on('wire', () => {
    if (torrent) {
      peerCount.value = torrent.numPeers
    }
  })
  
  torrent.on('error', (err: Error) => {
    console.error('❌ Torrent hiba:', err)
    error.value = 'Torrent hiba: ' + err.message
    isLoading.value = false
  })
  
  torrent.on('ready', () => {
    console.log('✅ Torrent kész')
    streamStatus.value = 'Kész'
  })
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function retryStream() {
  console.log('🔄 Retrying stream...')
  cleanup()
  setTimeout(() => {
    initializeStream()
  }, 500)
}

function onVideoLoadStart() {
  console.log('📹 Videó betöltés indult')
}

function onVideoLoaded() {
  console.log('✅ Videó sikeresen betöltve')
  streamStatus.value = 'Lejátszás'
}

function onVideoError(event: Event) {
  console.error('❌ Videó hiba:', event)
  error.value = 'Videó lejátszási hiba. A fájl lehet, hogy sérült vagy nem támogatott formátumú.'
}

function closePlayer() {
  console.log('🚪 Closing Ncore stream player')
  if (isFullscreen.value) {
    exitFullscreen()
  }
  cleanup()
  emit('close')
}

function toggleFullscreen() {
  if (isFullscreen.value) {
    exitFullscreen()
  } else {
    enterFullscreen()
  }
}

function enterFullscreen() {
  if (!videoElement.value) return
  
  try {
    if (videoElement.value.requestFullscreen) {
      videoElement.value.requestFullscreen()
    } else if ((videoElement.value as any).webkitRequestFullscreen) {
      (videoElement.value as any).webkitRequestFullscreen()
    } else if ((videoElement.value as any).mozRequestFullScreen) {
      (videoElement.value as any).mozRequestFullScreen()
    } else if ((videoElement.value as any).msRequestFullscreen) {
      (videoElement.value as any).msRequestFullscreen()
    }
  } catch (err) {
    console.error('Fullscreen hiba:', err)
  }
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
    console.error('Exit fullscreen hiba:', err)
  }
}

function handleFullscreenChange() {
  const fullscreenEl = document.fullscreenElement || 
                      (document as any).webkitFullscreenElement || 
                      (document as any).mozFullScreenElement || 
                      (document as any).msFullscreenElement
  
  isFullscreen.value = !!fullscreenEl && fullscreenEl === videoElement.value
}

function cleanup() {
  console.log('🧹 Cleaning up Ncore stream...')
  
  // Destroy torrent and client
  if (torrent) {
    torrent.destroy()
    torrent = null
  }
  
  if (client) {
    client.destroy()
    client = null
  }
  
  // Reset state
  isLoading.value = true
  error.value = ''
  downloadProgress.value = 0
  peerCount.value = 0
  downloadSpeed.value = '0 B/s'
  uploadSpeed.value = '0 B/s'
  streamStatus.value = 'Lecsatlakozva'
  displayTitle.value = props.movieTitle || 'Loading...'
}

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
    document.removeEventListener('msfullscreenchange', handleFullscreenChange)
  }
  
  if (isFullscreen.value) {
    exitFullscreen()
  }
  
  cleanup()
})
</script>

<style scoped>
video {
  object-fit: contain;
}

@media (max-width: 768px) {
  video {
    min-height: 300px;
  }
}
</style>
