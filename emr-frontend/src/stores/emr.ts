import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { EditorMode } from '@/types/record'

export const useEmrStore = defineStore('emr', () => {
  const editorMode = ref<EditorMode>('form')
  const autoSaveEnabled = ref(true)
  const autoSaveInterval = ref(30000) // 30秒

  function setMode(mode: EditorMode) {
    editorMode.value = mode
  }

  function toggleAutoSave(enabled: boolean) {
    autoSaveEnabled.value = enabled
  }

  return {
    editorMode,
    autoSaveEnabled,
    autoSaveInterval,
    setMode,
    toggleAutoSave,
  }
})
