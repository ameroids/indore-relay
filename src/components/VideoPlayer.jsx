import { useEffect, useRef, useState } from 'react'
import './VideoPlayer.css'
import { PROTECTED_VIDEO, PLAYER_VARS } from '../config/videoConfig'
import { loadYouTubeIframeApi } from '../services/youtubeApi'
import { settingsService } from '../services/settingsService'
import { formatDuration } from '../utils/format'

// YT.PlayerState values: -1 unstarted, 0 ended, 1 playing, 2 paused,
// 3 buffering, 5 cued.

export default function VideoPlayer() {
  const mountRef = useRef(null)
  const wrapperRef = useRef(null)
  const playerRef = useRef(null)
  const progressBarRef = useRef(null)
  const pollRef = useRef(null)
  const draggingRef = useRef(false)

  const [status, setStatus] = useState('loading') // loading | ready | error
  const [hasStarted, setHasStarted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [videoId, setVideoId] = useState(null)

  // Set up the player once via the IFrame API. The resulting iframe
  // is kept permanently non-interactive via CSS (see .video-player__mount
  // pointer-events: none) — every user interaction below goes through
  // the API instead of the real YouTube surface.
  useEffect(() => {
    let cancelled = false

    async function initPlayer() {
      try {
        const id = await settingsService.getVideoId()
        if (cancelled) return
        setVideoId(id)

        const YT = await loadYouTubeIframeApi()
        if (cancelled || !mountRef.current) return

        playerRef.current = new YT.Player(mountRef.current, {
          videoId: id,
          host: 'https://www.youtube-nocookie.com',
          playerVars: PLAYER_VARS,
          events: {
            onReady: () => {
              if (cancelled) return
              setStatus('ready')
              setDuration(playerRef.current.getDuration() || 0)
              // pointer-events: none only blocks the mouse — this stops
              // keyboard Tab from focusing into the YouTube iframe too,
              // so Enter/Space can't activate anything inside it either.
              const iframe = playerRef.current.getIframe?.()
              if (iframe) iframe.setAttribute('tabindex', '-1')
            },
            onError: () => setStatus('error'),
            onStateChange: (e) => {
              if (e.data === 1) {
                setIsPlaying(true)
                setHasStarted(true)
              } else if (e.data === 2 || e.data === 0) {
                setIsPlaying(false)
              }
            }
          }
        })
      } catch (err) {
        if (!cancelled) setStatus('error')
      }
    }
    
    initPlayer()

    return () => {
      cancelled = true
      clearInterval(pollRef.current)
      playerRef.current?.destroy?.()
    }
  }, [])

  // Poll playback position while playing.
  useEffect(() => {
    clearInterval(pollRef.current)
    if (isPlaying) {
      pollRef.current = setInterval(() => {
        const player = playerRef.current
        if (!player?.getCurrentTime) return
        if (!draggingRef.current) setCurrentTime(player.getCurrentTime() || 0)
        setDuration(player.getDuration() || 0)
      }, 250)
    }
    return () => clearInterval(pollRef.current)
  }, [isPlaying])

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const togglePlay = () => {
    const player = playerRef.current
    if (!player) return
    if (isPlaying) player.pauseVideo()
    else player.playVideo()
  }

  const toggleMute = () => {
    const player = playerRef.current
    if (!player) return
    if (isMuted) {
      player.unMute()
      setIsMuted(false)
    } else {
      player.mute()
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      wrapperRef.current?.requestFullscreen?.()
    }
  }

  const seekFromClientX = (clientX) => {
    const bar = progressBarRef.current
    const player = playerRef.current
    if (!bar || !player || !duration) return
    const rect = bar.getBoundingClientRect()
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const target = fraction * duration
    setCurrentTime(target)
    player.seekTo(target, true)
  }

  const handleBarPointerDown = (event) => {
    draggingRef.current = true
    seekFromClientX(event.clientX)
    const handleMove = (e) => seekFromClientX(e.clientX)
    const handleUp = () => {
      draggingRef.current = false
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  const progressPct = duration ? Math.min(100, (currentTime / duration) * 100) : 0

  return (
    <div className="video-player">
      <div
        className="video-player__frame"
        ref={wrapperRef}
        onContextMenu={(e) => e.preventDefault()}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => hasStarted && isPlaying && setShowControls(false)}
      >
        {status === 'loading' && (
          <div className="video-player__status">
            <span className="video-player__spinner" aria-hidden="true" />
            <span>Loading session…</span>
          </div>
        )}
        {status === 'error' && (
          <div className="video-player__status">
            <p>The video couldn't load.</p>
            <span>Check your connection and refresh the page.</span>
          </div>
        )}

        {/* The real YouTube iframe. It is never clickable — pointer-events
            is disabled in CSS — so nothing inside it (title link, end
            screen, "Watch on YouTube", info cards) can ever be reached.
            Note: the YouTube API replaces the inner div with its own
            iframe, so styling targets the wrapper's child, not a class
            on the div itself. */}
        <div className="video-player__mount-wrap">
          <div ref={mountRef} />
        </div>

        {!hasStarted && status === 'ready' && (
          <button
            type="button"
            className="video-player__poster"
            onClick={togglePlay}
            aria-label={`Play ${PROTECTED_VIDEO.title}`}
            style={{
              backgroundImage: videoId ? `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)` : 'none'
            }}
          >
            <span className="video-player__big-play">
              <PlayIcon />
            </span>
          </button>
        )}

        {hasStarted && status === 'ready' && (
          <div className={`video-player__controls ${showControls ? 'is-visible' : ''}`}>
            <div
              className="video-player__progress"
              ref={progressBarRef}
              onPointerDown={handleBarPointerDown}
            >
              <span className="video-player__progress-fill" style={{ width: `${progressPct}%` }} />
              <span className="video-player__progress-thumb" style={{ left: `${progressPct}%` }} />
            </div>
            <div className="video-player__bar">
              <button type="button" className="video-player__btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? <PauseIcon /> : <PlayIcon small />}
              </button>
              <button type="button" className="video-player__btn" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                {isMuted ? <MutedIcon /> : <VolumeIcon />}
              </button>
              <span className="video-player__time">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </span>
              <span className="video-player__spacer" />
              <button type="button" className="video-player__btn" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                {isFullscreen ? <CollapseIcon /> : <ExpandIcon />}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="video-player__meta">
        <h3>{PROTECTED_VIDEO.title}</h3>
        <p>{PROTECTED_VIDEO.description}</p>
      </div>
    </div>
  )
}

function PlayIcon({ small }) {
  const size = small ? 14 : 26
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M7 4.5v15l13-7.5z" fill="currentColor" />
    </svg>
  )
}
function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <rect x="6" y="4.5" width="4" height="15" fill="currentColor" />
      <rect x="14" y="4.5" width="4" height="15" fill="currentColor" />
    </svg>
  )
}
function VolumeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path
        d="M4 9.5v5h3.6L13 19V5L7.6 9.5H4Zm12-1.2a5 5 0 0 1 0 7.4M18.3 5.8a9 9 0 0 1 0 12.4"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}
function MutedIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path d="M4 9.5v5h3.6L13 19V5L7.6 9.5H4Z" fill="currentColor" />
      <path d="M16.5 9.5l4 4m0-4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path
        d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
        stroke="currentColor"
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
function CollapseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path
        d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"
        stroke="currentColor"
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
