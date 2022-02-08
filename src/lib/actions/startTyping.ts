const isFocusedElementEditable = () => {
  const { activeElement, body } = document

  if (!activeElement) return false

  // If not element has focus, we assume it is not editable, too.
  if (activeElement === body) return false

  // Assume <input> and <textarea> elements are editable.
  switch (activeElement.tagName) {
    case 'INPUT':
    case 'TEXTAREA':
      return true
  }

  // Check if any other focused element id editable.
  return activeElement.hasAttribute('contenteditable')
}

const _isTypedCharValid = ({ keyCode, metaKey, ctrlKey, altKey }: KeyboardEvent) => {
  if (metaKey || ctrlKey || altKey) return false

  // 0...9
  if ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105)) return true

  // a...z
  if (keyCode >= 65 && keyCode <= 90) return true

  // All other keys.
  return false
}

export const startTyping = (
  node,
  options?: {
    isTypedCharValid: (event: KeyboardEvent) => boolean
  },
) => {
  const isTypedCharValid = options?.isTypedCharValid || _isTypedCharValid

  const keydown = (event: KeyboardEvent) => {
    if (!isFocusedElementEditable() && isTypedCharValid(event)) {
      node.dispatchEvent(
        new CustomEvent('typing', {
          detail: { keyCode: event.keyCode },
        }),
      )
    }
  }

  document.addEventListener('keydown', keydown, { passive: true })

  return {
    destroy() {
      document.removeEventListener('keydown', keydown)
    },
  }
}
