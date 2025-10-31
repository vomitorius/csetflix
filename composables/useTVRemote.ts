// TV Remote Navigation Composable
// Handles keyboard navigation for TV remote support
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

export interface FocusableElement {
  element: HTMLElement
  id: string
  priority?: number
}

export const useTVRemote = () => {
  const focusableElements = ref<FocusableElement[]>([])
  const currentFocusIndex = ref(-1)
  const isEnabled = ref(true)

  // Focus management
  const setFocus = (index: number) => {
    if (index >= 0 && index < focusableElements.value.length) {
      const item = focusableElements.value[index]
      if (item?.element && typeof item.element.focus === 'function') {
        currentFocusIndex.value = index
        item.element.focus()
        item.element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        })
        
        // Add visual focus indicator
        document.querySelectorAll('.tv-focus').forEach(el => el.classList.remove('tv-focus'))
        item.element.classList.add('tv-focus')
      }
    }
  }

  // Register focusable elements
  const registerFocusable = (element: HTMLElement, id: string, priority = 0) => {
    // Ensure we have a valid DOM element
    if (!element || typeof element.focus !== 'function') {
      console.warn(`Invalid element registered for TV remote: ${id}`)
      return () => {} // Return empty unregister function
    }
    
    const focusable: FocusableElement = { element, id, priority }
    focusableElements.value.push(focusable)
    
    // Sort by priority (higher priority first)
    focusableElements.value.sort((a, b) => (b.priority || 0) - (a.priority || 0))
    
    return () => {
      const index = focusableElements.value.findIndex(item => item.id === id)
      if (index > -1) {
        focusableElements.value.splice(index, 1)
      }
    }
  }

  // Navigation functions
  const navigateUp = () => {
    if (!isEnabled.value || focusableElements.value.length === 0) return
    
    const currentElement = focusableElements.value[currentFocusIndex.value]
    if (!currentElement) {
      setFocus(0)
      return
    }

    const currentRect = currentElement.element.getBoundingClientRect()
    let bestMatch = -1
    let minDistance = Infinity

    // Find element above current one
    focusableElements.value.forEach((item, index) => {
      if (index === currentFocusIndex.value) return
      
      const rect = item.element.getBoundingClientRect()
      if (rect.bottom <= currentRect.top) {
        const distance = Math.abs(rect.left - currentRect.left) + (currentRect.top - rect.bottom)
        if (distance < minDistance) {
          minDistance = distance
          bestMatch = index
        }
      }
    })

    if (bestMatch !== -1) {
      setFocus(bestMatch)
    }
  }

  const navigateDown = () => {
    if (!isEnabled.value || focusableElements.value.length === 0) return
    
    const currentElement = focusableElements.value[currentFocusIndex.value]
    if (!currentElement) {
      setFocus(0)
      return
    }

    const currentRect = currentElement.element.getBoundingClientRect()
    let bestMatch = -1
    let minDistance = Infinity

    // Find element below current one
    focusableElements.value.forEach((item, index) => {
      if (index === currentFocusIndex.value) return
      
      const rect = item.element.getBoundingClientRect()
      if (rect.top >= currentRect.bottom) {
        const distance = Math.abs(rect.left - currentRect.left) + (rect.top - currentRect.bottom)
        if (distance < minDistance) {
          minDistance = distance
          bestMatch = index
        }
      }
    })

    if (bestMatch !== -1) {
      setFocus(bestMatch)
    }
  }

  const navigateLeft = () => {
    if (!isEnabled.value || focusableElements.value.length === 0) return
    
    const currentElement = focusableElements.value[currentFocusIndex.value]
    if (!currentElement) {
      setFocus(0)
      return
    }

    const currentRect = currentElement.element.getBoundingClientRect()
    let bestMatch = -1
    let minDistance = Infinity

    // Find element to the left
    focusableElements.value.forEach((item, index) => {
      if (index === currentFocusIndex.value) return
      
      const rect = item.element.getBoundingClientRect()
      if (rect.right <= currentRect.left) {
        const distance = Math.abs(rect.top - currentRect.top) + (currentRect.left - rect.right)
        if (distance < minDistance) {
          minDistance = distance
          bestMatch = index
        }
      }
    })

    if (bestMatch !== -1) {
      setFocus(bestMatch)
    }
  }

  const navigateRight = () => {
    if (!isEnabled.value || focusableElements.value.length === 0) return
    
    const currentElement = focusableElements.value[currentFocusIndex.value]
    if (!currentElement) {
      setFocus(0)
      return
    }

    const currentRect = currentElement.element.getBoundingClientRect()
    let bestMatch = -1
    let minDistance = Infinity

    // Find element to the right
    focusableElements.value.forEach((item, index) => {
      if (index === currentFocusIndex.value) return
      
      const rect = item.element.getBoundingClientRect()
      if (rect.left >= currentRect.right) {
        const distance = Math.abs(rect.top - currentRect.top) + (rect.left - currentRect.right)
        if (distance < minDistance) {
          minDistance = distance
          bestMatch = index
        }
      }
    })

    if (bestMatch !== -1) {
      setFocus(bestMatch)
    }
  }

  const activateCurrent = () => {
    if (!isEnabled.value || currentFocusIndex.value === -1) return
    
    const currentElement = focusableElements.value[currentFocusIndex.value]
    if (currentElement?.element) {
      currentElement.element.click()
    }
  }

  const goBack = () => {
    window.history.back()
  }

  // Keyboard event handler
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isEnabled.value) return

    // Check if user is typing in an input field
    const target = event.target
    const isTyping = target instanceof HTMLElement && (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    )

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        navigateUp()
        break
      case 'ArrowDown':
        event.preventDefault()
        navigateDown()
        break
      case 'ArrowLeft':
        event.preventDefault()
        navigateLeft()
        break
      case 'ArrowRight':
        event.preventDefault()
        navigateRight()
        break
      case 'Enter':
        event.preventDefault()
        activateCurrent()
        break
      case 'Escape':
      case 'Backspace':
        // Don't intercept Escape/Backspace when user is typing in an input field
        if (!isTyping) {
          event.preventDefault()
          goBack()
        }
        break
    }
  }

  // Initialize focus on first element
  const initializeFocus = async () => {
    await nextTick()
    if (focusableElements.value.length > 0 && currentFocusIndex.value === -1) {
      setFocus(0)
    }
  }

  // Clear all focus indicators
  const clearFocus = () => {
    document.querySelectorAll('.tv-focus').forEach(el => el.classList.remove('tv-focus'))
    currentFocusIndex.value = -1
  }

  // Reset and refresh focusable elements
  const refresh = async () => {
    focusableElements.value = []
    currentFocusIndex.value = -1
    await nextTick()
  }

  // Enable/disable TV remote
  const enable = () => {
    isEnabled.value = true
  }

  const disable = () => {
    isEnabled.value = false
    clearFocus()
  }

  // Setup event listeners
  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
    clearFocus()
  })

  return {
    registerFocusable,
    setFocus,
    initializeFocus,
    clearFocus,
    refresh,
    enable,
    disable,
    isEnabled,
    currentFocusIndex,
    focusableElements
  }
}