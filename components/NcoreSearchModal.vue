<!-- Ncore.pro Search Modal -->
<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div class="bg-neutral-900 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-center p-4 border-b border-neutral-700">
        <div class="flex items-center gap-3">
          <div class="bg-green-600 text-white px-3 py-1 rounded font-bold text-sm">NCORE</div>
          <h3 class="text-white text-xl font-semibold">{{ movieTitle }}</h3>
        </div>
        <button 
          @click="close"
          class="text-white hover:text-red-400 text-3xl"
        >
          ×
        </button>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex-1 flex items-center justify-center p-8">
        <div class="text-center text-white">
          <div class="loading loading-spinner loading-lg text-green-600 mb-4"></div>
          <p class="text-lg">Ncore keresés...</p>
          <p class="text-sm text-gray-400 mt-2">Filmek keresése az ncore.pro-n</p>
        </div>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="flex-1 flex items-center justify-center p-8">
        <div class="text-center text-white max-w-md">
          <div class="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 class="text-lg font-semibold text-red-400 mb-2">Hiba történt</h3>
          <p class="text-gray-300 mb-4">{{ error }}</p>
          <button 
            @click="retrySearch"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Újra próbálkozás
          </button>
        </div>
      </div>
      
      <!-- Results -->
      <div v-else-if="torrents.length > 0" class="flex-1 overflow-y-auto p-4">
        <div class="space-y-2">
          <div 
            v-for="torrent in torrents" 
            :key="torrent.id"
            class="bg-neutral-800 rounded-lg p-4 hover:bg-neutral-700 transition-colors"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <h4 class="text-white font-medium mb-2 break-words">{{ torrent.title }}</h4>
                <div class="flex flex-wrap gap-3 text-sm text-gray-400">
                  <span class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span class="text-green-400 font-semibold">{{ torrent.seeders }}</span>
                  </span>
                  <span class="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    <span class="text-red-400">{{ torrent.leechers }}</span>
                  </span>
                  <span>💾 {{ torrent.size }}</span>
                  <span class="badge badge-sm badge-outline">{{ torrent.type }}</span>
                </div>
              </div>
              <button 
                @click="selectTorrent(torrent)"
                :disabled="loadingMagnet && selectedTorrentId === torrent.id"
                class="btn btn-sm btn-success flex-shrink-0"
              >
                <span v-if="loadingMagnet && selectedTorrentId === torrent.id" class="loading loading-spinner loading-xs"></span>
                <span v-else>Lejátszás</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- No Results -->
      <div v-else class="flex-1 flex items-center justify-center p-8">
        <div class="text-center text-white">
          <div class="text-6xl mb-4">🔍</div>
          <p class="text-lg">Nincs találat</p>
          <p class="text-sm text-gray-400 mt-2">Nem található torrent ehhez a filmhez</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'

interface Props {
  movieTitle?: string
  isVisible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  movieTitle: ''
})

const emit = defineEmits<{
  close: []
  play: [magnet: string]
}>()

const loading = ref(false)
const loadingMagnet = ref(false)
const error = ref<string>('')
const torrents = ref<any[]>([])
const selectedTorrentId = ref<string>('')

// Watch for visibility changes to trigger search
watch(() => props.isVisible, async (visible) => {
  if (visible && props.movieTitle) {
    await searchNcore()
  } else if (!visible) {
    // Reset state when closed
    torrents.value = []
    error.value = ''
    selectedTorrentId.value = ''
  }
})

async function searchNcore() {
  try {
    loading.value = true
    error.value = ''
    torrents.value = []
    
    console.log('🔍 Searching Ncore for:', props.movieTitle)
    
    const response = await axios.get('/api/ncore/search', {
      params: {
        title: props.movieTitle
      }
    })
    
    if (response.data.success) {
      torrents.value = response.data.torrents
      console.log('✅ Found', torrents.value.length, 'torrents')
    } else {
      error.value = response.data.error || 'Keresés sikertelen'
    }
    
  } catch (err: any) {
    console.error('❌ Ncore search failed:', err)
    error.value = err.response?.data?.error || err.message || 'Nem sikerült a keresés'
  } finally {
    loading.value = false
  }
}

async function selectTorrent(torrent: any) {
  try {
    loadingMagnet.value = true
    selectedTorrentId.value = torrent.id
    
    console.log('🧲 Getting magnet link for torrent:', torrent.id)
    
    const response = await axios.get('/api/ncore/magnet', {
      params: {
        id: torrent.id
      }
    })
    
    if (response.data.success) {
      const magnetLink = response.data.magnet
      console.log('✅ Got magnet link:', magnetLink.substring(0, 100) + '...')
      
      // Emit play event with magnet link
      emit('play', magnetLink)
      close()
    } else {
      error.value = response.data.error || 'Nem sikerült a magnet link lekérése'
    }
    
  } catch (err: any) {
    console.error('❌ Failed to get magnet link:', err)
    error.value = err.response?.data?.error || err.message || 'Nem sikerült a magnet link lekérése'
  } finally {
    loadingMagnet.value = false
    selectedTorrentId.value = ''
  }
}

function retrySearch() {
  searchNcore()
}

function close() {
  emit('close')
}
</script>

<style scoped>
/* Custom scrollbar for results */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
