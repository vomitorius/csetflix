<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Modal Scroll & Touch Test</h1>
    <p class="mb-4 text-gray-300">This page demonstrates the fix for the webtor modal scrolling and touch interaction issues.</p>
    
    <div class="space-x-2 mb-6">
      <button 
        @click="openModal('old')" 
        class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
      >
        OLD Modal (with issue)
      </button>
      <button 
        @click="openModal('new')" 
        class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
      >
        FIXED Modal (with solution)
      </button>
    </div>

    <div class="grid md:grid-cols-2 gap-4">
      <div class="card bg-red-900/20 border border-red-700">
        <div class="card-body">
          <h3 class="font-bold text-red-400">❌ OLD Implementation</h3>
          <ul class="text-sm space-y-1">
            <li>• <code>overflow-hidden</code> - prevents scrolling</li>
            <li>• No touch-action properties</li>
            <li>• Content gets cut off</li>
            <li>• Poor mobile experience</li>
          </ul>
        </div>
      </div>
      
      <div class="card bg-green-900/20 border border-green-700">
        <div class="card-body">
          <h3 class="font-bold text-green-400">✅ FIXED Implementation</h3>
          <ul class="text-sm space-y-1">
            <li>• <code>overflow-auto</code> - enables scrolling</li>
            <li>• <code>touch-action: manipulation</code></li>
            <li>• All content accessible</li>
            <li>• Better mobile experience</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- OLD Modal (broken) -->
    <div v-if="showOldModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-gray-900 rounded-lg p-6 w-[95vw] h-[95vh] max-w-7xl overflow-hidden flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-white">❌ OLD: Can't Scroll (overflow-hidden)</h3>
          <button @click="closeModal('old')" class="text-white hover:text-red-400 text-2xl">×</button>
        </div>
        <div class="flex-1 min-h-0 relative">
          <div class="h-[200vh] bg-gradient-to-b from-gray-800 to-gray-900 p-4">
            <h4 class="text-lg mb-4 text-red-400">Try to scroll - it won't work!</h4>
            <p class="mb-4">This modal uses <code>overflow-hidden</code> which prevents scrolling.</p>
            <p class="mb-4">On touch devices, you also can't interact properly.</p>
            <div class="space-y-4">
              <div v-for="i in 15" :key="`old-${i}`" class="p-4 bg-gray-800 rounded">
                Content Item {{ i }}
              </div>
              <div class="p-4 bg-red-800 rounded font-bold">
                🎯 Bottom Content - Can you reach this without scrolling?
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FIXED Modal (working) -->
    <div v-if="showNewModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-gray-900 rounded-lg p-6 w-[95vw] h-[95vh] max-w-7xl overflow-auto flex flex-col" style="touch-action: manipulation;">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-white">✅ FIXED: Can Scroll! (overflow-auto + touch-action)</h3>
          <button @click="closeModal('new')" class="text-white hover:text-red-400 text-2xl">×</button>
        </div>
        <div class="flex-1 min-h-0 relative" style="touch-action: manipulation;">
          <div class="h-[200vh] bg-gradient-to-b from-gray-800 to-gray-900 p-4" style="touch-action: manipulation;">
            <h4 class="text-lg mb-4 text-green-400">Try to scroll - it works!</h4>
            <p class="mb-4">This modal uses <code>overflow-auto</code> which allows scrolling.</p>
            <p class="mb-4">Touch interactions also work properly thanks to <code>touch-action: manipulation</code>.</p>
            <div class="space-y-4">
              <div v-for="i in 15" :key="`new-${i}`" class="p-4 bg-gray-800 rounded">
                Content Item {{ i }}
              </div>
              <div class="p-4 bg-green-800 rounded font-bold">
                🎯 Bottom Content - You can reach this by scrolling!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const showOldModal = ref(false)
const showNewModal = ref(false)

function openModal(type: 'old' | 'new') {
  if (type === 'old') {
    showOldModal.value = true
  } else {
    showNewModal.value = true
  }
}

function closeModal(type: 'old' | 'new') {
  if (type === 'old') {
    showOldModal.value = false
  } else {
    showNewModal.value = false
  }
}

useHead({
  title: 'Modal Test - CsetFlix'
})
</script>