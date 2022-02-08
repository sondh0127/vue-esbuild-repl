
function randomId(): string {
  const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
  return uint32.toString(16);
}

function getRectFormat(_rect) {
  const w = document.body.clientWidth
  const h = document.body.clientHeight
  return [
    ((_rect.left / w) * 100).toFixed(2),
    ((_rect.top / h) * 100).toFixed(2),
    ((_rect.right / w) * 100).toFixed(2),
    ((_rect.bottom / h) * 100).toFixed(2),
  ]
}

export const boundingRect = (node: HTMLElement, { onResize, onDestroy, enabled = true }) => {
  node.dataset.rectId = randomId()
  const handleResize = (_enabled = true) => {
    if (_enabled) {
      setTimeout(() => {
        const rect = node.getBoundingClientRect()
        onResize(getRectFormat(rect), node.dataset.rectId)
      }, 0)
    } else {
      onDestroy(node.dataset.rectId)
    }
  }

  function handler() {
    handleResize(enabled)
  }

  node.addEventListener('resize', handler)

  handleResize(enabled)
  return {
    update: ({ enabled }) => {
      handleResize(enabled)
    },
    destroy: () => {
      node.removeEventListener('resize', handler)
      onDestroy(node.dataset.rectId)
    },
  }
}
export default boundingRect
