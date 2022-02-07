import { defineStore } from 'pinia'

export type EsbuildType = typeof import("esbuild");

export const useEsbuildStore = defineStore('useEsbuild', () => {
  const state = reactive({
    loading: true,
    status: 'Loading...',
    esbuild: null as EsbuildType | null,
    version: 'latest'
  })

  return {
    ...toRefs(state),
  }
})
