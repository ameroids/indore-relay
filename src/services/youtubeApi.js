let apiPromise = null

/**
 * Loads https://www.youtube.com/iframe_api and resolves with the
 * global YT object once it's ready. Safe to call multiple times —
 * the script tag and the wait are only ever set up once.
 */
export function loadYouTubeIframeApi() {
  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT)
  }
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === 'function') previous()
      resolve(window.YT)
    }

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    document.head.appendChild(script)
  })

  return apiPromise
}
