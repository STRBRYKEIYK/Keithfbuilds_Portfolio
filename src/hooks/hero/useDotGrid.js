import { useEffect } from 'react'

/**
 * Canvas dot grid with mouse-proximity glow.
 *
 * @param {import('react').RefObject<HTMLCanvasElement | null>} canvasRef
 */
export default function useDotGrid(canvasRef) {
  useEffect(() => {
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId = 0
    let mouse = { x: -9999, y: -9999 }
    let dots = []

    const STEP = 42
    const GLOW_RANGE = 140

    function build() {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      dots = []
      const cols = Math.ceil(canvas.width / STEP) + 1
      const rows = Math.ceil(canvas.height / STEP) + 1

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({ x: c * STEP, y: r * STEP })
        }
      }
    }

    build()

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top }
    }

    // Track from parent section so it works even when the canvas is pointer-events:none
    const parent = canvas.parentElement
    parent?.addEventListener('mousemove', onMove)

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const d of dots) {
        const dx = mouse.x - d.x
        const dy = mouse.y - d.y
        const t = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / GLOW_RANGE)

        ctx.beginPath()
        ctx.arc(d.x, d.y, 1 + t * 2.4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(22,193,114,${0.05 + t * 0.28})`
        ctx.fill()
      }

      rafId = window.requestAnimationFrame(draw)
    }

    draw()

    const onResize = () => build()
    window.addEventListener('resize', onResize)

    return () => {
      window.cancelAnimationFrame(rafId)
      parent?.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
    }
  }, [canvasRef])
}

