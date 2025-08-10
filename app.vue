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
          Powered by TMDB
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Configure head metadata with iOS specific tags
useHead({
  title: 'CsetFlix - Personal Media Center',
  meta: [
    { name: 'description', content: 'Browse, discover, and download movies with integration to qBittorrent and Jellyfin' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'CsetFlix' },
    { name: 'theme-color', content: '#1f2937' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
    { rel: 'manifest', href: '/icons/site.webmanifest' }
  ]
})
</script>
