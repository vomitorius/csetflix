<template>
  <div class="container mx-auto p-4">
    <div v-if="loading" class="flex justify-center my-12">
      <span class="loading loading-spinner loading-lg text-red-600"></span>
    </div>

    <div v-else-if="error" class="alert alert-error shadow-lg mb-6">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>
    </div>

    <div v-else-if="person" class="space-y-10">
      <div class="flex flex-col md:flex-row gap-8">
        <div class="w-full md:w-72 lg:w-80 flex-shrink-0">
          <div class="overflow-hidden rounded-xl shadow-xl bg-neutral-800">
            <img
              :src="profileUrl"
              :alt="person.name"
              class="w-full object-cover"
              @error="useDefaultProfile"
            />
          </div>
        </div>

        <div class="flex-1 space-y-4">
          <div class="flex items-center gap-3 flex-wrap">
            <button @click="goBack" class="btn btn-ghost btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <span class="badge badge-outline">{{ departmentLabel }}</span>
            <span v-if="person.birthday" class="badge badge-outline">
              Born {{ formatDate(person.birthday) }}
            </span>
            <span v-if="person.place_of_birth" class="badge badge-outline">
              {{ person.place_of_birth }}
            </span>
          </div>

          <div>
            <h1 class="text-3xl md:text-4xl font-bold mb-2">{{ person.name }}</h1>
            <p v-if="person.also_known_as?.length" class="text-sm text-neutral-400">
              Also known as: {{ person.also_known_as.join(', ') }}
            </p>
          </div>

          <div v-if="person.biography" class="prose prose-invert max-w-none">
            <h2 class="text-xl font-semibold mb-2">Biography</h2>
            <p class="whitespace-pre-line leading-relaxed">{{ person.biography }}</p>
          </div>
        </div>
      </div>

      <section v-if="actingMovies.length" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">Acting Credits</h2>
          <span class="badge badge-lg">{{ actingMovies.length }}</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          <MovieCard v-for="movie in actingMovies" :key="movie.id" :movie="movie" />
        </div>
      </section>

      <section v-if="directingMovies.length" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">Directing Credits</h2>
          <span class="badge badge-lg">{{ directingMovies.length }}</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          <MovieCard v-for="movie in directingMovies" :key="movie.id" :movie="movie" />
        </div>
      </section>

      <section v-if="crewMovies.length" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold">Other Crew Credits</h2>
          <span class="badge badge-lg">{{ crewMovies.length }}</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          <MovieCard v-for="movie in crewMovies" :key="movie.id" :movie="movie" />
        </div>
      </section>

      <div v-if="!actingMovies.length && !directingMovies.length && !crewMovies.length" class="text-center py-12 bg-neutral-800/60 rounded-xl">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-neutral-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8c-2.21 0-4 1.79-4 4 0 2.21 1.79 4 4 4m0 0c2.21 0 4-1.79 4-4 0-2.21-1.79-4-4-4m-7 4h.01M19 12h.01M12 19v.01M12 5V5" />
        </svg>
        <p class="text-lg text-neutral-300">No movie credits available for this person.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import type { Movie } from '~/types/movie'

interface PersonDetail {
  id: number
  name: string
  biography: string
  profile_path: string | null
  known_for_department: string | null
  birthday: string | null
  place_of_birth: string | null
  also_known_as: string[]
  gender: number | null
}

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const person = ref<PersonDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const actingMovies = ref<Movie[]>([])
const directingMovies = ref<Movie[]>([])
const crewMovies = ref<Movie[]>([])

const personId = computed(() => {
  const id = route.params.id
  return Array.isArray(id) ? id[0] : (id as string)
})

useHead(() => ({
  title: person.value ? `${person.value.name} - Filmography` : 'Person Details'
}))

function goBack() {
  router.back()
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

const departmentLabel = computed(() => {
  if (!person.value?.known_for_department) return 'Entertainment'
  return person.value.known_for_department
})

const profileUrl = computed(() => {
  if (person.value?.profile_path) {
    return `${config.public.tmdbImageBaseUrl}/w500${person.value.profile_path}`
  }
  return '/no-poster.jpg'
})

function useDefaultProfile(event: Event) {
  const target = event.target as HTMLImageElement
  target.src = '/no-poster.jpg'
}

function normalizeMovie(credit: any): Movie {
  return {
    id: credit.id,
    title: credit.title || credit.original_title || credit.name || 'Untitled',
    poster_path: credit.poster_path || '',
    overview: credit.overview || '',
    release_date: credit.release_date || credit.first_air_date || '',
    vote_average: typeof credit.vote_average === 'number' ? credit.vote_average : 0
  }
}

function sortMovies(credits: any[]): Movie[] {
  const uniqueCredits = new Map<number, Movie>()

  credits.forEach(credit => {
    if (credit?.id && !uniqueCredits.has(credit.id)) {
      uniqueCredits.set(credit.id, normalizeMovie(credit))
    }
  })

  return Array.from(uniqueCredits.values()).sort((a, b) => {
    const aDate = a.release_date ? new Date(a.release_date).getTime() : 0
    const bDate = b.release_date ? new Date(b.release_date).getTime() : 0
    if (aDate !== bDate) return bDate - aDate
    return (b.vote_average || 0) - (a.vote_average || 0)
  })
}

async function fetchPersonDetails(id: string) {
  if (!id) return
  try {
    loading.value = true
    error.value = null

    const [personResponse, creditsResponse] = await Promise.all([
      axios.get(`${config.public.tmdbApiBaseUrl}/person/${id}`, {
        params: {
          api_key: config.public.tmdbApiKey,
          language: 'en-US'
        }
      }),
      axios.get(`${config.public.tmdbApiBaseUrl}/person/${id}/movie_credits`, {
        params: {
          api_key: config.public.tmdbApiKey,
          language: 'en-US'
        }
      })
    ])

    person.value = personResponse.data as PersonDetail

    const castCredits = creditsResponse.data.cast || []
    const crewCredits = creditsResponse.data.crew || []

    actingMovies.value = sortMovies(castCredits)
    directingMovies.value = sortMovies(crewCredits.filter((credit: any) => credit.job === 'Director'))

    const otherCrew = crewCredits.filter((credit: any) => credit.job !== 'Director')
    crewMovies.value = sortMovies(otherCrew)
  } catch (err: any) {
    console.error('Failed to load person details', err)
    error.value = err.message || 'Failed to load person information'
  } finally {
    loading.value = false
  }
}

watch(personId, id => {
  if (id) {
    fetchPersonDetails(id)
  }
}, { immediate: true })
</script>

<style scoped>
.prose :where(p) {
  color: inherit;
}
</style>
