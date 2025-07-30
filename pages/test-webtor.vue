<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Webtor.io Test Page</h1>
    
    <div class="card bg-base-200 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title">Test Magnet Link</h2>
        <p class="mb-4">This is the sample magnet link from the issue:</p>
        <div class="mockup-code mb-4">
          <pre><code>{{ testMagnetUri }}</code></pre>
        </div>
        
        <div class="flex gap-4">
          <button 
            @click="openWebtor" 
            class="btn btn-primary"
          >
            Test Webtor.io (Fixed)
          </button>
          <button 
            @click="openWebtorOld" 
            class="btn btn-error"
          >
            Test Old Version (Broken)
          </button>
        </div>
      </div>
    </div>

    <div class="card bg-base-200 shadow-lg">
      <div class="card-body">
        <h2 class="card-title">URL Comparison</h2>
        
        <div class="mb-4">
          <h3 class="font-semibold text-green-600">Fixed URL (without empty poster parameter):</h3>
          <div class="mockup-code">
            <pre><code>{{ fixedUrl }}</code></pre>
          </div>
        </div>
        
        <div class="mb-4">
          <h3 class="font-semibold text-red-600">Old URL (with empty poster parameter):</h3>
          <div class="mockup-code">
            <pre><code>{{ brokenUrl }}</code></pre>
          </div>
        </div>
      </div>
    </div>

    <!-- TorrentPlayerNew for testing -->
    <TorrentPlayerNew 
      v-if="selectedMagnetUri"
      :magnet-uri="selectedMagnetUri"
      :is-visible="showPlayer"
      @close="closePlayer"
    />
  </div>
</template>

<script setup lang="ts">
// Sample magnet URI from the issue
const testMagnetUri = ref('magnet:?xt=urn:btih:360742873AC610669E607DC79391AE6CB1157FD6&dn=Indiana%20Jones%20and%20the%20Temple%20of%20Doom%20(1984)%201080p%20bluray&tr=udp%3A%2F%2Fopen.demo')

const selectedMagnetUri = ref('')
const showPlayer = ref(false)

// Computed URLs for comparison
const fixedUrl = computed(() => {
  const encodedMagnet = encodeURIComponent(testMagnetUri.value)
  const encodedTitle = encodeURIComponent('Indiana Jones and the Temple of Doom (1984) 1080p bluray')
  return `https://webtor.io/web?magnet=${encodedMagnet}&lang=en&title=${encodedTitle}`
})

const brokenUrl = computed(() => {
  const encodedMagnet = encodeURIComponent(testMagnetUri.value)
  const encodedTitle = encodeURIComponent('Indiana Jones and the Temple of Doom (1984) 1080p bluray')
  return `https://webtor.io/web?magnet=${encodedMagnet}&lang=en&poster=&title=${encodedTitle}`
})

function openWebtor() {
  selectedMagnetUri.value = testMagnetUri.value
  showPlayer.value = true
}

function openWebtorOld() {
  // Open the old broken URL in new tab for comparison
  window.open(brokenUrl.value, '_blank')
}

function closePlayer() {
  showPlayer.value = false
  selectedMagnetUri.value = ''
}

// Set page title
useHead({
  title: 'Webtor.io Test - CsetFlix'
})
</script>