import { defineConfig } from 'vite'
import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Unocss from 'unocss/vite'
import { presetUno, presetAttributify } from 'unocss'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue(),
    Unocss({
      include: [/\.vue$/, /\.vue\?vue/, /\.[jt]sx$/],
      presets: [
        presetUno(),
      ]
    }),
    AutoImport({
      imports: ['vue', 'pinia', '@vueuse/core']
    }),
  ]
})
