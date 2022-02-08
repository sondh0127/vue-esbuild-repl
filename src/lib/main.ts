import App from 'MainApp.svelte'

const createApp = (options) => new App({
  target: document.body,
  ...options,
  intro: true,
})

module.exports = createApp
