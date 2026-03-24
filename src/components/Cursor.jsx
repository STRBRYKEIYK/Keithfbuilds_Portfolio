import { useEffect, useRef, useState } from 'react'

export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  const pos = useRef({ x: -100, y: -100 })
  const ring = useRef({ x: -100, y: -100 })
  const rafRef = useRef(null)

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }

    const onDown = () => setClicked(true)
    const onUp = () => setClicked(false)

    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`
      }
      // smooth lag for ring
      ring.current.x += (pos.current.x - ring.current.x) * 0.12
      ring.current.y += (pos.current.y - ring.current.y) * 0.12
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x - 20}px, ${ring.current.y - 20}px)`
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    // Detect hover on interactive elements
    const addHover = () => setHovered(true)
    const removeHover = () => setHovered(false)

    const interactives = document.querySelectorAll('a, button, [data-cursor]')
    interactives.forEach(el => {
      el.addEventListener('mouseenter', addHover)
      el.addEventListener('mouseleave', removeHover)
    })

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

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
          transform: scale(0.7) !important;
          background: #fff;
        }
      `}</style>
      <div ref={dotRef} className={`cursor-dot ${hovered ? 'hovered' : ''} ${clicked ? 'clicked' : ''}`} />
      <div ref={ringRef} className={`cursor-ring ${hovered ? 'hovered' : ''}`} />
    </>
  )
}