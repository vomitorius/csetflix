<!-- Demo Auto Stream Player - Shows the successful streaming flow with mock data -->
<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
    <div class="w-full h-full max-w-7xl max-h-screen p-2 md:p-4">
      <div class="bg-gray-900 rounded-lg overflow-hidden h-full flex flex-col">
        <!-- Header -->
        <div class="flex justify-between items-center p-3 md:p-4 bg-gray-800 flex-shrink-0">
          <h3 class="text-white text-lg md:text-xl font-semibold truncate flex-1 mr-4">
            {{ movieTitle }}
          </h3>
          <div class="flex items-center gap-2">
            <!-- Change Source Button - New Feature! -->
            <button 
              @click="changeSource"
              class="text-white hover:text-orange-400 text-sm md:text-base px-2 py-1 rounded transition-colors border border-gray-600 hover:border-orange-400"
              :title="`Change source (${currentSourceIndex + 1}/${availableTorrents.length})`"
              v-if="currentStep >= 4 && availableTorrents.length > 1"
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
            <button 
              @click="closePlayer"
              class="text-white hover:text-red-400 text-2xl md:text-3xl flex-shrink-0 w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>
        
        <!-- Loading State -->
        <div v-if="currentStep < loadingSteps.length" class="flex-1 flex items-center justify-center p-4">
          <div class="text-center text-white max-w-md">
            <div class="loading loading-spinner loading-lg text-red-600 mb-4"></div>
            <p class="text-lg mb-2">{{ loadingSteps[currentStep].text }}</p>
            <p class="text-sm text-gray-400 mt-2">{{ loadingSteps[currentStep].detail }}</p>
            
            <!-- Progress indicator -->
            <div class="mt-4">
              <div class="w-64 bg-gray-700 rounded-full h-2 mx-auto">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  :style="{ width: ((currentStep + 1) / loadingSteps.length * 100) + '%' }"
                ></div>
              </div>
              <p class="text-xs text-gray-400 mt-2">
                {{ currentStep + 1 }}/{{ loadingSteps.length }} - {{ loadingSteps[currentStep].detail }}
              </p>
            </div>
            
            <!-- Best torrent found indicator -->
            <div v-if="currentStep >= 2" class="mt-4 p-3 bg-green-900/30 rounded-lg border border-green-600/30">
              <div class="flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-green-400 font-medium text-sm">Best Torrent Selected</span>
              </div>
              <p class="text-xs text-green-300">{{ bestTorrent.name }}</p>
              <div class="flex gap-4 mt-2 text-xs text-gray-300">
                <span>Quality: {{ bestTorrent.quality }}</span>
                <span>Size: {{ bestTorrent.size }}</span>
                <span>Seeders: {{ bestTorrent.seeders }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Webtor Player Container (simulated) -->
        <div v-else class="flex-1 min-h-0 relative">
          <!-- Mock Webtor player interface -->
          <div class="w-full h-full bg-black rounded-lg flex items-center justify-center relative">
            <!-- Simulated video player -->
            <div class="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
              <div class="text-center text-white">
                <!-- Play button overlay -->
                <div class="relative">
                  <div class="w-20 h-20 md:w-24 md:h-24 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center cursor-pointer shadow-2xl transition-all duration-200 hover:scale-110" @click="simulatePlay">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 md:h-12 md:w-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <div v-if="!hasPlayed" class="absolute -bottom-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <p class="text-sm text-gray-300">Click to start streaming</p>
                  </div>
                </div>
                
                <!-- Simulated video info -->
                <div v-if="hasPlayed" class="mt-8">
                  <div class="bg-black/50 rounded-lg p-4 max-w-md mx-auto">
                    <h4 class="text-lg font-semibold mb-2">{{ movieTitle }}</h4>
                    <div class="flex items-center justify-center gap-4 text-sm text-gray-300">
                      <span class="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ playbackTime }}
                      </span>
                      <span class="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {{ bestTorrent.quality }}
                      </span>
                    </div>
                    <div class="mt-3 bg-gray-700 rounded-full h-1">
                      <div class="bg-red-600 h-1 rounded-full transition-all duration-1000" :style="{ width: progress + '%' }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Webtor branding (simulated) -->
            <div class="absolute bottom-4 right-4 bg-black/70 rounded px-2 py-1 text-xs text-gray-300">
              Powered by Webtor.io
            </div>
          </div>
        </div>
        
        <!-- Stream Info Footer -->
        <div v-if="currentStep >= loadingSteps.length" class="p-3 md:p-4 bg-gray-800 text-white text-xs md:text-sm flex-shrink-0">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <div class="truncate">
              <span class="text-gray-400">Quality:</span> {{ bestTorrent.quality }}
            </div>
            <div class="truncate">
              <span class="text-gray-400">Size:</span> {{ bestTorrent.size }}
            </div>
            <div class="truncate">
              <span class="text-gray-400">Seeders:</span> {{ bestTorrent.seeders }}
            </div>
            <div class="truncate">
              <span class="text-gray-400">Source:</span> {{ bestTorrent.source }}
            </div>
          </div>
          <!-- Source change hint -->
          <div v-if="availableTorrents.length > 1" class="mt-2 p-2 bg-blue-900/30 rounded text-center">
            <p class="text-xs text-blue-300">
              🎯 <strong>New Feature:</strong> Use the "Source {{ currentSourceIndex + 1 }}/{{ availableTorrents.length }}" button above to switch between {{ availableTorrents.length }} available torrents!
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  movieTitle?: string
  isVisible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  movieTitle: 'Demo Movie'
})

const emit = defineEmits<{
  close: []
}>()

const currentStep = ref(0)
const hasPlayed = ref(false)
const progress = ref(0)
const playbackTime = ref('00:00')

// New source switching variables
const availableTorrents = ref<any[]>([])
const currentSourceIndex = ref(0)
const isChangingSource = ref(false)

const loadingSteps = [
  {
    text: 'Finding best stream...',
    detail: 'Searching torrent sources...'
  },
  {
    text: 'Analyzing torrents...',
    detail: 'Found 4 torrents, selecting best quality...'
  },
  {
    text: 'Preparing stream...',
    detail: 'Initializing Webtor player...'
  },
  {
    text: 'Ready to stream!',
    detail: 'Player loaded successfully'
  }
]

// Mock torrents with multiple sources
const mockTorrents = [
  {
    name: 'Indiana.Jones.Temple.Doom.1984.1080p.BluRay.x264-YIFY',
    quality: '1080p',
    size: '2.1 GB',
    seeders: 847,
    source: 'YIFY'
  },
  {
    name: 'Indiana.Jones.and.the.Temple.of.Doom.1984.1080p.BluRay.H264.AAC-RARBG',
    quality: '1080p', 
    size: '2.3 GB',
    seeders: 623,
    source: 'RARBG'
  },
  {
    name: 'Indiana Jones Temple of Doom 1984 720p BrRip x264-ETRG',
    quality: '720p',
    size: '1.2 GB', 
    seeders: 445,
    source: 'ETRG'
  },
  {
    name: 'Indiana.Jones.Temple.Doom.1984.1080p.BluRay.x265-RARBG',
    quality: '1080p',
    size: '1.8 GB',
    seeders: 289,
    source: 'RARBG'
  }
]

const bestTorrent = computed(() => {
  return availableTorrents.value[currentSourceIndex.value] || mockTorrents[0]
})

let stepInterval: NodeJS.Timeout | null = null
let progressInterval: NodeJS.Timeout | null = null

watch(() => props.isVisible, (visible) => {
  if (visible) {
    startDemo()
  } else {
    cleanup()
  }
}, { immediate: true })

function startDemo() {
  console.log('🚀 Starting demo auto stream')
  currentStep.value = 0
  hasPlayed.value = false
  progress.value = 0
  playbackTime.value = '00:00'
  
  // Initialize available torrents for source switching
  availableTorrents.value = mockTorrents
  currentSourceIndex.value = 0
  isChangingSource.value = false
  
  // Simulate loading steps
  stepInterval = setInterval(() => {
    if (currentStep.value < loadingSteps.length) {
      currentStep.value++
    } else {
      if (stepInterval) {
        clearInterval(stepInterval)
        stepInterval = null
      }
    }
  }, 1500)
}

async function changeSource() {
  if (isChangingSource.value || availableTorrents.value.length <= 1) return
  
  try {
    isChangingSource.value = true
    console.log('🔄 Demo: Changing torrent source...')
    
    // Move to next torrent in the list
    const oldIndex = currentSourceIndex.value
    currentSourceIndex.value = (currentSourceIndex.value + 1) % availableTorrents.value.length
    const newTorrent = bestTorrent.value
    
    console.log('🎯 Demo: Switching to torrent:', {
      name: newTorrent.name.substring(0, 60),
      seeders: newTorrent.seeders,
      source: newTorrent.source,
      index: currentSourceIndex.value + 1,
      total: availableTorrents.value.length
    })
    
    // Reset playback state for the demo
    hasPlayed.value = false
    progress.value = 0
    playbackTime.value = '00:00'
    
    // Clear any existing progress interval
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
    }
    
    // Simulate switching delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('✅ Demo: Successfully switched to new torrent source')
    
  } catch (err) {
    console.error('❌ Demo: Failed to change source:', err)
    // Revert to previous source on error
    currentSourceIndex.value = currentSourceIndex.value > 0 ? currentSourceIndex.value - 1 : availableTorrents.value.length - 1
  } finally {
    isChangingSource.value = false
  }
}

function simulatePlay() {
  console.log('▶️ Simulating playback')
  hasPlayed.value = true
  
  // Simulate playback progress
  let seconds = 0
  progressInterval = setInterval(() => {
    seconds++
    progress.value = Math.min((seconds / 120) * 100, 100) // 2 minute demo
    
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    playbackTime.value = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    
    if (seconds >= 120) {
      if (progressInterval) {
        clearInterval(progressInterval)
        progressInterval = null
      }
    }
  }, 1000)
}

function closePlayer() {
  console.log('🚪 Closing demo player')
  emit('close')
}

function cleanup() {
  console.log('🧹 Cleaning up demo...')
  
  if (stepInterval) {
    clearInterval(stepInterval)
    stepInterval = null
  }
  
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  
  currentStep.value = 0
  hasPlayed.value = false
  progress.value = 0
  playbackTime.value = '00:00'
  
  // Reset source switching state
  availableTorrents.value = []
  currentSourceIndex.value = 0
  isChangingSource.value = false
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

/* Custom play button animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>