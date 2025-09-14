<!-- Updated to use Webtor SDK -->
<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
    <div ref="playerContainerRef" class="w-full h-full max-w-6xl max-h-screen p-4" :class="{ 'max-w-none p-0': isFullscreen }">
      <div class="bg-black rounded-lg overflow-hidden h-full flex flex-col">
        <!-- Header -->
        <div class="flex justify-between items-center p-4 bg-gray-800">
          <h3 class="text-white text-lg font-semibold">
            {{ movieTitle || 'Torrent Player' }}
          </h3>
          <div class="flex items-center gap-2">
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
              class="text-white hover:text-red-400 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="flex-1 flex items-center justify-center">
          <div class="text-center text-white">
            <div class="loading loading-spinner loading-lg text-red-600 mb-4"></div>
            <p class="text-lg mb-2">{{ loadingText }}</p>
            <p class="text-sm text-gray-400 mt-2">
              Setting up stream with Webtor SDK...
            </p>
          </div>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="flex-1 flex items-center justify-center">
          <div class="text-center text-white max-w-md">
            <div class="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 class="text-lg font-semibold text-red-400 mb-2">Stream Error</h3>
            <p class="text-gray-300 mb-4">{{ error }}</p>
            <div class="space-x-2">
              <button 
                @click="retryStream"
                class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Retry
              </button>
              <button 
                @click="openInNewTab"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Open in Webtor.io
              </button>
              <button 
                @click="closePlayer"
                class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
        
        <!-- Webtor SDK Player Container -->
        <div v-else class="flex-1">
          <div 
            :id="playerId" 
            class="webtor w-full h-full bg-gray-900"
            style="min-height: 500px;"
          >
            <!-- Fallback content while SDK loads -->
            <div class="flex items-center justify-center h-full text-white">
              <div class="text-center">
                <div class="loading loading-spinner loading-lg text-red-600 mb-4"></div>
                <p>Initializing Webtor player...</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Stream Info -->
        <div v-if="!isLoading && !error" class="p-4 bg-gray-800 text-white text-sm">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <span class="text-gray-400">Status:</span> {{ streamStatus }}
            </div>
            <div>
              <span class="text-gray-400">Source:</span> Webtor.io SDK
            </div>
            <div>
              <span class="text-gray-400">Format:</span> Torrent Stream
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Updated to use Webtor SDK

interface Props {
  magnetUri: string
  isVisible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const isLoading = ref(true)
const error = ref<string>('')
const loadingText = ref('Initializing stream...')
const movieTitle = ref('')
const streamStatus = ref('Connecting')
const playerId = ref(`webtor-player-${Date.now()}`)
const embedUrl = ref<string>('')
const isFullscreen = ref(false)
const playerContainerRef = ref<HTMLDivElement>()

// Fullscreen element reference
const fullscreenElement = ref<HTMLElement | null>(null)

// Load Webtor SDK script
const loadWebtorSDK = () => {
  return new Promise<void>((resolve, reject) => {
    // Check if SDK is already loaded
    if (typeof window !== 'undefined' && (window as any).webtor) {
      resolve()
      return
    }

    // Try to load from CDN first, then fallback to local package
    const tryLoadFromCDN = () => {
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@webtor/embed-sdk-js/dist/index.min.js'
      script.charset = 'utf-8'
      script.async = true
      
      script.onload = () => {
        console.log('✅ Webtor SDK loaded successfully from CDN')
        resolve()
      }
      
      script.onerror = () => {
        console.warn('⚠️ CDN blocked, trying local package fallback...')
        document.head.removeChild(script)
        tryLoadFromLocal()
      }
      
      document.head.appendChild(script)
    }

    const tryLoadFromLocal = () => {
      try {
        // Try to import the local package
        import('@webtor/embed-sdk-js/dist/index.min.js').then(() => {
          console.log('✅ Webtor SDK loaded successfully from local package')
          resolve()
        }).catch(() => {
          // Final fallback - create a mock implementation for development
          console.warn('⚠️ Using iframe fallback since SDK is not available')
          useFallbackImplementation()
          resolve()
        })
      } catch (error) {
        console.warn('⚠️ Local package import failed, using fallback')
        useFallbackImplementation()
        resolve()
      }
    }

    const useFallbackImplementation = () => {
      // Create a simple webtor mock that just creates an iframe
      (window as any).webtor = (window as any).webtor || []
      ;(window as any).webtor.push = function(config: any) {
        console.log('🔧 Using fallback webtor implementation for:', config.id)
        const element = document.getElementById(config.id)
        if (element) {
          const encodedMagnet = encodeURIComponent(config.magnet)
          const encodedTitle = encodeURIComponent(config.title || 'Movie')
          const iframe = document.createElement('iframe')
          iframe.src = `https://webtor.io/web?magnet=${encodedMagnet}&lang=en&title=${encodedTitle}`
          iframe.style.width = '100%'
          iframe.style.height = '100%'
          iframe.style.border = 'none'
          iframe.allowFullscreen = true
          iframe.allow = 'autoplay; encrypted-media'
          iframe.sandbox = 'allow-same-origin allow-scripts allow-popups allow-forms'
          element.innerHTML = '' // Clear any existing content
          element.appendChild(iframe)
          
          // Simulate ready event
          setTimeout(() => {
            if (config.on) {
              config.on('ready', {})
            }
          }, 2000)
        } else {
          console.error('❌ Element not found for fallback:', config.id)
          if (config.on) {
            config.on('error', { message: 'Player element not found' })
          }
        }
      }
    }

    tryLoadFromCDN()
  })
}

watch(() => props.isVisible, async (visible) => {
  console.log('🎬 Torrent Player visibility changed:', visible)
  
  if (visible && props.magnetUri) {
    console.log('🔗 Starting stream for magnet:', props.magnetUri.substring(0, 50) + '...')
    await initializeStream()
  } else if (!visible) {
    console.log('🚫 Player closed, cleaning up...')
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

async function initializeStream() {
  console.log('🚀 Initializing stream with Webtor SDK...')
  
  isLoading.value = true
  error.value = ''
  loadingText.value = 'Loading Webtor SDK...'
  streamStatus.value = 'Connecting'
  
  try {
    // Load the Webtor SDK
    await loadWebtorSDK()
    
    // Extract movie title from magnet URI
    const dnMatch = props.magnetUri.match(/dn=([^&]+)/)
    if (dnMatch) {
      movieTitle.value = decodeURIComponent(dnMatch[1].replace(/\+/g, ' '))
      console.log('🎭 Movie title:', movieTitle.value)
    }
    
    loadingText.value = 'Setting up player...'
    
    // Create fallback URL for "Open in Webtor.io" button
    const encodedMagnet = encodeURIComponent(props.magnetUri)
    const encodedTitle = encodeURIComponent(movieTitle.value || 'Movie')
    embedUrl.value = `https://webtor.io/web?magnet=${encodedMagnet}&lang=en&title=${encodedTitle}`
    
    // Use a shorter delay and then hide loading regardless
    isLoading.value = false
    
    // Wait a bit for DOM to be ready
    setTimeout(async () => {
      await setupWebtor()
    }, 500)
    
  } catch (err) {
    console.error('❌ Failed to initialize stream:', err)
    error.value = 'Failed to initialize Webtor player. This might be due to network issues or the torrent not being available.'
    isLoading.value = false
    streamStatus.value = 'Error'
  }
}

async function setupWebtor() {
  try {
    // Initialize Webtor player
    if (typeof window !== 'undefined' && (window as any).webtor) {
      const webtor = (window as any).webtor = (window as any).webtor || []
      
      const playerConfig = {
        id: playerId.value,
        magnet: props.magnetUri,
        title: movieTitle.value || 'Movie',
        width: '100%',
        height: '100%',
        lang: 'en',
        controls: true,
        header: true,
        on: (event: string, data: any) => {
          console.log('🎮 Webtor event:', event, data)
          
          switch (event) {
            case 'ready':
              streamStatus.value = 'Ready'
              break
            case 'error':
              console.error('❌ Webtor player error:', data)
              error.value = data.message || 'Player error occurred'
              streamStatus.value = 'Error'
              break
            case 'play':
              streamStatus.value = 'Playing'
              break
            case 'pause':
              streamStatus.value = 'Paused'
              break
            case 'loading':
              streamStatus.value = 'Loading...'
              break
          }
        }
      }
      
      console.log('🔧 Player config:', playerConfig)
      webtor.push(playerConfig)
      
      streamStatus.value = 'Ready'
      
    } else {
      throw new Error('Webtor SDK not available')
    }
  } catch (err) {
    console.error('❌ Failed to setup webtor:', err)
    error.value = 'Failed to setup Webtor player'
    streamStatus.value = 'Error'
  }
}

function retryStream() {
  console.log('🔄 Retrying stream...')
  cleanup()
  setTimeout(() => {
    initializeStream()
  }, 1000)
}

function openInNewTab() {
  if (embedUrl.value) {
    window.open(embedUrl.value, '_blank')
  }
}

function closePlayer() {
  console.log('🚪 Closing player')
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
  if (!playerContainerRef.value) return
  
  const element = playerContainerRef.value
  
  try {
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen()
    } else if ((element as any).mozRequestFullScreen) {
      (element as any).mozRequestFullScreen()
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen()
    }
  } catch (err) {
    console.error('Failed to enter fullscreen:', err)
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
    console.error('Failed to exit fullscreen:', err)
  }
}

// Handle fullscreen state changes
function handleFullscreenChange() {
  const fullscreenEl = document.fullscreenElement || 
                      (document as any).webkitFullscreenElement || 
                      (document as any).mozFullScreenElement || 
                      (document as any).msFullscreenElement
  
  isFullscreen.value = !!fullscreenEl && fullscreenEl === playerContainerRef.value
  console.log('🖥️ Fullscreen state changed:', isFullscreen.value)
}

function cleanup() {
  console.log('🧹 Cleaning up stream...')
  
  // Try to cleanup the player if possible
  if (typeof window !== 'undefined') {
    const playerElement = document.getElementById(playerId.value)
    if (playerElement) {
      playerElement.innerHTML = ''
    }
  }
  
  embedUrl.value = ''
  isLoading.value = true
  error.value = ''
  movieTitle.value = ''
  streamStatus.value = 'Disconnected'
  playerId.value = `webtor-player-${Date.now()}`
  
  console.log('✅ Cleanup completed')
}

onUnmounted(() => {
  console.log('🏁 TorrentPlayer unmounting')
  
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
