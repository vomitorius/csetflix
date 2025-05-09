<!-- Generated by Copilot 2025-04-25 18:00 -->
<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">Search Movies</h1>
    
    <div class="max-w-3xl mx-auto mb-10">
      <div class="bg-neutral-800 rounded-lg p-6 shadow-lg border border-neutral-700">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="relative flex-grow">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Enter movie title..." 
              class="input input-bordered w-full bg-neutral-900 border-neutral-600 focus:border-red-500 focus:ring-2 focus:ring-red-500 pl-10" 
              @keyup.enter="searchMovies"
            />
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button class="btn btn-primary min-w-[120px]" @click="searchMovies">
            Search
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="moviesStore.loading" class="flex justify-center my-8">
      <span class="loading loading-spinner loading-lg text-red-600"></span>
    </div>
    
    <div v-else-if="moviesStore.error" class="alert alert-error shadow-lg mb-4">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ moviesStore.error }}</span>
      </div>
    </div>
    
    <div v-else-if="searchWasPerformed && moviesStore.searchResults.length === 0" class="text-center my-12">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-neutral-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-xl">No movies found matching "{{ lastQuery }}"</p>
      <p class="mt-2 text-neutral-400">Try searching with different keywords</p>
    </div>
    
    <div v-else-if="searchWasPerformed" class="mt-4">
      <div class="flex justify-between items-center mb-6">
        <p class="text-lg">
          <span class="text-neutral-400">Results for: </span>
          <span class="font-semibold">"{{ lastQuery }}"</span>
        </p>
        <span class="badge badge-lg">{{ moviesStore.searchResults.length }} movies</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        <MovieCard 
          v-for="movie in moviesStore.searchResults" 
          :key="movie.id" 
          :movie="movie" 
        />
      </div>
    </div>
    
    <div v-else class="text-center my-16">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-neutral-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p class="text-xl mb-2">Enter a movie title to search</p>
      <p class="text-neutral-400">Find your favorite movies by title, actors, or directors</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMoviesStore } from '~/stores/movies'

const route = useRoute()
const moviesStore = useMoviesStore()
const searchQuery = ref('')
const searchWasPerformed = ref(false)
const lastQuery = ref('')

// Clear search results when navigating to this page
onMounted(async () => {
  // Reset search state when component is mounted
  searchWasPerformed.value = false
  lastQuery.value = ''
  moviesStore.clearSearch()
  
  // Process query parameter if present
  const query = route.query.q as string
  if (query) {
    searchQuery.value = query
    await searchMovies()
  }
})

async function searchMovies() {
  if (!searchQuery.value.trim()) return
  
  lastQuery.value = searchQuery.value
  await moviesStore.searchMovies(searchQuery.value)
  searchWasPerformed.value = true
}
</script>

<style scoped>
.input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}
</style>