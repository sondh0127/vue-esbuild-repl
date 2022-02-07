<script setup lang="ts">
import { useEsbuildStore } from './stores'

const esbuildStore = useEsbuildStore()
</script>

<template>
  <div>
    <div>Loading: {{esbuildStore.loading}}</div>
    <div>Status: {{esbuildStore.status}}</div>
    <div>Esbuild: {{esbuildStore.esbuild}}</div>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
