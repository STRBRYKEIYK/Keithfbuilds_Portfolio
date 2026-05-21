import { useEffect, useRef, useState } from 'react'

const getPhtTime = () => {
  try {
    return new Intl.DateTimeFormat('en-PH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Manila',
    }).format(new Date())
  } catch {
    const d = new Date()
    return `${String(d.getUTCHours() + 8).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
  }
}

/**
 * Live local-time chip — pulses every minute, shows Antipolo (PHT) time.
 * Aligned to top-of-minute, then ticks every 60s (no per-second update — saves CPU).
 */
export default function LiveTimeChip({ city = 'Antipolo', tz = 'PHT' }) {
  const [time, setTime] = useState(() => getPhtTime())
  const intervalRef = useRef(null)

  useEffect(() => {
    const tick = () => setTime(getPhtTime())
    const now = new Date()
    const msToNextMinute = (60 - now.getSeconds()) * 1000

    const initialId = window.setTimeout(() => {
      tick()
      intervalRef.current = window.setInterval(tick, 60_000)
    }, msToNextMinute)

    return () => {
      window.clearTimeout(initialId)
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  return (
    <span
      className="live-chip"
      aria-label={`Live local time in ${city}, ${tz}: ${time}`}
    >
      {city} · {tz} {time}
    </span>
  )
}
