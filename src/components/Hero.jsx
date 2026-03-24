// Helper to get the correct suffix (ST, ND, RD, TH)
function getOrdinalAge(n) {
  const j = n % 10, k = n % 100;
  if (j === 1 && k !== 11) return n + "ST";
  if (j === 2 && k !== 12) return n + "ND";
  if (j === 3 && k !== 13) return n + "RD";
  return n + "TH";
}
import { useEffect, useRef, useState } from 'react'

const ROLES = [
  'Full-Stack Developer',
  'React Specialist',
  'Enterprise Systems Builder',
  'Remote-Ready Engineer',
]

// CLI-style role animation: scramble, type, display, delete, repeat
function useRoleCLIAnimation(roles) {
  const [roleIndex, setRoleIndex] = useState(0)
  const [phase, setPhase] = useState('typeScrambled') // 'typeScrambled' | 'unscramble' | 'delete'
  const [display, setDisplay] = useState('')
  const [caretVisible, setCaretVisible] = useState(true)
  const [scrambledTarget, setScrambledTarget] = useState('')

  // Scramble: shuffle the role's letters
  function shuffle(str) {
    const arr = str.split('')
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr.join('')
  }

  // Blinking caret
  useEffect(() => {
    const blink = setInterval(() => setCaretVisible(v => !v), 500)
    return () => clearInterval(blink)
  }, [])

  // Set scrambledTarget only when entering 'typeScrambled' phase or roleIndex changes
  useEffect(() => {
    if (phase === 'typeScrambled') {
      setScrambledTarget(shuffle(roles[roleIndex]))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roleIndex])

  // Animation phases
  useEffect(() => {
    let timeout
    const role = roles[roleIndex]
    if (phase === 'typeScrambled') {
      // Type out the scrambled string, one char at a time
      if (display.length < role.length && scrambledTarget) {
        timeout = setTimeout(() => {
          setDisplay(scrambledTarget.slice(0, display.length + 1))
        }, 60)
      } else if (display.length === role.length) {
        timeout = setTimeout(() => setPhase('unscramble'), 400)
      }
    } else if (phase === 'unscramble') {
      // Animate scramble to correct order
      if (display !== role) {
        timeout = setTimeout(() => {
          setDisplay(prev => {
            let arr = prev.split('')
            for (let i = 0; i < arr.length; i++) {
              if (arr[i] !== role[i]) {
                // 50% chance to snap to correct, else random
                arr[i] = Math.random() < 0.5 ? role[i] : CHARS[Math.floor(Math.random() * CHARS.length)]
              }
            }
            return arr.join('')
          })
        }, 40)
      } else {
        timeout = setTimeout(() => setPhase('delete'), 1000)
      }
    } else if (phase === 'delete') {
      if (display.length > 0) {
        timeout = setTimeout(() => setDisplay(d => d.slice(0, -1)), 35)
      } else {
        timeout = setTimeout(() => {
          setRoleIndex(i => (i + 1) % roles.length)
          setPhase('typeScrambled')
        }, 300)
      }
    }
    return () => clearTimeout(timeout)
  }, [phase, display, roleIndex, roles, scrambledTarget])

  // When roleIndex or phase resets, clear display
  useEffect(() => {
    if (phase === 'typeScrambled') setDisplay('')
  }, [roleIndex, phase])

  return {
    text: display,
    caret: caretVisible,
    phase,
  }
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%'

function useScramble(finalText, trigger) {
  const [display, setDisplay] = useState(finalText)
  const iteration = useRef(0)
  const interval = useRef(null)

  useEffect(() => {
    if (!trigger) return
    iteration.current = 0
    clearInterval(interval.current)

    interval.current = setInterval(() => {
      setDisplay(
        finalText
          .split('')
          .map((char, i) => {
            if (i < iteration.current) return finalText[i]
            if (char === ' ') return ' '
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
          .join('')
      )
      iteration.current += 0.5
      if (iteration.current >= finalText.length) {
        clearInterval(interval.current)
        setDisplay(finalText)
      }
    }, 30)

    return () => clearInterval(interval.current)
  }, [finalText, trigger])

  return display
}

export default function Hero() {

  const [mounted, setMounted] = useState(false)
  const [scrambleNameTrigger, setScrambleNameTrigger] = useState(false)
  const canvasRef = useRef(null)

  // --- EASTER EGG LOGIC ---
  const today = new Date()
  // getMonth() is 0-indexed, so 3 is April
  const isBirthday = today.getMonth() === 3 && today.getDate() === 24
  //const isBirthday = true // Force birthday mode for testing
  const age = today.getFullYear() - 2002
  const targetText = isBirthday
    ? `HAPPY ${getOrdinalAge(age)} BIRTHDAY KEITH`
    : 'KEITH WILHELM FELIPE'
  // Dynamically change which word gets the neon green highlight
  const highlightWord = isBirthday ? 'KEITH' : 'FELIPE'

  // Scramble name when trigger is true
  const scrambledName = useScramble(targetText, scrambleNameTrigger)
  // CLI-style role animation
  const roleCLI = useRoleCLIAnimation(ROLES)

  useEffect(() => {
    setMounted(true)
    setTimeout(() => setScrambleNameTrigger(true), 400) // Animate name after load
  }, [])

  // Scramble name again when user scrolls to top (Back to Top)
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY === 0) {
        setScrambleNameTrigger(false)
        setTimeout(() => setScrambleNameTrigger(true), 10)
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Animated dot grid canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    const dots = []
    const spacing = 40
    const cols = Math.ceil(canvas.width / spacing) + 1
    const rows = Math.ceil(canvas.height / spacing) + 1
    let mouse = { x: -9999, y: -9999 }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dots.push({ x: c * spacing, y: r * spacing, ox: c * spacing, oy: r * spacing })
      }
    }

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    })

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      dots.forEach(dot => {
        const dx = mouse.x - dot.x
        const dy = mouse.y - dot.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const radius = 120
        const opacity = dist < radius
          ? 0.06 + (1 - dist / radius) * 0.25
          : 0.06
        const size = dist < radius ? 1 + (1 - dist / radius) * 2 : 1

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(22, 193, 114, ${opacity})`
        ctx.fill()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <>
      <style>{`
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          padding-top: 80px;
        }
        .hero-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }
        .hero-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(22,193,114,0.06) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 0;
        }
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
          width: 100%;
        }
        .hero-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #16C172;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 12px;
          opacity: 0;
          animation: fadeUp 0.8s 0.2s forwards;
        }
        .hero-tag::before {
          content: '';
          display: block;
          width: 32px;
          height: 1px;
          background: #16C172;
          box-shadow: 0 0 8px #16C172;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          background: #16C172;
          border-radius: 50%;
          display: inline-block;
          animation: pulse-green 2s infinite;
        }
        .hero-name {
          font-family: 'Syne', sans-serif;
          font-size: clamp(52px, 8vw, 112px);
          font-weight: 800;
          line-height: 0.95;
          letter-spacing: -0.03em;
          color: #E8F5F0;
          margin-bottom: 24px;
          opacity: 0;
          animation: fadeUp 0.8s 0.4s forwards;
        }
        .hero-name .highlight {
          color: #16C172;
          text-shadow: 0 0 40px rgba(22,193,114,0.3);
        }
        .hero-role-wrap {
          height: 56px;
          overflow: hidden;
          margin-bottom: 32px;
          opacity: 0;
          animation: fadeUp 0.8s 0.6s forwards;
        }
        .hero-role {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(18px, 2.5vw, 28px);
          font-weight: 300;
          color: #7A9E8C;
          transition: transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease;
          transform: translateY(0);
        }
        .hero-role.hidden {
          transform: translateY(-100%);
          opacity: 0;
        }
        .hero-role span {
          color: #16C172;
        }
        .hero-desc {
          max-width: 520px;
          font-size: 16px;
          color: #7A9E8C;
          font-weight: 300;
          line-height: 1.8;
          margin-bottom: 48px;
          opacity: 0;
          animation: fadeUp 0.8s 0.8s forwards;
        }
        .hero-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          opacity: 0;
          animation: fadeUp 0.8s 1.0s forwards;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #16C172;
          color: #050A07;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 16px 32px;
          border-radius: 4px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.1);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }
        .btn-primary:hover::before { transform: translateX(0); }
        .btn-primary:hover {
          box-shadow: 0 0 40px rgba(22,193,114,0.4), 0 8px 32px rgba(22,193,114,0.2);
          transform: translateY(-2px);
        }
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(22,193,114,0.3);
          color: #E8F5F0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 16px 32px;
          border-radius: 4px;
          transition: border-color 0.3s, background 0.3s, transform 0.3s;
        }
        .btn-secondary:hover {
          border-color: rgba(22,193,114,0.7);
          background: rgba(22,193,114,0.05);
          transform: translateY(-2px);
        }
        .hero-stats {
          position: absolute;
          right: 40px;
          bottom: 80px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          z-index: 1;
          opacity: 0;
          animation: fadeUp 0.8s 1.2s forwards;
        }
        .stat {
          text-align: right;
        }
        .stat-num {
          font-family: 'Syne', sans-serif;
          font-size: 36px;
          font-weight: 800;
          color: #16C172;
          line-height: 1;
        }
        .stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #4A6B57;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 2px;
        }
        .hero-scroll {
          position: absolute;
          bottom: 40px;
          left: 40px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #4A6B57;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          z-index: 1;
          opacity: 0;
          animation: fadeUp 0.8s 1.4s forwards;
        }
        .scroll-line {
          width: 40px;
          height: 1px;
          background: #4A6B57;
          position: relative;
          overflow: hidden;
        }
        .scroll-line::after {
          content: '';
          position: absolute;
          left: -100%;
          top: 0;
          width: 100%;
          height: 100%;
          background: #16C172;
          animation: scrollLine 2s ease-in-out infinite;
        }
        @keyframes scrollLine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .hero-content { padding: 0 24px; }
          .hero-stats { display: none; }
          .hero-actions { flex-direction: column; }
          .btn-primary, .btn-secondary { justify-content: center; }
        }
      `}</style>

      <section className="hero">
        <canvas ref={canvasRef} className="hero-canvas" />
        <div className="hero-glow" />

        <div className="hero-content">
          <div className="hero-tag">
            <span className="status-dot" />
            Available for remote work
          </div>

          <h1 className="hero-name">
            {scrambledName.split(' ').map((word, wi) => (
              <span key={wi}>
                {/* Dynamically highlight based on the date */}
                {word === highlightWord ? <span className="highlight">{word}</span> : word}
                {wi < scrambledName.split(' ').length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>

          <div className="hero-role-wrap">
            <div className="hero-role" style={{ fontFamily: 'JetBrains Mono, monospace', display: 'flex', alignItems: 'center' }}>
              — <span style={{ letterSpacing: '0.01em' }}>{roleCLI.text}</span>
              <span className="cli-caret" style={{
                display: 'inline-block',
                width: '1ch',
                marginLeft: '2px',
                color: '#16C172',
                opacity: roleCLI.caret ? 1 : 0,
                fontWeight: 700,
                fontSize: '1.1em',
                borderBottom: '3px solid #16C172',
                height: '1.1em',
                lineHeight: '1.1em',
                transition: 'opacity 0.1s',
                position: 'relative',
                top: '2px',
              }}>_</span>
            </div>
          </div>

          <p className="hero-desc">
            BSIT graduate building enterprise-grade web systems. Specialized in real-time React applications, complex workflow automation, and full-stack solutions that scale.
          </p>

          <div className="hero-actions">
            <a
              className="btn-primary"
              href="#projects"
              onClick={(e) => {
                e.preventDefault()
                document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              View Projects →
            </a>
            <a className="btn-secondary" href="mailto:keithfelipe024@gmail.com">
              keithfelipe024@gmail.com
            </a>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <div className="stat-num">3+</div>
            <div className="stat-label">Enterprise Systems</div>
          </div>
          <div className="stat">
            <div className="stat-num">1K+</div>
            <div className="stat-label">SKUs Managed</div>
          </div>
          <div className="stat">
            <div className="stat-num">∞</div>
            <div className="stat-label">Remote Ready</div>
          </div>
        </div>

        <div className="hero-scroll">
          <div className="scroll-line" />
          Scroll to explore
        </div>
      </section>
    </>
  )
}