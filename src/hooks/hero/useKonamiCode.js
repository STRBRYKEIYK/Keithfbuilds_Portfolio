import { useEffect, useRef } from 'react'

/**
 * Konami code detector — fires `onComplete` once per full sequence.
 *
 * @param {object} options
 * @param {string[]} options.sequence Key sequence
 * @param {() => void} options.onComplete
 * @param {(buffer: string[]) => void} [options.debug]
 */
export default function useKonamiCode({ sequence, onComplete, debug } = {}) {
  const buf = useRef([])

  useEffect(() => {
    const onKey = (e) => {
      let key = e.key
      if (key.length === 1) key = key.toLowerCase()

      const idx = buf.current.length
      if (key === sequence[idx]) {
        buf.current = [...buf.current, key]
      } else if (key === sequence[0]) {
        buf.current = [key]
      } else {
        buf.current = []
      }

      debug?.(buf.current.slice())

      if (buf.current.length === sequence.length && buf.current.join(',') === sequence.join(',')) {
        buf.current = []
        onComplete?.()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sequence, onComplete, debug])
}

