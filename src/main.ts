import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'

const app = createApp(App)
export const pinia = createPinia()
app.use(pinia)
app.mount('#app')

import('./behaviors').then(() => {})
