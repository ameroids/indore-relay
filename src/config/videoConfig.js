/**
 * Protected video configuration.
 *
 * The YouTube video ID lives only here. Components never receive a raw
 * URL — only this ID.
 *
 * The player is built with the YouTube IFrame *API* (not a plain
 * embed src), and the real YouTube iframe is kept permanently
 * non-interactive (pointer-events: none). Every control the user
 * touches is our own custom UI, which drives playback through the
 * API. Because the native YouTube surface is never clickable, there
 * is no "Watch on YouTube" button, end-screen suggestion, title
 * link, or info card the user can ever click — those all live inside
 * YouTube's cross-origin iframe, which we can suppress from
 * receiving clicks at all, even though we can't reach inside it with
 * JavaScript.
 *
 * NOTE ON LIMITATIONS: this stops the video from being *navigable*
 * from inside the app. It does not, and cannot, make the video ID
 * secret — a technically knowledgeable user can still find it in the
 * page's JavaScript or network requests. See README.md → "Security &
 * limitations".
 */
export const PROTECTED_VIDEO = {
  id: 'dQw4w9WgXcQ',
  title: 'Indore Relay — Featured Session',
  description: 'This session is available exclusively to authorized ITS holders.'
}

// Passed straight to the YouTube IFrame API as playerVars.
// controls: 0 removes YouTube's own control bar (and its "Watch on
// YouTube" / logo hotspots) entirely — we draw our own controls on
// top instead.
export const PLAYER_VARS = {
  autoplay: 0,
  controls: 0,
  disablekb: 1,
  fs: 0,
  iv_load_policy: 3,
  modestbranding: 1,
  playsinline: 1,
  rel: 0
}

