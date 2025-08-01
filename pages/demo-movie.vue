<!-- Demo movie page with mock torrent data for testing the successful streaming flow -->
<template>
  <div>
    <div class="container mx-auto p-4">
      <!-- Back Button -->
      <div class="mb-4">
        <button @click="router.back()" class="btn btn-ghost btn-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>
      
      <!-- Hero Section -->
      <div class="w-full h-[40vh] bg-gradient-to-r from-purple-900 to-blue-800 bg-cover bg-center relative rounded-lg mb-8">
        <div class="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent rounded-lg"></div>
        <div class="container mx-auto p-4 flex items-end h-full relative z-10">
          <div class="flex flex-col md:flex-row items-end md:items-center gap-6">
            <div class="w-32 md:w-48 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-xl aspect-[2/3] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h1 class="text-3xl md:text-4xl font-bold mb-2">{{ demoMovie.title }}</h1>
              <p class="text-sm opacity-70">
                {{ demoMovie.year }} | 
                <span class="badge badge-accent">{{ demoMovie.rating }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Main Content -->
        <div class="md:w-2/3">
          <div class="card bg-neutral-800 mb-8">
            <div class="card-body">
              <h2 class="card-title text-xl mb-2">Overview</h2>
              <p>{{ demoMovie.overview }}</p>
            </div>
          </div>
          
          <!-- Watch Now Section -->
          <div class="card bg-neutral-800 mb-8">
            <div class="card-body">
              <h2 class="card-title text-xl mb-2">Watch Now</h2>
              <p class="mb-4">Stream "{{ demoMovie.title }}" instantly with automatic torrent selection:</p>
              <div class="flex gap-3 flex-wrap">
                <button @click="watchMovie" class="btn btn-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m2-7a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Watch
                </button>
                <button @click="downloadMovie" class="btn btn-outline btn-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Options
                </button>
              </div>
              <div class="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-600/30">
                <div class="flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-blue-400 font-medium text-sm">Demo Mode</span>
                </div>
                <p class="text-xs text-blue-300">This demo automatically selects the best torrent and shows the streaming interface without requiring external API access.</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sidebar -->
        <div class="md:w-1/3">
          <div class="card bg-neutral-800 mb-6">
            <div class="card-body">
              <h2 class="card-title text-xl mb-2">Movie Details</h2>
              <div class="overflow-x-auto">
                <table class="table w-full">
                  <tbody>
                    <tr>
                      <td class="font-bold">Release Date</td>
                      <td>{{ demoMovie.releaseDate }}</td>
                    </tr>
                    <tr>
                      <td class="font-bold">Rating</td>
                      <td>{{ demoMovie.rating }}/10</td>
                    </tr>
                    <tr>
                      <td class="font-bold">Genres</td>
                      <td>
                        <div class="flex flex-wrap gap-1">
                          <span 
                            v-for="genre in demoMovie.genres" 
                            :key="genre"
                            class="badge badge-outline"
                          >
                            {{ genre }}
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td class="font-bold">Runtime</td>
                      <td>{{ demoMovie.runtime }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Demo Auto Stream Player -->
    <DemoAutoStreamPlayer
      :movie-title="demoMovie.title"
      :is-visible="showStreamPlayer"
      @close="closeStreamPlayer"
    />
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

// Demo movie data
const demoMovie = {
  title: 'Inception',
  year: '2010',
  rating: '8.8',
  overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
  releaseDate: 'July 16, 2010',
  runtime: '2h 28m',
  genres: ['Action', 'Sci-Fi', 'Thriller']
}

// Auto Stream Player state
const showStreamPlayer = ref(false)

function watchMovie() {
  console.log('🎬 Starting demo watch for:', demoMovie.title)
  showStreamPlayer.value = true
}

function downloadMovie() {
  alert('Download options would normally open here. The Watch button demonstrates the new simplified streaming UX.')
}

function closeStreamPlayer() {
  console.log('🚪 Closing demo stream player')
  showStreamPlayer.value = false
}
</script>