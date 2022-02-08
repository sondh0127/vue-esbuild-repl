import { get } from 'svelte/store'
import { GlobalConfig, REVERSE } from 'actions/spatial-navigation/config'
import {
  fireEvent,
  focusElement,
  focusExtendedSelector,
  focusNext,
  focusSection,
  generateId,
  getCurrentFocusedElement,
  getSectionId,
  isNavigable,
  matchSelector,
  onBlur,
  onFocus,
  onKeyDown,
  onKeyUp,
  parseSelector,
  state,
  extend,
} from 'actions/spatial-navigation/helper'

/*******************/
/* Public Function */
/*******************/

const SpatialNavigation = {
  state,
  getState: () => get(state),
  init() {
    const { _ready } = get(state)
    if (!_ready) {
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
      window.addEventListener('focus', onFocus, true)
      window.addEventListener('blur', onBlur, true)
      state.update(($state) => {
        $state._ready = true
        return $state
      })
    }
  },

  uninit() {
    window.removeEventListener('blur', onBlur, true)
    window.removeEventListener('focus', onFocus, true)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('keydown', onKeyDown)
    SpatialNavigation.clear()

    state.update(($state) => {
      $state._idPool = 0
      $state._ready = false
      return $state
    })
  },

  clear() {
    state.update(($state) => {
      $state._sections = {}
      $state._sectionCount = 0
      $state._defaultSectionId = ''
      $state._lastSectionId = ''
      $state._duringFocusChange = false
      return $state
    })
  },

  // set(<config>);
  // set(<sectionId>, <config>);
  set() {
    const { _sections } = get(state)
    let sectionId, config

    if (typeof arguments[0] === 'object') {
      config = arguments[0]
    } else if (typeof arguments[0] === 'string' && typeof arguments[1] === 'object') {
      sectionId = arguments[0]
      config = arguments[1]
      if (!_sections[sectionId]) {
        throw new Error('Section "' + sectionId + '" doesn\'t exist!')
      }
    } else {
      return
    }

    for (const key in config) {
      if (GlobalConfig[key] !== undefined) {
        if (sectionId) {
          _sections[sectionId][key] = config[key]
        } else if (config[key] !== undefined) {
          GlobalConfig[key] = config[key]
        }
      }
    }

    if (sectionId) {
      // remove "undefined" items
      // @ts-ignore
      _sections[sectionId] = extend({}, _sections[sectionId])
    }
  },

  // add(<config>);
  // add(<sectionId>, <config>);
  add() {
    const { _sections } = get(state)

    let sectionId
    let config: any = {}

    if (typeof arguments[0] === 'object') {
      config = arguments[0]
    } else if (typeof arguments[0] === 'string' && typeof arguments[1] === 'object') {
      sectionId = arguments[0]
      config = arguments[1]
    }

    if (!sectionId) {
      sectionId = typeof config.id === 'string' ? config.id : generateId()
    }

    if (_sections[sectionId]) {
      throw new Error('Section "' + sectionId + '" has already existed!')
    }

    _sections[sectionId] = {}
    state.update(($state) => {
      $state._sectionCount++
      return $state
    })
    // @ts-ignore
    SpatialNavigation.set(sectionId, config)

    return sectionId
  },

  remove(sectionId) {
    const { _sections, _lastSectionId } = get(state)
    if (!sectionId || typeof sectionId !== 'string') {
      throw new Error('Please assign the "sectionId"!')
    }
    if (_sections[sectionId]) {
      state.update(($state) => {
        $state._sections[sectionId] = undefined
        // @ts-ignore
        $state._sections = extend({}, _sections)
        $state._sectionCount--
        return $state
      })

      if (_lastSectionId === sectionId) {
        state.update(($state) => {
          $state._lastSectionId = ''
          return $state
        })
      }
      return true
    }
    return false
  },

  disable(sectionId) {
    const { _sections } = get(state)
    if (_sections[sectionId]) {
      state.update(($state) => {
        $state._sections[sectionId].disabled = true
        return $state
      })
      return true
    }
    return false
  },

  enable(sectionId) {
    const { _sections } = get(state)
    if (_sections[sectionId]) {
      state.update(($state) => {
        $state._sections[sectionId].disabled = false
        return $state
      })
      return true
    }
    return false
  },

  pause() {
    state.update(($state) => {
      $state._pause = true
      return $state
    })
  },

  resume() {
    state.update(($state) => {
      $state._pause = false
      return $state
    })
  },

  // focus([silent])
  // focus(<sectionId>, [silent])
  // focus(<extSelector>, [silent])
  // Note: "silent" is optional and default to false
  focus(elem, silent = undefined) {
    const { _pause, _sections } = get(state)
    let result = false

    if (silent === undefined && typeof elem === 'boolean') {
      silent = elem
      elem = undefined
    }

    const autoPause = !_pause && silent

    if (autoPause) {
      SpatialNavigation.pause()
    }

    if (!elem) {
      result = focusSection()
    } else if (typeof elem === 'string') {
      if (_sections[elem]) {
        result = focusSection(elem)
      } else {
        result = focusExtendedSelector(elem)
      }
    } else {
      const nextSectionId = getSectionId(elem)
      if (isNavigable(elem, nextSectionId)) {
        result = focusElement(elem, nextSectionId)
      }
    }

    if (autoPause) {
      SpatialNavigation.resume()
    }

    return result
  },

  // move(<direction>)
  // move(<direction>, <selector>)
  move(direction, selector) {
    direction = direction.toLowerCase()
    if (!REVERSE[direction]) {
      return false
    }

    const elem = selector ? parseSelector(selector)[0] : getCurrentFocusedElement()
    if (!elem) {
      return false
    }

    const sectionId = getSectionId(elem)
    if (!sectionId) {
      return false
    }

    const willmoveProperties = {
      direction,
      sectionId,
      cause: 'api',
    }

    if (!fireEvent(elem, 'willmove', willmoveProperties)) {
      return false
    }

    return focusNext(direction, elem, sectionId)
  },

  // makeFocusable()
  // makeFocusable(<sectionId>)
  makeFocusable(sectionId) {
    const { _sections } = get(state)

    const doMakeFocusable = function (section) {
      const tabIndexIgnoreList =
        section.tabIndexIgnoreList !== undefined
          ? section.tabIndexIgnoreList
          : GlobalConfig.tabIndexIgnoreList
      parseSelector(section.selector).forEach(function (elem) {
        if (!matchSelector(elem, tabIndexIgnoreList)) {
          if (!elem.getAttribute('tabindex')) {
            elem.setAttribute('tabindex', '-1')
          }
        }
      })
    }

    if (sectionId) {
      if (_sections[sectionId]) {
        doMakeFocusable(_sections[sectionId])
      } else {
        throw new Error('Section "' + sectionId + '" doesn\'t exist!')
      }
    } else {
      for (const id in _sections) {
        doMakeFocusable(_sections[id])
      }
    }
  },

  setDefaultSection(sectionId) {
    const { _sections } = get(state)

    if (!sectionId) {
      state.update(($state) => {
        $state._defaultSectionId = ''
        return $state
      })
    } else if (!_sections[sectionId]) {
      throw new Error('Section "' + sectionId + '" doesn\'t exist!')
    } else {
      state.update(($state) => {
        $state._defaultSectionId = sectionId
        return $state
      })
    }
  },
}

window.SpatialNavigation = SpatialNavigation

export default SpatialNavigation
