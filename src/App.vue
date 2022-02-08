<script setup lang="ts">
import { useEsbuildStore } from './stores'

const esbuildStore = useEsbuildStore()

const { copy, isSupported } = useClipboard()

function copyFile(contents: string) {
  if (isSupported) {
    copy(contents)
  }
}

const name = ref('jack')

const userInfo = asyncComputed(
  async() => {
    return await new Promise<string>((resolve, reject) => {
      resolve(name.value)
    })
  },
  null, // initial state
)

</script>

<template>
  <div>
    <div>Loading: {{ esbuildStore.loading }}</div>
    <div>Status: {{ esbuildStore.status }}</div>
    <div>Esbuild: {{ esbuildStore.esbuild }}</div>
    <div>Loading: {{ esbuildStore.isLoading }}</div>
    <button @click="esbuildStore.execute()">execute</button>
    <div class="flex space-x-10">
      <div class="w-1/2">
        <div v-for="m in esbuildStore.modules" :key="m.name">
          <div>{{m.name}}</div>
          <textarea class="w-full" v-model="m.contents">
          </textarea>
        </div>
      </div>
      <div class="w-1/2">
        <div v-for="file in esbuildStore.outputs.files" :key="file.name">
          <button @click="copyFile(file.contents)"> Copy </button>
          <div>{{file.name}}</div>
          <div>{{file.contents}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
