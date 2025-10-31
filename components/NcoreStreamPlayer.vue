<!-- Ncore Stream Player - Plays torrents from Ncore -->
<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
    <div ref="playerContainerRef" class="w-full h-full max-w-7xl max-h-screen p-2 md:p-4" :class="{ 'max-w-none p-0': isFullscreen }">
      <div class="bg-gray-900 rounded-lg overflow-hidden h-full flex flex-col">
        <!-- Header -->
        <div class="flex justify-between items-center p-3 md:p-4 bg-gray-800 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="bg-green-600 text-white px-3 py-1 rounded font-bold text-sm">NCORE</div>
            <h3 class="text-white text-lg md:text-xl font-semibold truncate flex-1 mr-4">
              {{ movieTitle || 'Loading...' }}
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <!-- Fullscreen Button -->
            <button 
              @click="toggleFullscreen"
              class="text-white hover:text-blue-400 text-xl p-1 rounded transition-colors"
              :title="isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'"
              v-if="!isLoading && !error"
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
                @click="openWebtorInNewTab"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm md:text-base"
              >
                Megnyitás Webtor.io-n
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
              <div class="loading loading-spinner loading-lg text-green-600 mb-4"></div>
              <p class="text-lg mb-2">Lejátszó inicializálása</p>
              <p class="text-sm text-gray-400">Stream beállítása...</p>
            </div>
          </div>
        </div>
        
        <!-- Stream Info Footer -->
        <div v-if="!isLoading && !error" class="p-3 md:p-4 bg-gray-800 text-white text-xs md:text-sm flex-shrink-0">
          <div class="flex items-center gap-4">
            <span class="text-gray-400">Forrás:</span>
            <span class="text-green-400 font-semibold">Ncore.pro</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const isLoading = ref(true)
const error = ref<string>('')
const loadingText = ref('Lejátszás indítása...')
const statusText = ref('Webtor lejátszó betöltése')
const webtorLoading = ref(false)
const playerId = ref(`webtor-ncore-${Date.now()}`)
const webtorUrl = ref('')
const isFullscreen = ref(false)
const playerContainerRef = ref<HTMLDivElement>()

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
  webtorLoading.value = false
  loadingText.value = 'Lejátszás indítása...'
  statusText.value = 'Webtor lejátszó betöltése'
  
  try {
    if (!props.magnetLink) {
      throw new Error('Nincs magnet link')
    }
    
    // Create Webtor URL for fallback
    const encodedMagnet = encodeURIComponent(props.magnetLink)
    const encodedTitle = encodeURIComponent(props.movieTitle)
    webtorUrl.value = `https://webtor.io/web?magnet=${encodedMagnet}&lang=en&title=${encodedTitle}&autoplay=1`
    
    // Load Webtor SDK and setup player
    await loadWebtorSDK()
    webtorLoading.value = true
    isLoading.value = false
    
    await nextTick()
    await setupWebtor()
    
  } catch (err) {
    console.error('❌ Stream failed:', err)
    error.value = (err as Error).message || 'Nem sikerült elindítani a lejátszást'
    isLoading.value = false
    webtorLoading.value = false
  }
}

async function setupWebtor() {
  try {
    if (typeof window !== 'undefined' && (window as any).webtor) {
      const webtor = (window as any).webtor = (window as any).webtor || []
      
      const playerConfig = {
        id: playerId.value,
        magnet: props.magnetLink,
        title: props.movieTitle,
        width: '100%',
        height: '100%',
        lang: 'en',
        controls: true,
        header: false,
        autoplay: true,
        on: (event: string, data: any) => {
          console.log('🎮 Webtor event:', event, data)
          
          switch (event) {
            case 'ready':
              webtorLoading.value = false
              console.log('✅ Player ready')
              break
            case 'error':
              console.error('❌ Player error:', data)
              error.value = data.message || 'Lejátszási hiba történt'
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
      
      setTimeout(() => {
        if (webtorLoading.value) {
          console.log('⏰ Player setup timeout, considering ready')
          webtorLoading.value = false
        }
      }, 10000)
      
    } else {
      throw new Error('Webtor SDK nem elérhető')
    }
  } catch (err) {
    console.error('❌ Webtor setup failed:', err)
    error.value = 'Nem sikerült beállítani a lejátszót'
    webtorLoading.value = false
  }
}

function retryStream() {
  console.log('🔄 Retrying stream...')
  cleanup()
  setTimeout(() => {
    initializeStream()
  }, 1000)
}

function openWebtorInNewTab() {
  if (webtorUrl.value) {
    window.open(webtorUrl.value, '_blank')
  }
}

function closePlayer() {
  console.log('🚪 Closing Ncore stream player')
  if (isFullscreen.value) {
    exitFullscreen()
  }
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
  const webtorContainer = document.getElementById(playerId.value)
  if (!webtorContainer) return
  
  const attemptFullscreen = () => {
    const iframe = webtorContainer.querySelector('iframe')
    if (!iframe) return false
    
    try {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen()
      } else if ((iframe as any).webkitRequestFullscreen) {
        (iframe as any).webkitRequestFullscreen()
      } else if ((iframe as any).mozRequestFullScreen) {
        (iframe as any).mozRequestFullScreen()
      } else if ((iframe as any).msRequestFullscreen) {
        (iframe as any).msRequestFullscreen()
      }
      return true
    } catch (err) {
      console.error('Failed to enter fullscreen:', err)
      return false
    }
  }
  
  if (attemptFullscreen()) return
  
  let attempts = 0
  const maxAttempts = 10
  const retryInterval = setInterval(() => {
    attempts++
    if (attemptFullscreen() || attempts >= maxAttempts) {
      clearInterval(retryInterval)
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

function handleFullscreenChange() {
  const fullscreenEl = document.fullscreenElement || 
                      (document as any).webkitFullscreenElement || 
                      (document as any).mozFullScreenElement || 
                      (document as any).msFullscreenElement
  
  const webtorContainer = document.getElementById(playerId.value)
  const iframe = webtorContainer?.querySelector('iframe')
  
  isFullscreen.value = !!fullscreenEl && fullscreenEl === iframe
}

function cleanup() {
  console.log('🧹 Cleaning up Ncore stream...')
  
  if (typeof window !== 'undefined') {
    const playerElement = document.getElementById(playerId.value)
    if (playerElement) {
      playerElement.innerHTML = ''
    }
  }
  
  isLoading.value = true
  error.value = ''
  webtorLoading.value = false
  playerId.value = `webtor-ncore-${Date.now()}`
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
@media (max-width: 768px) {
  .webtor {
    min-height: 300px;
  }
}
</style>
