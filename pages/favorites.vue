<template>
  <div class="container mx-auto px-4 py-12 bg-neutral-900 min-h-screen">
    <h1 class="text-3xl font-bold mb-8">Favorites</h1>
    <div v-if="favorites.length === 0" class="text-center text-neutral-400">
      No favorite movies yet.
    </div>
    <div v-else class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      <MovieCard v-for="movie in favorites" :key="movie.id" :movie="movie" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFavoritesStore } from '~/stores/favorites'

const favoritesStore = useFavoritesStore()
const favorites = computed(() => favoritesStore.favorites)
</script>
