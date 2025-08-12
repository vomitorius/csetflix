import { defineStore } from 'pinia'
import type { Movie } from '~/types/movie'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<Movie[]>([])

  function load() {
    if (process.client) {
      const raw = localStorage.getItem('favorites')
      if (raw) {
        try {
          favorites.value = JSON.parse(raw)
        } catch {
          favorites.value = []
        }
      }
    }
  }

  function save() {
    if (process.client) {
      localStorage.setItem('favorites', JSON.stringify(favorites.value))
    }
  }

  function toggleFavorite(movie: Movie) {
    const index = favorites.value.findIndex(m => m.id === movie.id)
    if (index !== -1) {
      favorites.value.splice(index, 1)
    } else {
      favorites.value.push(movie)
    }
    save()
  }

  function isFavorite(id: number) {
    return favorites.value.some(m => m.id === id)
  }


  if (process.client) {
    onMounted(load)
    watch(favorites, save, { deep: true })
  }


  load()

  return { favorites, toggleFavorite, isFavorite }

})
