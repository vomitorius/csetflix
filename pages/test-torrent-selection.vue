<template>
  <div class="container mx-auto p-4">
    <div class="mb-4">
      <button @click="router.back()" class="btn btn-ghost btn-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>
    </div>

    <h1 class="text-2xl font-bold mb-6">Torrent Selection Algorithm Test</h1>
    
    <div class="card bg-base-200 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title">Test Movie Title</h2>
        <input 
          v-model="testMovieTitle" 
          type="text" 
          placeholder="Enter movie title to test selection" 
          class="input input-bordered w-full mb-4"
        />
        <button @click="testTorrentSelection" class="btn btn-primary" :disabled="!testMovieTitle">
          Test Torrent Selection
        </button>
      </div>
    </div>

    <div v-if="testing" class="flex justify-center my-8">
      <div class="flex flex-col items-center">
        <span class="loading loading-spinner loading-lg text-red-600 mb-2"></span>
        <p>Testing torrent selection algorithm...</p>
      </div>
    </div>

    <div v-if="testResults" class="card bg-base-200 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title text-green-600">✅ Test Results</h2>
        
        <div class="mb-4">
          <h3 class="font-semibold mb-2">Selected Best Torrent:</h3>
          <div class="bg-gray-800 p-4 rounded">
            <p><strong>Name:</strong> {{ testResults.selected.name }}</p>
            <p><strong>Seeders:</strong> {{ testResults.selected.seeders }}</p>
            <p><strong>Size:</strong> {{ testResults.selected.size }}</p>
            <p><strong>Source:</strong> {{ testResults.selected.source }}</p>
            <p><strong>Score:</strong> {{ testResults.selected.score }}</p>
            <p><strong>Quality Detected:</strong> {{ getQuality(testResults.selected.name) }}</p>
            <p><strong>Validation:</strong> 
              <span :class="testResults.selected.isValid ? 'text-green-400' : 'text-yellow-400'">
                {{ testResults.selected.isValid ? '✅ Matches movie title' : '⚠️ May not match perfectly' }}
              </span>
            </p>
          </div>
        </div>

        <div class="mb-4">
          <h3 class="font-semibold mb-2">All Available Torrents (Top 10):</h3>
          <div class="overflow-x-auto">
            <table class="table w-full text-xs">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Seeders</th>
                  <th>Quality</th>
                  <th>Score</th>
                  <th>Valid</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(torrent, index) in testResults.allTorrents.slice(0, 10)" :key="index"
                    :class="{'bg-green-900': index === 0}">
                  <td>{{ index + 1 }}</td>
                  <td class="max-w-xs truncate">{{ torrent.name }}</td>
                  <td>{{ torrent.seeders }}</td>
                  <td>{{ getQuality(torrent.name) }}</td>
                  <td>{{ Math.round(torrent.score * 10) / 10 }}</td>
                  <td>{{ torrent.isValid ? '✅' : '⚠️' }}</td>
                  <td class="text-xs">{{ torrent.source }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="mb-4">
          <h3 class="font-semibold mb-2">Algorithm Insights:</h3>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>✅ Filtered out {{ testResults.stats.filtered4K }} torrents with 4K/2160p resolution (as required)</li>
            <li>✅ Found {{ testResults.stats.total }} total torrents</li>
            <li>✅ {{ testResults.stats.viable }} viable torrents after filtering</li>
            <li>✅ Best torrent has {{ testResults.selected.seeders }} seeders</li>
            <li>✅ Selected quality: {{ getQuality(testResults.selected.name) }} (max 1080p enforced)</li>
          </ul>
        </div>

        <div class="flex gap-2">
          <button @click="startStreamWithSelected" class="btn btn-success" :disabled="!testResults.selected.magnetLink">
            🎬 Stream Selected Torrent
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="alert alert-error shadow-lg mb-6">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Auto Stream Player for testing -->
    <AutoStreamPlayer
      v-model="showStreamPlayer"
      :movie-title="testMovieTitle"
      :is-visible="showStreamPlayer"
      @close="closeStreamPlayer"
    />
  </div>
</template>

<script setup lang="ts">
import { useTorrentStore } from '~/stores/torrent'

const router = useRouter()
const torrentStore = useTorrentStore()

const testMovieTitle = ref('Indiana Jones and the Temple of Doom')
const testing = ref(false)
const error = ref<string>('')
const testResults = ref<any>(null)
const showStreamPlayer = ref(false)

// Simulate the selection algorithm from AutoStreamPlayer
function selectBestTorrent(torrents: any[], movieTitle: string) {
  // Filter out torrents with very low seeders and invalid resolutions
  const viable = torrents.filter(t => {
    const seeders = t.seeders || 0
    const name = t.name?.toLowerCase() || ''
    
    // Must have at least 1 seeder
    if (seeders < 1) return false
    
    // Reject torrents with resolution higher than 1080p (as per requirements)
    if (name.includes('2160p') || name.includes('4k') || name.includes('2k')) {
      return false
    }
    
    // Must have a valid magnet link or way to get one
    if (!t.magnetLink && !t.magnet && !t.infoHash && !t.link) {
      return false
    }
    
    return true
  })
  
  const stats = {
    total: torrents.length,
    viable: viable.length,
    filtered4K: torrents.length - torrents.filter(t => {
      const name = t.name?.toLowerCase() || ''
      return !name.includes('2160p') && !name.includes('4k') && !name.includes('2k')
    }).length
  }
  
  if (viable.length === 0) {
    return { selected: torrents[0], allTorrents: torrents, stats }
  }
  
  // Score torrents based on multiple factors with focus on seeders and 1080p max
  const scored = viable.map(torrent => {
    let score = 0
    const name = torrent.name?.toLowerCase() || ''
    
    // Seeder count (primary factor - 70% weight)
    score += (torrent.seeders || 0) * 0.7
    
    // Quality detection (25% weight) - cap at 1080p
    if (name.includes('1080p')) score += 60
    else if (name.includes('720p')) score += 40
    else if (name.includes('480p')) score += 20
    
    // Movie title matching
    const movieWords = movieTitle?.toLowerCase().split(/\s+/) || []
    const torrentWords = name.split(/\s+/)
    let matchCount = 0
    
    movieWords.forEach(word => {
      if (word.length > 2 && torrentWords.some(tw => tw.includes(word) || word.includes(tw))) {
        matchCount++
      }
    })
    
    score += Math.min(matchCount * 3, 15)
    
    // Format bonus
    if (name.includes('mp4') || name.includes('mkv') || name.includes('avi')) score += 8
    
    // Size preference
    const sizeStr = torrent.size || ''
    const sizeMatch = sizeStr.match(/(\d+\.?\d*)\s*(GB|MB)/i)
    if (sizeMatch) {
      const size = parseFloat(sizeMatch[1])
      const unit = sizeMatch[2].toUpperCase()
      const sizeInGB = unit === 'GB' ? size : size / 1024
      
      if (name.includes('1080p')) {
        if (sizeInGB >= 1.5 && sizeInGB <= 4) score += 12
        else if (sizeInGB >= 1 && sizeInGB <= 6) score += 8
        else if (sizeInGB > 10) score -= 20
      } else if (name.includes('720p')) {
        if (sizeInGB >= 0.8 && sizeInGB <= 2.5) score += 12
        else if (sizeInGB >= 0.5 && sizeInGB <= 4) score += 8
        else if (sizeInGB > 8) score -= 15
      } else {
        if (sizeInGB >= 0.5 && sizeInGB <= 3) score += 8
        else if (sizeInGB > 6) score -= 10
      }
    }
    
    // Validate title match
    const isValid = validateTorrentForMovie(torrent, movieTitle)
    
    return { ...torrent, score, isValid }
  })
  
  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score)
  
  return { selected: scored[0], allTorrents: scored, stats }
}

function validateTorrentForMovie(torrent: any, movieTitle: string): boolean {
  let torrentName = ''
  
  if (torrent.magnetLink || torrent.magnet) {
    const magnetUri = torrent.magnetLink || torrent.magnet
    const dnMatch = magnetUri.match(/dn=([^&]+)/)
    if (dnMatch) {
      torrentName = decodeURIComponent(dnMatch[1].replace(/\+/g, ' ')).toLowerCase()
    }
  }
  
  if (!torrentName && torrent.name) {
    torrentName = torrent.name.toLowerCase()
  }
  
  if (!torrentName) return true
  
  const movieWords = movieTitle.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
  
  let matchCount = 0
  movieWords.forEach(word => {
    if (torrentName.includes(word)) {
      matchCount++
    }
  })
  
  const matchRatio = movieWords.length > 0 ? matchCount / movieWords.length : 0
  return matchRatio >= 0.4
}

function getQuality(name: string): string {
  const lowerName = name?.toLowerCase() || ''
  if (lowerName.includes('2160p') || lowerName.includes('4k')) return '4K (Filtered)'
  if (lowerName.includes('1080p')) return '1080p'
  if (lowerName.includes('720p')) return '720p'
  if (lowerName.includes('480p')) return '480p'
  return 'SD'
}

async function testTorrentSelection() {
  if (!testMovieTitle.value.trim()) return
  
  testing.value = true
  error.value = ''
  testResults.value = null
  
  try {
    console.log('🧪 Testing torrent selection for:', testMovieTitle.value)
    
    // Search for torrents using the store
    await torrentStore.searchTorrents(testMovieTitle.value.trim())
    
    // Combine results from both sources
    const allTorrents = [
      ...torrentStore.searchResults,
      ...torrentStore.titleSearchResults
    ]
    
    if (allTorrents.length === 0) {
      throw new Error('No torrents found for testing')
    }
    
    // Test our selection algorithm
    const results = selectBestTorrent(allTorrents, testMovieTitle.value)
    testResults.value = results
    
    console.log('🎯 Test results:', results)
    
  } catch (err: any) {
    error.value = err.message || 'Failed to test torrent selection'
    console.error('❌ Test failed:', err)
  } finally {
    testing.value = false
  }
}

function startStreamWithSelected() {
  if (testResults.value?.selected) {
    showStreamPlayer.value = true
  }
}

function closeStreamPlayer() {
  showStreamPlayer.value = false
}

// Set page title
useHead({
  title: 'Torrent Selection Test - CsetFlix'
})
</script>