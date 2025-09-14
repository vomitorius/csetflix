<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-center">TV Remote Demo</h1>
    
    <div class="bg-neutral-800 p-6 rounded-lg mb-8">
      <h2 class="text-xl font-semibold mb-4">Instructions:</h2>
      <ul class="list-disc list-inside space-y-2">
        <li>Use <kbd class="kbd kbd-sm">Arrow Keys</kbd> to navigate between elements</li>
        <li>Press <kbd class="kbd kbd-sm">Enter</kbd> to activate/click the focused element</li>
        <li>Press <kbd class="kbd kbd-sm">Escape</kbd> or <kbd class="kbd kbd-sm">Backspace</kbd> to go back</li>
        <li>Use <kbd class="kbd kbd-sm">Tab</kbd> for standard keyboard navigation</li>
      </ul>
    </div>

    <!-- Demo Navigation -->
    <div class="flex justify-center gap-4 mb-8">
      <button 
        ref="demoButton1"
        class="btn btn-primary tv-focusable"
        @click="() => alert('Button 1 clicked!')"
      >
        Demo Button 1
      </button>
      <button 
        ref="demoButton2"
        class="btn btn-secondary tv-focusable"
        @click="() => alert('Button 2 clicked!')"
      >
        Demo Button 2
      </button>
      <button 
        ref="demoButton3"
        class="btn btn-accent tv-focusable"
        @click="() => alert('Button 3 clicked!')"
      >
        Demo Button 3
      </button>
    </div>

    <!-- Demo Movie Cards -->
    <h2 class="text-2xl font-bold mb-6">
      <span class="text-red-600">Demo</span> Movie Cards
    </h2>
    
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div 
        v-for="(movie, index) in demoMovies" 
        :key="movie.id"
        :ref="el => { if (el) movieCardRefs[index] = el }"
        class="card bg-neutral-800 hover:scale-105 transition-transform duration-300 shadow-xl tv-focusable cursor-pointer"
        @click="() => alert(`${movie.title} clicked!`)"
        tabindex="0"
      >
        <figure class="h-48 bg-neutral-700 flex items-center justify-center">
          <div class="text-6xl">🎬</div>
        </figure>
        <div class="card-body p-4">
          <h3 class="card-title text-sm">{{ movie.title }}</h3>
          <p class="text-xs text-gray-400">{{ movie.year }}</p>
          <div class="badge badge-accent badge-sm">{{ movie.rating }}</div>
        </div>
      </div>
    </div>

    <!-- Back Button -->
    <div class="flex justify-center mt-8">
      <NuxtLink 
        ref="backButton"
        to="/" 
        class="btn btn-outline tv-focusable"
      >
        ← Back to Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTVRemote } from '~/composables/useTVRemote'

// Demo data
const demoMovies = [
  { id: 1, title: 'The Matrix', year: '1999', rating: '8.7' },
  { id: 2, title: 'Inception', year: '2010', rating: '8.8' },
  { id: 3, title: 'Interstellar', year: '2014', rating: '8.6' },
  { id: 4, title: 'The Dark Knight', year: '2008', rating: '9.0' },
  { id: 5, title: 'Pulp Fiction', year: '1994', rating: '8.9' },
  { id: 6, title: 'Fight Club', year: '1999', rating: '8.8' },
  { id: 7, title: 'Forrest Gump', year: '1994', rating: '8.8' },
  { id: 8, title: 'The Godfather', year: '1972', rating: '9.2' },
  { id: 9, title: 'Goodfellas', year: '1990', rating: '8.7' },
  { id: 10, title: 'Scarface', year: '1983', rating: '8.3' }
]

// Component refs
const demoButton1 = ref<HTMLElement>()
const demoButton2 = ref<HTMLElement>()
const demoButton3 = ref<HTMLElement>()
const movieCardRefs = ref<HTMLElement[]>([])
const backButton = ref<HTMLElement>()

const { registerFocusable, initializeFocus } = useTVRemote()

onMounted(async () => {
  const unregisterCallbacks: (() => void)[] = []
  
  // Register demo buttons with high priority
  if (demoButton1.value) {
    unregisterCallbacks.push(registerFocusable(demoButton1.value, 'demo-button-1', 10))
  }
  if (demoButton2.value) {
    unregisterCallbacks.push(registerFocusable(demoButton2.value, 'demo-button-2', 10))
  }
  if (demoButton3.value) {
    unregisterCallbacks.push(registerFocusable(demoButton3.value, 'demo-button-3', 10))
  }

  // Register movie cards
  movieCardRefs.value.forEach((cardEl, index) => {
    if (cardEl) {
      unregisterCallbacks.push(registerFocusable(cardEl, `demo-movie-card-${index}`, 5))
    }
  })

  // Register back button
  if (backButton.value && backButton.value.$el) {
    unregisterCallbacks.push(registerFocusable(backButton.value.$el, 'back-button', 3))
  } else if (backButton.value) {
    unregisterCallbacks.push(registerFocusable(backButton.value, 'back-button', 3))
  }

  // Initialize focus after elements are registered
  setTimeout(() => {
    initializeFocus()
  }, 100)
  
  onUnmounted(() => {
    unregisterCallbacks.forEach(callback => callback())
  })
})

// Set page meta
useHead({
  title: 'TV Remote Demo - CsetFlix'
})
</script>

<style scoped>
.kbd {
  @apply bg-neutral-700 text-gray-300 px-2 py-1 rounded text-xs;
}
</style>