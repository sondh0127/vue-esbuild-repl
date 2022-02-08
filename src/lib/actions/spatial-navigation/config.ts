/************************/
/* Global Configuration */
/************************/
// Note: an <extSelector> can be one of following types:
// - a valid selector string for "querySelectorAll"
// - a NodeList or an array containing DOM elements
// - a single DOM element
// - a jQuery object
// - a string "@<sectionId>" to indicate the specified section
// - a string "@" to indicate the default section

export const GlobalConfig = {
  selector: '', // can be a valid <extSelector> except "@" syntax.
  straightOnly: false,
  straightOverlapThreshold: 0.5,
  rememberSource: false,
  disabled: false,
  defaultElement: '', // <extSelector> except "@" syntax.
  enterTo: '', // '', 'last-focused', 'default-element'
  leaveFor: null, // {left: <extSelector>, right: <extSelector>,
  //  up: <extSelector>, down: <extSelector>}
  restrict: 'self-first', // 'self-first', 'self-only', 'none'
  tabIndexIgnoreList: 'a, input, select, textarea, button, iframe, [contentEditable=true]',
  navigableFilter: null,
}

/*********************/
/* Constant Variable */
/*********************/
export const KEYMAPPING = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
}

export const REVERSE = {
  left: 'right',
  up: 'down',
  right: 'left',
  down: 'up',
}

export const EVENT_PREFIX = 'sn-'
export const ID_POOL_PREFIX = 'section-'
