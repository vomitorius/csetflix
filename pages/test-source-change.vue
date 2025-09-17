<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Test Torrent Source Change Feature</h1>
    
    <div class="card bg-base-200 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title">AutoStreamPlayer with Source Change</h2>
        <p class="mb-4">This tests the new torrent source change functionality added to AutoStreamPlayer.</p>
        <p class="mb-4 text-sm text-gray-600">
          The button will appear in the player header once multiple torrent sources are found. 
          It allows cycling through available torrents for the same movie.
        </p>
        
        <div class="flex gap-4">
          <button 
            @click="testAutoStreamPlayer" 
            class="btn btn-primary"
          >
            Test AutoStreamPlayer with Source Change
          </button>
        </div>
      </div>
    </div>

    <div class="card bg-base-200 shadow-lg">
      <div class="card-body">
        <h2 class="card-title">Feature Details</h2>
        <div class="space-y-2 text-sm">
          <p><strong>✅ New Feature:</strong> Source change button in player header</p>
          <p><strong>🎯 Location:</strong> Appears between movie title and fullscreen button</p>
          <p><strong>🔄 Functionality:</strong> Cycles through available torrents (1/3, 2/3, etc.)</p>
          <p><strong>🚀 Behavior:</strong> Restarts webtor player with new magnet URI</p>
          <p><strong>📊 Requirements:</strong> Only shows when 2+ torrent sources available</p>
          <p><strong>⚠️ Fallback:</strong> Reverts to previous source if new one fails</p>
        </div>
      </div>
    </div>

    <!-- DemoAutoStreamPlayer for testing source change -->
    <DemoAutoStreamPlayer 
      v-if="showPlayer"
      :movie-title="testMovieTitle"
      :is-visible="showPlayer"
      @close="closePlayer"
    />
  </div>
</template>

<script setup lang="ts">
const testMovieTitle = 'Indiana Jones and the Temple of Doom'
const showPlayer = ref(false)

function testAutoStreamPlayer() {
  showPlayer.value = true
}

function closePlayer() {
  showPlayer.value = false
}

// Set page title
useHead({
  title: 'Test Source Change - CsetFlix'
})
</script>