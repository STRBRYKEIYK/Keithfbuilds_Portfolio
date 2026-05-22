import { useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'kf:ambient-audio'
const AUDIO_SRC = '/audio/ambient.mp3'

export default function AmbientAudioToggle() {
  const audioRef = useRef(null)
  const [available, setAvailable] = useState(null)
  const [playing, setPlaying] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY) === 'on'
  })

  // Probe whether the audio file actually exists before exposing the toggle.
  useEffect(() => {
    let cancelled = false
    fetch(AUDIO_SRC, { method: 'HEAD' })
      .then((r) => {
        if (cancelled) return
        setAvailable(r.ok)
      })
      .catch(() => {
        if (cancelled) return
        setAvailable(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Sync the audio element to the toggle state once the file is available.
  useEffect(() => {
    if (!available) return
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.volume = 0.32
      el.loop = true
      el.play().catch(() => {
        // Autoplay rejected — flip back to off.
        setPlaying(false)
      })
    } else {
      el.pause()
    }
  }, [available, playing])

  // Persist preference.
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, playing ? 'on' : 'off')
  }, [playing])

  const disabled = available === false
  const label = disabled
    ? 'Ambient audio unavailable'
    : playing
      ? 'Ambient audio: on'
      : 'Ambient audio: off'

  return (
    <>
      <button
        type="button"
        className="ambient-toggle focus-ring"
        aria-pressed={playing}
        aria-label={label}
        title={
          disabled
            ? 'Drop ambient.mp3 in /public/audio/ to enable.'
            : 'Toggle ambient audio'
        }
        disabled={disabled}
        onClick={() => setPlaying((v) => !v)}
      >
        <span className="ambient-toggle-bars" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
        <span>{playing ? 'Ambient' : 'Ambient'}</span>
      </button>
      {available && <audio ref={audioRef} src={AUDIO_SRC} preload="none" />}
    </>
  )
}
