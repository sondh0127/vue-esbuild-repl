// import App from 'MainApp.svelte'
import App from 'FootballSub/FootballSub.svelte'

const createApp = (options) => new App({
  target: document.body,
  ...options,
  intro: true,
})

module.exports = createApp
