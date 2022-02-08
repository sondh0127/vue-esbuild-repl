/************/
/* Polyfill */
/************/
export const elementMatchesSelector =
  Element.prototype.matches ||
  // @ts-ignore
  Element.prototype.matchesSelector ||
  // @ts-ignore
  Element.prototype.mozMatchesSelector ||
  // @ts-ignore
  Element.prototype.webkitMatchesSelector ||
  // @ts-ignore
  Element.prototype.msMatchesSelector ||
  // @ts-ignore
  Element.prototype.oMatchesSelector ||
  function (selector) {
    const matchedNodes = (this.parentNode || this.document).querySelectorAll(selector)
    return [].slice.call(matchedNodes).includes(this)
  }
