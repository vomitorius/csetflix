<!-- Generated by Copilot 2025-04-27 15:30 -->
<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/90" @click="$emit('update:modelValue', false)"></div>
    
    <!-- Gallery Content -->
    <div class="relative z-10 w-full h-full flex flex-col">
      <!-- Close Button -->
      <button 
        class="absolute top-4 right-4 p-2 text-white hover:text-red-600 transition-colors z-20"
        @click="$emit('update:modelValue', false)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <!-- Image Display -->
      <div class="flex-1 flex items-center justify-center p-4">
        <img 
          :src="currentImageUrl" 
          :alt="'Image ' + (currentIndex + 1)"
          class="max-h-[90vh] max-w-[90vw] object-contain"
        />
      </div>
      
      <!-- Navigation Controls -->
      <div class="absolute inset-y-0 left-0 flex items-center">
        <button 
          v-show="currentIndex > 0"
          class="p-2 m-4 text-white hover:text-red-600 transition-colors bg-black/50 rounded-full"
          @click="previousImage"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <div class="absolute inset-y-0 right-0 flex items-center">
        <button 
          v-show="currentIndex < images.length - 1"
          class="p-2 m-4 text-white hover:text-red-600 transition-colors bg-black/50 rounded-full"
          @click="nextImage"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <!-- Image Counter -->
      <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full">
        <span class="text-white">{{ currentIndex + 1 }} / {{ images.length }}</span>
      </div>
      
      <!-- Thumbnails -->
      <div class="absolute bottom-0 inset-x-0 overflow-x-auto py-4 px-8 bg-gradient-to-t from-black/80 to-transparent">
        <div class="flex gap-2 justify-center">
          <button 
            v-for="(image, index) in images" 
            :key="index"
            class="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden transition-transform hover:scale-110"
            :class="{ 'ring-2 ring-red-600': currentIndex === index }"
            @click="currentIndex = index"
          >
            <img 
              :src="`${baseUrl}/w200${image.file_path}`" 
              :alt="'Thumbnail ' + (index + 1)"
              class="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MovieImage {
  file_path: string
  width: number
  height: number
  aspect_ratio: number
}

const props = defineProps<{
  modelValue: boolean
  images: MovieImage[]
  baseUrl: string
  initialIndex?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const currentIndex = ref(props.initialIndex || 0)

const currentImageUrl = computed(() => {
  if (!props.images[currentIndex.value]) return ''
  return `${props.baseUrl}/original${props.images[currentIndex.value].file_path}`
})

function previousImage() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function nextImage() {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  }
}

// Handle keyboard navigation
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})

function handleKeyPress(event: KeyboardEvent) {
  if (!props.modelValue) return
  
  switch (event.key) {
    case 'ArrowLeft':
      previousImage()
      break
    case 'ArrowRight':
      nextImage()
      break
    case 'Escape':
      emit('update:modelValue', false)
      break
  }
}
</script>
