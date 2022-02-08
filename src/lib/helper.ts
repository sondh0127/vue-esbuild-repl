import { readable } from 'svelte/store'

export function toWritableStore(sStore) {
  if (sStore) {
    return {
      subscribe: sStore.subscribe,
      set: sStore.set,
      update: sStore.update,
    }
  }

  return null
}

export function toReadableStore(sStore) {
  if (sStore) {
    return {
      subscribe: sStore.subscribe,
    }
  }

  return null
}

export function debounce(func, wait, immediate) {
  let timeout
  return function () {
    const context = this
    const args = arguments
    clearTimeout(timeout)
    timeout = setTimeout(function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }, wait)
    if (immediate && !timeout) func.apply(context, args)
  }
}

export const orientation = readable('landscape', (set) => {
  const handleResize = debounce(
    () => {
      if (window.innerWidth <= window.innerHeight) {
        set('portrait')
      } else {
        set('landscape')
      }
      setTimeout(() => {
        window.SpatialNavigation.focus()
      }, 0)
    },
    0,
    false,
  )
  handleResize()

  // window.addEventListener('resize', handleResize)
  document.addEventListener('orientationchange', handleResize)

  return () => {
    // window.removeEventListener('resize', handleResize)
    document.removeEventListener('orientationchange', handleResize)
  }
})
