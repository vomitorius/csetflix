<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Ncore WebTorrent Test Page</h1>
    
    <div class="card bg-base-200 shadow-lg mb-6">
      <div class="card-body">
        <h2 class="card-title">Native WebTorrent Implementation</h2>
        <p class="mb-4">Test magnet link with native WebTorrent (no iframe, no Webtor IO):</p>
        <div class="mockup-code mb-4 text-xs">
          <pre><code>{{ testMagnetUri }}</code></pre>
        </div>
        
        <div class="alert alert-info mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <h3 class="font-bold">Újdonságok:</h3>
            <ul class="list-disc list-inside text-sm">
              <li>Natív WebTorrent használata (nincs iframe)</li>
              <li>Gyorsabb betöltés (&lt; 3 másodperc)</li>
              <li>Teljes kontroll a lejátszó felett</li>
              <li>Valós idejű statisztikák (peers, sebesség)</li>
              <li>Pontosabb film választás</li>
            </ul>
          </div>
        </div>
        
        <button 
          @click="openPlayer" 
          class="btn btn-success btn-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Test Native WebTorrent Player
        </button>
      </div>
    </div>

    <div class="card bg-base-200 shadow-lg">
      <div class="card-body">
        <h2 class="card-title">Összehasonlítás: Webtor IO vs Native WebTorrent</h2>
        
        <div class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Webtor IO (régi)</th>
                <th>Native WebTorrent (új)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Betöltési idő</td>
                <td class="text-error">~5-10 másodperc</td>
                <td class="text-success">&lt; 3 másodperc</td>
              </tr>
              <tr>
                <td>Film választás</td>
                <td class="text-error">Néha téves</td>
                <td class="text-success">Mindig pontos</td>
              </tr>
              <tr>
                <td>Implementáció</td>
                <td class="text-error">iframe beágyazás</td>
                <td class="text-success">Natív HTML5 video</td>
              </tr>
              <tr>
                <td>Kontroll</td>
                <td class="text-error">Korlátozott</td>
                <td class="text-success">Teljes</td>
              </tr>
              <tr>
                <td>Statisztikák</td>
                <td class="text-error">Rejtett</td>
                <td class="text-success">Látható (peers, sebesség)</td>
              </tr>
              <tr>
                <td>Függőség</td>
                <td class="text-error">@webtor/embed-sdk-js</td>
                <td class="text-success">webtorrent (CDN)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Ncore Stream Player with Native WebTorrent -->
    <NcoreStreamPlayer
      v-if="showPlayer"
      :movie-title="movieTitle"
      :magnet-link="testMagnetUri"
      :is-visible="showPlayer"
      @close="closePlayer"
    />
  </div>
</template>

<script setup lang="ts">
// Sample magnet URI for testing (Big Buck Bunny - open source film)
const testMagnetUri = ref('magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fbig-buck-bunny.torrent')

const movieTitle = ref('Big Buck Bunny (Test Film)')
const showPlayer = ref(false)

function openPlayer() {
  showPlayer.value = true
}

function closePlayer() {
  showPlayer.value = false
}

// Set page title
useHead({
  title: 'Ncore WebTorrent Test - CsetFlix'
})
</script>
