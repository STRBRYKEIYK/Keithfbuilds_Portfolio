import { useEffect, useRef, useState } from 'react'

/**
 * Ref-based typing loop.
 * Phases: typing → hold → deleting → gap → (next word)
 *
 * @param {string[]} items
 * @returns {{ display: string, caretOn: boolean }}
 */
export default function useTypingLoop(items) {
  const [display, setDisplay] = useState('')
  const [caretOn, setCaretOn] = useState(true)

  // All mutable state lives in one ref to avoid stale closures.
  const machine = useRef({ idx: 0, pos: 0, phase: 'typing' })

  // Blink caret independently.
  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reducedMotion) {
      setCaretOn(false)
      return
    }
    const id = window.setInterval(() => setCaretOn((v) => !v), 530)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reducedMotion) {
      setDisplay(items[0] ?? '')
      setCaretOn(false)
      return
    }
    let tid = 0

    function tick() {
      const s = machine.current
      const word = items[s.idx]

      if (s.phase === 'typing') {
        s.pos = Math.min(s.pos + 1, word.length)
        setDisplay(word.slice(0, s.pos))

        tid =
          s.pos >= word.length
            ? window.setTimeout(() => {
                s.phase = 'hold'
                tick()
              }, 1800)
            : window.setTimeout(tick, 68)
      } else if (s.phase === 'hold') {
        s.phase = 'deleting'
        tid = window.setTimeout(tick, 60)
      } else if (s.phase === 'deleting') {
        s.pos = Math.max(s.pos - 1, 0)
        setDisplay(word.slice(0, s.pos))

        tid =
          s.pos <= 0
            ? window.setTimeout(() => {
                s.phase = 'gap'
                tick()
              }, 380)
            : window.setTimeout(tick, 36)
      } else {
        // gap
        s.idx = (s.idx + 1) % items.length
        s.pos = 0
        s.phase = 'typing'
        tid = window.setTimeout(tick, 80)
      }
    }

    tid = window.setTimeout(tick, 900)
    return () => window.clearTimeout(tid)
  }, [items])

  return { display, caretOn }
}

