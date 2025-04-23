<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar />
    
    <main class="flex-grow">
      <NuxtPage />
    </main>
    
    <footer class="bg-neutral-800 py-6">
      <div class="container mx-auto px-4 text-center">
        <p class="text-neutral-400 text-sm">
          CsetFlix - Personal Media Center &copy; {{ new Date().getFullYear() }}
        </p>
        <p class="text-neutral-500 text-xs mt-2">
          Powered by TMDB API, qBittorrent, and Jellyfin
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Configure head metadata
useHead({
  title: 'CsetFlix - Personal Media Center',
  meta: [
    { name: 'description', content: 'Browse, discover, and download movies with integration to qBittorrent and Jellyfin' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
  ]
})
</script>
