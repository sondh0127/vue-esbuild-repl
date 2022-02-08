import SpatialNavigation from 'actions/lib-spatial-navigation.ts'

const config = {
  straightOnly: false,
  straightOverlapThreshold: 0.5,
  rememberSource: true,
  disabled: false,
  defaultElement: '',
  enterTo: 'last-focused',
  leaveFor: null,
  restrict: 'self-first',
  tabIndexIgnoreList: 'a, input, select, textarea, button, iframe, [contentEditable=true]',
  navigableFilter: null,
  scrollOptions: { behavior: 'smooth', block: 'center' },
}

export type Config = typeof config

export const globalConfig = {
  selector: `[data-focusable=true]`,
}
Object.assign(globalConfig, config)

export const createNavigation = () => {
  SpatialNavigation.init()
  SpatialNavigation.set(globalConfig)

  if (!window.SigmaInteractive.getStore().isPreview) {
    console.log('[LOG] ~ file: spatial-navigation.ts ~ line 29 ~ window.SigmaInteractive.getStore().isPreview', window.SigmaInteractive.getStore())
    window.addEventListener('mousedown', (e) => {
      if (!e.target.dataset.focusable) {
        e.preventDefault()
        SpatialNavigation.focus()
      }
    })
  }


}

export const assignConfig = (sectionId, config) => {
  const sectionConfig = Object.assign({}, globalConfig)
  if (config) {
    Object.assign(sectionConfig, config)
  }
  sectionConfig.selector = `[data-section-id="${sectionId}"] [data-focusable=true]`
  return sectionConfig
}

export const focusSection = (
  node,
  options: { config?: Config; id?: string; default?: boolean } = {},
) => {
  let sectionId = null
  if (options.id) {
    // It is good if we have random section if id is not define in the options
    sectionId = options.id
    try {
      SpatialNavigation.add(sectionId, {})
    } catch (error) {}
  } else {
    sectionId = SpatialNavigation.add({})
  }

  // set sectionid to data set for removing when unbinding
  node.dataset.sectionId = sectionId
  const sectionConfig = assignConfig(sectionId, options.config || {})
  SpatialNavigation.set(sectionId, sectionConfig)
  // set default section
  if (options.default) {
    SpatialNavigation.setDefaultSection(sectionId)
    // SpatialNavigation.focus()
  }
  // Focus the first navigable element.
  return {
    destroy() {
      SpatialNavigation.remove(node.dataset.sectionId)
    },
  }
}

export const focusable = (node, options?: any) => {
  const focusElement = (el, focusable) => {
    focusable = focusable !== false
    if (!el.dataset.focusable || el.dataset.focusable !== focusable + '') {
      el.dataset.focusable = focusable
      if (focusable) el.tabIndex = -1
    }
  }

  focusElement(node, options)

  node.addEventListener('sn-willfocus', () => {
    SpatialNavigation.pause()

    setTimeout(() => {
      SpatialNavigation.focus(node)
      SpatialNavigation.resume()
    }, 0)

    return false
  })
  return {
    destroy() {
      node.removeAttribute('data-focusable')
    },
  }
}

export { SpatialNavigation }
