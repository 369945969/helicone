import { defineStore } from 'pinia'
import { ref } from 'vue'

export type RequestRenderMode = 'stream' | 'non-stream' | 'auto'

export const useRequestRenderModeStore = defineStore('requestRenderMode', () => {
  const renderMode = ref<RequestRenderMode>('auto')

  function setMode(mode: RequestRenderMode) {
    renderMode.value = mode
    localStorage.setItem('request_render_mode', mode)
  }

  function loadFromStorage() {
    const stored = localStorage.getItem('request_render_mode') as RequestRenderMode | null
    if (stored) {
      renderMode.value = stored
    }
  }

  return { renderMode, setMode, loadFromStorage }
})
