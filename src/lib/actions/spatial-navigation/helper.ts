import { writable, get } from 'svelte/store'
import { navigate } from 'actions/spatial-navigation/core'
import { elementMatchesSelector } from 'actions/spatial-navigation/polyfill'
import { EVENT_PREFIX, KEYMAPPING, ID_POOL_PREFIX, GlobalConfig, REVERSE } from 'actions/spatial-navigation/config'

/********************/
/* Private Variable */
/********************/
const defaultState = {
  _idPool: 0,
  _ready: false,
  _pause: false,
  _sections: {},
  _sectionCount: 0,
  _defaultSectionId: '',
  _lastSectionId: '',
  _duringFocusChange: false,
  _activeInputElement: null,
}

export type StateKey = keyof typeof defaultState

export const state = writable(defaultState)

function setDuringFocusChange(change: boolean) {
  state.update(($state) => {
    $state._duringFocusChange = change
    return $state
  })
}

/********************/
/* Private Function */
/********************/
export function generateId() {
  const { _idPool, _sections } = get(state)
  let id
  let newPool = _idPool
  while (true) {
    id = ID_POOL_PREFIX + String(newPool++)
    if (!_sections[id]) {
      break
    }
  }

  state.update(($state) => {
    $state._idPool = newPool
    return $state
  })

  return id
}

export function parseSelector(selector) {
  let result
  if (typeof selector === 'string') {
    result = [].slice.call(document.querySelectorAll(selector))
  } else if (typeof selector === 'object' && selector.length) {
    result = [].slice.call(selector)
  } else if (typeof selector === 'object' && selector.nodeType === 1) {
    result = [selector]
  } else {
    result = []
  }
  return result
}

export function matchSelector(elem, selector) {
  if (typeof selector === 'string') {
    return elementMatchesSelector.call(elem, selector)
  } else if (typeof selector === 'object' && selector.length) {
    return selector.includes(elem)
  } else if (typeof selector === 'object' && selector.nodeType === 1) {
    return elem === selector
  }
  return false
}

export function getCurrentFocusedElement() {
  const activeElement = document.activeElement
  if (activeElement && activeElement !== document.body) {
    return activeElement
  }
}

export function extend(out) {
  out = out || {}
  for (let i = 1; i < arguments.length; i++) {
    if (!arguments[i]) {
      continue
    }
    for (const key in arguments[i]) {
      // eslint-disable-next-line no-prototype-builtins
      if (arguments[i].hasOwnProperty(key) && arguments[i][key] !== undefined) {
        out[key] = arguments[i][key]
      }
    }
  }
  return out
}

function exclude(elemList, excludedElem) {
  if (!Array.isArray(excludedElem)) {
    excludedElem = [excludedElem]
  }
  for (let i = 0, index; i < excludedElem.length; i++) {
    index = elemList.indexOf(excludedElem[i])
    if (index >= 0) {
      elemList.splice(index, 1)
    }
  }
  return elemList
}

export function isNavigable(elem, sectionId, verifySectionSelector = false) {
  const { _sections } = get(state)

  if (!elem || !sectionId || !_sections[sectionId] || _sections[sectionId].disabled) {
    return false
  }
  if ((elem.offsetWidth <= 0 && elem.offsetHeight <= 0) || elem.hasAttribute('disabled')) {
    return false
  }
  if (verifySectionSelector && !matchSelector(elem, _sections[sectionId].selector)) {
    return false
  }
  if (typeof _sections[sectionId].navigableFilter === 'function') {
    if (_sections[sectionId].navigableFilter(elem, sectionId) === false) {
      return false
    }
  } else if (typeof GlobalConfig.navigableFilter === 'function') {
    if (GlobalConfig.navigableFilter(elem, sectionId) === false) {
      return false
    }
  }
  return true
}

export function getSectionId(elem) {
  const { _sections } = get(state)
  for (const id in _sections) {
    if (!_sections[id].disabled && matchSelector(elem, _sections[id].selector)) {
      return id
    }
  }
}

window.getSectionId = getSectionId

function getSectionNavigableElements(sectionId) {
  const { _sections } = get(state)
  return parseSelector(_sections[sectionId].selector).filter(function (elem) {
    return isNavigable(elem, sectionId)
  })
}

function getSectionDefaultElement(sectionId) {
  const { _sections } = get(state)
  let defaultElement = _sections[sectionId].defaultElement
  if (!defaultElement) {
    return null
  }
  if (typeof defaultElement === 'string') {
    defaultElement = parseSelector(defaultElement)[0]
  }
  if (isNavigable(defaultElement, sectionId, true)) {
    return defaultElement
  }
  return null
}

function getSectionLastFocusedElement(sectionId) {
  const { _sections } = get(state)
  const lastFocusedElement = _sections[sectionId].lastFocusedElement
  if (!isNavigable(lastFocusedElement, sectionId, true)) {
    return null
  }
  return lastFocusedElement
}

export function fireEvent(elem, type, details = undefined, cancelable = undefined) {
  if (arguments.length < 4) {
    cancelable = true
  }
  const evt = document.createEvent('CustomEvent')
  evt.initCustomEvent(EVENT_PREFIX + type, true, cancelable, details)
  return elem.dispatchEvent(evt)
}

export function focusElement(elem, sectionId, direction = undefined) {
  if (!elem) {
    return false
  }

  const currentFocusedElement = getCurrentFocusedElement()

  const silentFocus = function () {
    if (currentFocusedElement) {
      // @ts-ignore
      currentFocusedElement.blur()
    }
    elem.focus()
    focusChanged(elem, sectionId)
  }
  const { _duringFocusChange, _pause } = get(state)

  if (_duringFocusChange) {
    silentFocus()
    return true
  }

  setDuringFocusChange(true)

  if (_pause) {
    silentFocus()
    setDuringFocusChange(false)

    return true
  }

  if (currentFocusedElement) {
    const unfocusProperties = {
      nextElement: elem,
      nextSectionId: sectionId,
      direction,
      native: false,
    }
    if (!fireEvent(currentFocusedElement, 'willunfocus', unfocusProperties)) {
      setDuringFocusChange(false)
      return false
    }
    // @ts-ignore
    currentFocusedElement.blur()
    fireEvent(currentFocusedElement, 'unfocused', unfocusProperties, false)
  }

  const focusProperties = {
    previousElement: currentFocusedElement,
    sectionId,
    direction,
    native: false,
  }
  if (!fireEvent(elem, 'willfocus', focusProperties)) {
    setDuringFocusChange(false)
    return false
  }
  elem.focus()
  fireEvent(elem, 'focused', focusProperties, false)

  setDuringFocusChange(false)

  focusChanged(elem, sectionId)
  return true
}

function focusChanged(elem, sectionId) {
  if (!sectionId) {
    sectionId = getSectionId(elem)
  }

  if (sectionId) {
    state.update(($state) => {
      $state._sections[sectionId].lastFocusedElement = elem
      $state._lastSectionId = sectionId
      return $state
    })
  }
}

function setActiveInputElement(elem) {
  if (elem.tagName === 'INPUT') {
    state.update(($state) => {
      $state._activeInputElement = elem
      return $state
    })
  }
}

window.setActiveInputElement = setActiveInputElement

function focusActiveInputElement() {
  const { _activeInputElement } = get(state)
  if (_activeInputElement) {
    _activeInputElement.focus()
  }
}

window.focusActiveInputElement = focusActiveInputElement

export function focusExtendedSelector(selector, direction = undefined) {
  if (selector.charAt(0) === '@') {
    if (selector.length === 1) {
      return focusSection()
    } else {
      const sectionId = selector.substr(1)
      return focusSection(sectionId)
    }
  } else {
    const next = parseSelector(selector)[0]
    if (next) {
      const nextSectionId = getSectionId(next)
      if (isNavigable(next, nextSectionId)) {
        return focusElement(next, nextSectionId, direction)
      }
    }
  }
  return false
}

export function focusSection(sectionId = undefined) {
  const { _sections, _defaultSectionId, _lastSectionId } = get(state)

  const range = []
  const addRange = function (id) {
    if (id && !range.includes(id) && _sections[id] && !_sections[id].disabled) {
      range.push(id)
    }
  }

  if (sectionId) {
    addRange(sectionId)
  } else {
    addRange(_defaultSectionId)
    addRange(_lastSectionId)
    Object.keys(_sections).map(addRange)
  }

  for (let i = 0; i < range.length; i++) {
    const id = range[i]
    let next

    if (_sections[id].enterTo === 'last-focused') {
      next =
        getSectionLastFocusedElement(id) ||
        getSectionDefaultElement(id) ||
        getSectionNavigableElements(id)[0]
    } else {
      next =
        getSectionDefaultElement(id) ||
        getSectionLastFocusedElement(id) ||
        getSectionNavigableElements(id)[0]
    }

    if (next) {
      return focusElement(next, id)
    }
  }

  return false
}

function fireNavigatefailed(elem, direction) {
  fireEvent(
    elem,
    'navigatefailed',
    {
      direction,
    },
    false,
  )
}

function gotoLeaveFor(sectionId, direction) {
  const { _sections } = get(state)

  if (_sections[sectionId].leaveFor && _sections[sectionId].leaveFor[direction] !== undefined) {
    const next = _sections[sectionId].leaveFor[direction]

    if (typeof next === 'string') {
      if (next === '') {
        return null
      }
      return focusExtendedSelector(next, direction)
    }

    const nextSectionId = getSectionId(next)
    if (isNavigable(next, nextSectionId)) {
      return focusElement(next, nextSectionId, direction)
    }
  }
  return false
}

export function focusNext(direction, currentFocusedElement, currentSectionId) {
  const extSelector = currentFocusedElement.getAttribute('data-sn-' + direction)
  if (typeof extSelector === 'string') {
    if (extSelector === '' || !focusExtendedSelector(extSelector, direction)) {
      fireNavigatefailed(currentFocusedElement, direction)
      return false
    }
    return true
  }

  const sectionNavigableElements = {}
  let allNavigableElements = []
  const { _sections } = get(state)
  for (const id in _sections) {
    sectionNavigableElements[id] = getSectionNavigableElements(id)
    allNavigableElements = allNavigableElements.concat(sectionNavigableElements[id])
  }

  // @ts-ignore
  const config = extend({}, GlobalConfig, _sections[currentSectionId])
  let next

  if (config.restrict === 'self-only' || config.restrict === 'self-first') {
    const currentSectionNavigableElements = sectionNavigableElements[currentSectionId]

    next = navigate(
      currentFocusedElement,
      direction,
      exclude(currentSectionNavigableElements, currentFocusedElement),
      config,
    )

    if (!next && config.restrict === 'self-first') {
      next = navigate(
        currentFocusedElement,
        direction,
        exclude(allNavigableElements, currentSectionNavigableElements),
        config,
      )
    }
  } else {
    next = navigate(
      currentFocusedElement,
      direction,
      exclude(allNavigableElements, currentFocusedElement),
      config,
    )
  }

  if (next) {
    state.update(($state) => {
      $state._sections[currentSectionId].previous = {
        target: currentFocusedElement,
        destination: next,
        reverse: REVERSE[direction],
      }
      return $state
    })

    const nextSectionId = getSectionId(next)

    if (currentSectionId !== nextSectionId) {
      const result = gotoLeaveFor(currentSectionId, direction)
      if (result) {
        return true
      } else if (result === null) {
        fireNavigatefailed(currentFocusedElement, direction)
        return false
      }

      let enterToElement
      switch (_sections[nextSectionId].enterTo) {
        case 'last-focused':
          enterToElement =
            getSectionLastFocusedElement(nextSectionId) || getSectionDefaultElement(nextSectionId)
          break
        case 'default-element':
          enterToElement = getSectionDefaultElement(nextSectionId)
          break
      }
      if (enterToElement) {
        next = enterToElement
      }
    }

    return focusElement(next, nextSectionId, direction)
  } else if (gotoLeaveFor(currentSectionId, direction)) {
    return true
  }

  fireNavigatefailed(currentFocusedElement, direction)
  return false
}

export function onKeyDown(evt) {
  const { _pause, _sectionCount, _lastSectionId } = get(state)
  if (!_sectionCount || _pause || evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey) {
    return
  }

  let currentFocusedElement
  const preventDefault = function () {
    evt.preventDefault()
    evt.stopPropagation()
    return false
  }

  const direction = KEYMAPPING[evt.keyCode]
  if (!direction) {
    if (evt.keyCode === 13) {
      currentFocusedElement = getCurrentFocusedElement()
      if (currentFocusedElement && getSectionId(currentFocusedElement)) {
        if (!fireEvent(currentFocusedElement, 'enter-down')) {
          return preventDefault()
        }
      }
    }
    return
  }

  currentFocusedElement = getCurrentFocusedElement()

  if (!currentFocusedElement) {
    if (_lastSectionId) {
      currentFocusedElement = getSectionLastFocusedElement(_lastSectionId)
    }
    if (!currentFocusedElement) {
      focusSection()
      return preventDefault()
    }
  }

  const currentSectionId = getSectionId(currentFocusedElement)
  if (!currentSectionId) {
    return
  }

  const willmoveProperties = {
    direction,
    sectionId: currentSectionId,
    cause: 'keydown',
  }

  if (fireEvent(currentFocusedElement, 'willmove', willmoveProperties)) {
    focusNext(direction, currentFocusedElement, currentSectionId)
  }

  return preventDefault()
}

export function onKeyUp(evt) {
  const { _pause, _sectionCount } = get(state)
  if (evt.altKey || evt.ctrlKey || evt.metaKey || evt.shiftKey) {
    return
  }
  if (!_pause && _sectionCount && evt.keyCode === 13) {
    const currentFocusedElement = getCurrentFocusedElement()
    if (currentFocusedElement && getSectionId(currentFocusedElement)) {
      if (!fireEvent(currentFocusedElement, 'enter-up')) {
        evt.preventDefault()
        evt.stopPropagation()
      }
    }
  }
}

export function onFocus(evt) {
  const { _pause, _sectionCount, _duringFocusChange } = get(state)
  const target = evt.target
  if (target !== window && target !== document && _sectionCount && !_duringFocusChange) {
    const sectionId = getSectionId(target)
    if (sectionId) {
      if (_pause) {
        focusChanged(target, sectionId)
        return
      }

      const focusProperties = {
        sectionId,
        native: true,
      }

      if (!fireEvent(target, 'willfocus', focusProperties)) {
        setDuringFocusChange(true)
        target.blur()
        setDuringFocusChange(false)
      } else {
        fireEvent(target, 'focused', focusProperties, false)
        focusChanged(target, sectionId)
      }
    }
  }
}

export function onBlur(evt) {
  const { _pause, _sectionCount, _duringFocusChange } = get(state)
  const target = evt.target
  if (
    target !== window &&
    target !== document &&
    !_pause &&
    _sectionCount &&
    !_duringFocusChange &&
    getSectionId(target)
  ) {
    const unfocusProperties = {
      native: true,
    }
    if (!fireEvent(target, 'willunfocus', unfocusProperties)) {
      setDuringFocusChange(true)
      setTimeout(function () {
        target.focus()
        setDuringFocusChange(false)
      })
    } else {
      fireEvent(target, 'unfocused', unfocusProperties, false)
    }
  }
}
