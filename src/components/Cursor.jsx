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
        dotRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px) scale(${scale})`
      }
      // smooth lag for ring
      ring.current.x += (pos.current.x - ring.current.x) * 0.12
      ring.current.y += (pos.current.y - ring.current.y) * 0.12
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - 20}px, ${ring.current.y - 20}px)`
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    const onOver = (e) => {
      if (e.target.closest('a, button, [data-cursor]')) setHovered(true)
    }
    const onOut = (e) => {
      if (e.target.closest('a, button, [data-cursor]')) setHovered(false)
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
          width: 8px; height: 8px;
          background: #16C172;
          border-radius: 50%;
          pointer-events: none;
          z-index: 99999;
          will-change: transform;
          transition: width 0.2s, height 0.2s, background 0.2s;
          box-shadow: 0 0 10px #16C172, 0 0 20px rgba(22,193,114,0.4);
        }
        .cursor-ring {
          position: fixed;
          top: 0; left: 0;
          width: 40px; height: 40px;
          border: 1.5px solid rgba(22,193,114,0.5);
          border-radius: 50%;
          pointer-events: none;
          z-index: 99998;
          will-change: transform;
          transition: width 0.3s, height 0.3s, border-color 0.3s, background 0.3s;
        }
        .cursor-dot.hovered {
          width: 6px; height: 6px;
          background: #fff;
        }
        .cursor-ring.hovered {
          width: 56px; height: 56px;
          border-color: rgba(22,193,114,0.8);
          background: rgba(22,193,114,0.06);
        }
        .cursor-dot.clicked {
          background: #fff;
        }
      `}</style>
      <div ref={dotRef} className={`cursor-dot ${hovered ? 'hovered' : ''} ${clicked ? 'clicked' : ''}`} />
      <div ref={ringRef} className={`cursor-ring ${hovered ? 'hovered' : ''}`} />
    </>
  )
}