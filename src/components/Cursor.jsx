import { useEffect, useRef, useState } from 'react'

export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const pos = useRef({ x: -100, y: -100 })
  const ring = useRef({ x: -100, y: -100 })
  const rafRef = useRef(null)
  const clickedRef = useRef(false)

  const [cursorEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    const coarse = window.matchMedia?.('(pointer: coarse)')?.matches
    const touch = 'ontouchstart' in window
    return !(coarse || touch)
  })

  useEffect(() => {
    if (!cursorEnabled) return

    document.body.classList.add('custom-cursor-enabled')

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }

    const onDown = () => {
      clickedRef.current = true
      setClicked(true)
    }
    const onUp = () => {
      clickedRef.current = false
      setClicked(false)
    }

    const animate = () => {
      if (dotRef.current) {
        const scale = clickedRef.current ? 0.7 : 1
        dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%) scale(${scale})`
      }
      // smooth lag for ring
      ring.current.x += (pos.current.x - ring.current.x) * 0.12
      ring.current.y += (pos.current.y - ring.current.y) * 0.12
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%)`
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    const onOver = (e) => {
      if (e.target.closest('a, button, input, textarea, select, [data-cursor]')) setHovered(true)
    }
    const onOut = (e) => {
      if (e.target.closest('a, button, input, textarea, select, [data-cursor]')) setHovered(false)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      document.body.classList.remove('custom-cursor-enabled')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      cancelAnimationFrame(rafRef.current)
    }
  }, [cursorEnabled])

  if (!cursorEnabled) return null

  return (
    <>
      <style>{`
        .cursor-dot {
          position: fixed;
          top: 0; left: 0;
          width: 7px; height: 7px;
          background: var(--main-strong);
          border: 1px solid rgba(255, 255, 255, 0.55);
          border-radius: 50%;
          pointer-events: none;
          z-index: 99999;
          will-change: transform;
          transition: width 0.22s ease, height 0.22s ease, background 0.22s ease, border-color 0.22s ease;
          box-shadow: 0 0 0 4px rgba(37, 87, 42, 0.08);
        }
        .cursor-ring {
          position: fixed;
          top: 0; left: 0;
          width: 34px; height: 34px;
          border: 1px solid rgba(37, 87, 42, 0.38);
          border-radius: 50%;
          pointer-events: none;
          z-index: 99998;
          will-change: transform;
          transition: width 0.24s ease, height 0.24s ease, border-color 0.24s ease, background 0.24s ease;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(2px);
        }
        .cursor-dot.hovered {
          width: 9px; height: 9px;
          background: var(--accent);
          border-color: rgba(255, 255, 255, 0.7);
        }
        .cursor-ring.hovered {
          width: 48px; height: 48px;
          border-color: rgba(206, 108, 47, 0.62);
          background: rgba(206, 108, 47, 0.08);
        }
        .cursor-dot.clicked {
          background: #ffffff;
          border-color: rgba(37, 87, 42, 0.25);
        }
      `}</style>
      <div ref={dotRef} className={`cursor-dot ${hovered ? 'hovered' : ''} ${clicked ? 'clicked' : ''}`} />
      <div ref={ringRef} className={`cursor-ring ${hovered ? 'hovered' : ''}`} />
    </>
  )
}