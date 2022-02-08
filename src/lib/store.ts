import { writable, derived, get } from 'svelte/store'
import { createNavigation } from 'actions/spatial-navigation'
import { toReadableStore, toWritableStore } from 'helper'

createNavigation()

export const store = toWritableStore(window.SigmaInteractive.store)
export const metadata = toWritableStore(window.SigmaInteractive.metadata)
export const notifications = window.SigmaInteractive.notifications
export const rectsMap = toWritableStore(window.SigmaInteractive.rectsMap)
export const state = toReadableStore(window.SI.state)
export const screenOrientation = toWritableStore(window.SigmaInteractive.screenOrientation)
export const playerRect = toReadableStore(window.SI.playerRect)

export const progress = writable(0)

export const globalState = writable({
  started: false,
  isInteracted: false,
  toRemoved: false,
  overlayId: '{{#OVERLAY_ID}}',
})

export const globalDisabled = derived(
  globalState,
  ($global) => $global.isInteracted || $global.toRemoved,
)

export const lastFocusedKey = derived(window.SpatialNavigation.state, ($state) => {
  const { _activeInputElement } = $state
  return _activeInputElement?.dataset?.key
})

const removed = false

export function interactiveOverlay(action: string, userInput: Record<string, any>,) {
  const overlayId = get(globalState).overlayId

  window.SI.interactiveService.send({
    type: 'INTERACTED',
    overlayId: overlayId,
    action: action,
    userInput: userInput,
  })
}

export const timeoutOverlay = function () {
  const { isInteracted, overlayId } = get(globalState)
  if (!removed && !isInteracted) {
    window.SI.interactiveService.send({
      type: 'TIMEOUT',
      overlayId,
    })
  }
}

export const closeOverlay = (function () {
  let executed = false
  return function () {
    const { isInteracted, overlayId } = get(globalState)
    if (!executed && !removed && !isInteracted) {
      executed = true
      window.SI.interactiveService.send({
        type: 'CLOSE',
        overlayId,
      })
    }
  }
})()


export function updateBoundingRects(newRect: string[], rectId: string) {
  if (!newRect.every((item) => item === '0.00')) {
    rectsMap.set({ ...get(rectsMap), [rectId]: newRect })
  }
}

export function removeBoundingRects(rectId: string) {
  const oldRects = get(rectsMap)
  const newRects = {}
  Object.keys(oldRects).forEach((key) => {
    if (key !== rectId) {
      newRects[key] = oldRects[key]
    }
  })
  rectsMap.set(newRects)
}


export const selectStore = writable({
  selectedIndex: undefined,
})

export const answerState = writable({
  answer: '0:0',
  answerTheSame: '',
})
