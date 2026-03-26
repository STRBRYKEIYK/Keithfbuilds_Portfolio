import { useEffect, useRef, useState, useCallback } from 'react'
import useTypingLoop from '../hooks/hero/useTypingLoop'
import useScramble from '../hooks/hero/useScramble'
import useKonamiCode from '../hooks/hero/useKonamiCode'
import useDotGrid from '../hooks/hero/useDotGrid'

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES = [
  'Full-Stack Developer',
  'React Specialist',
  'Enterprise Systems Builder',
  'Remote-Ready Engineer',
]

const KONAMI = [
  'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a',
]

const BOOT_LINES = [
  '> SYSTEM OVERRIDE INITIATED...',
  '> AUTH: ████████ [BYPASSED]',
  '> LOADING SECRET PROFILE...',
  '> SUBJECT: KEITH WILHELM FELIPE',
  '> CLASSIFICATION: ELITE ENGINEER',
  '> STACK PROFICIENCY: ██████████ 99%',
  '> COFFEE DEPENDENCY: CRITICAL',
  '> REMOTE AVAILABILITY: ALWAYS',
  '> STATUS: DANGEROUS HIRE ⚠',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getOrdinalAge(n) {
  const j = n % 10, k = n % 100
  if (j === 1 && k !== 11) return `${n}ST`
  if (j === 2 && k !== 12) return `${n}ND`
  if (j === 3 && k !== 13) return `${n}RD`
  return `${n}TH`
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

// ─── Konami Overlay ───────────────────────────────────────────────────────────

// Facts for randomization
const KONAMI_FACTS = [
  'Our first pet was a pigeon.',
  'Our second pet was a duck named after a DOTA character.',
  'I love Strawberry.',
  'I have a dimple.',
  'German and Spanish lineage.',
]

function daysUntilBirthday() {
  const now = new Date()
  const year = now.getMonth() > 3 || (now.getMonth() === 3 && now.getDate() > 24) ? now.getFullYear() + 1 : now.getFullYear()
  const bday = new Date(year, 3, 24)
  const diff = Math.ceil((bday - now) / (1000 * 60 * 60 * 24))
  return diff
}

function KonamiOverlay({ onClose }) {
  const [lines, setLines] = useState([])
  const [done, setDone] = useState(false)
  const [fact, setFact] = useState('')
  const closeBtnRef = useRef(null)

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  useEffect(() => {
    // Pick a random fact each time
    setFact(KONAMI_FACTS[Math.floor(Math.random() * KONAMI_FACTS.length)])
    let i = 0
    const id = setInterval(() => {
      setLines(prev => [...prev, BOOT_LINES[i]])
      i++
      if (i >= BOOT_LINES.length) {
        clearInterval(id)
        setTimeout(() => setDone(true), 500)
      }
    }, 270)
    return () => clearInterval(id)
  }, [])

  // User info
  const birthYear = '2002'
  const comebackMsg = `Comeback at ${daysUntilBirthday()} days from now.`

  useEffect(() => {
    if (!done) return
    closeBtnRef.current?.focus?.()
  }, [done])

  return (
    <div
      className="konami-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="konami-title"
      tabIndex={-1}
      style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(5,10,7,0.96)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'konamiFadeIn 0.22s ease',
      }}
    >
      <div
        className="konami-dialog"
        style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 13, lineHeight: 1,
        color: '#16C172',
        maxWidth: 520, width: '90%',
        padding: '40px 36px',
        border: '1px solid rgba(22,193,114,0.28)',
        borderRadius: 8,
        background: 'rgba(22,193,114,0.025)',
        boxShadow: '0 0 60px rgba(22,193,114,0.14)',
        position: 'relative',
        overflow: 'hidden',
      }}
      >
        {/* scanlines inside overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg,transparent 0px,transparent 2px,rgba(5,10,7,0.14) 2px,rgba(5,10,7,0.14) 3px)',
        }} />
        <div id="konami-title" style={{ fontSize: 9, letterSpacing: '0.2em', color: '#4A6B57', marginBottom: 24, position: 'relative' }}>
          // KONAMI CODE DETECTED — CLASSIFIED ACCESS GRANTED
        </div>
        {lines.map((ln, i) => (
          <div key={i} style={{
            marginBottom: 12, lineHeight: 1.6,
            opacity: 0, position: 'relative',
            animation: `bootLine 0.18s ease ${i * 0.01}s forwards`,
          }}>{ln}</div>
        ))}
        {done && (
          <div style={{marginTop: 18, marginBottom: 18, fontFamily: "'JetBrains Mono', monospace", color: '#16C172'}}>
            <div style={{marginBottom: 8}}>&gt; BIRTH YEAR: 2002</div>
            <div style={{marginBottom: 8}}>&gt; RANDOM FACT: {fact}</div>
            <div style={{marginTop: 10, color:'#7A9E8C', fontSize:12}}>&gt; {comebackMsg} {/* Don't let them know it's my birthday */}</div>
          </div>
        )}
        {done && (
          <button
            type="button"
            ref={closeBtnRef}
            onClick={onClose}
            style={{
              marginTop: 10, width: '100%', padding: '13px 0',
              background: 'rgba(22,193,114,0.08)',
              border: '1px solid rgba(22,193,114,0.35)',
              borderRadius: 4, color: '#16C172',
              fontFamily: 'inherit', fontSize: 11,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'background 0.2s',
              position: 'relative',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(22,193,114,0.16)'}
            onMouseOut={e  => e.currentTarget.style.background = 'rgba(22,193,114,0.08)'}
          >
            [ CLOSE TERMINAL ]
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────


export default function Hero() {
  const canvasRef = useRef(null)
  const [scrambleTrigger, setScrambleTrigger] = useState(false)
  const [showKonami, setShowKonami] = useState(false)
  const [glitch, setGlitch] = useState(false)
  const lastKonamiFocusRef = useRef(null)

  // Birthday easter egg
  const today = new Date()
  const isBirthday = today.getMonth() === 3 && today.getDate() === 24
  // const isBirthday = true // ← uncomment to test
  const age = today.getFullYear() - 2002
  const fullName  = isBirthday ? `HAPPY ${getOrdinalAge(age)} BIRTHDAY KEITH` : 'KEITH WILHELM FELIPE'
  const highlight = isBirthday ? 'KEITH' : 'FELIPE'

  const scrambledName = useScramble(fullName, scrambleTrigger)
  const { display: roleText, caretOn } = useTypingLoop(ROLES)
  useDotGrid(canvasRef)

  const openKonami = useCallback(() => {
    lastKonamiFocusRef.current = document.activeElement
    setShowKonami(true)
  }, [])
  useKonamiCode({ sequence: KONAMI, onComplete: openKonami })

  useEffect(() => {
    if (showKonami) return
    lastKonamiFocusRef.current?.focus?.()
  }, [showKonami])

  // Boot scramble
  useEffect(() => {
    const t = setTimeout(() => setScrambleTrigger(true), 350)
    return () => clearTimeout(t)
  }, [])

  // Re-scramble on scroll-to-top
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY < 5) fireScramble()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function fireScramble() {
    setScrambleTrigger(false)
    requestAnimationFrame(() => setScrambleTrigger(true))
  }

  function handleNameClick() {
    fireScramble()
    setGlitch(true)
    setTimeout(() => setGlitch(false), 320)
  }

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(26px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes konamiFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes bootLine {
          from { opacity:0; transform:translateX(-8px); }
          to   { opacity:1; transform:translateX(0);    }
        }
        @keyframes scanSweep {
          0%   { transform:translateY(-100%); }
          100% { transform:translateY(420%);  }
        }
        @keyframes scrollLine {
          0%   { left:-100%; }
          100% { left:110%;  }
        }
        @keyframes dotPulse {
          0%,100% { box-shadow:0 0 0 0 rgba(22,193,114,0.5); }
          60%     { box-shadow:0 0 0 7px rgba(22,193,114,0); }
        }
        @keyframes nameGlitch {
          0%  { text-shadow:-3px 0 rgba(255,50,50,0.7),  3px 0 rgba(22,193,114,0.7); }
          25% { text-shadow: 3px 0 rgba(255,50,50,0.7), -3px 0 rgba(22,193,114,0.7); }
          50% { text-shadow:-2px 0 rgba(0,200,255,0.5),  2px 0 rgba(255,80,80,0.4); }
          75% { text-shadow: 2px 0 rgba(22,193,114,0.6),-2px 0 rgba(0,200,255,0.5); }
          100%{ text-shadow: 0 0 32px rgba(22,193,114,0.3); }
        }

        /* Reduced motion: disable CSS-driven animation in hero + Konami overlay. */
        @media (prefers-reduced-motion: reduce) {
          .status-dot { animation: none !important; }
          .hero-tag { animation: none !important; }
          .hero-name-wrap { animation: none !important; }
          .hero-name.glitch { animation: none !important; }
          .hero-role-wrap { animation: none !important; }
          .hero-desc { animation: none !important; }
          .hero-actions { animation: none !important; }
          .name-scan::after { animation: none !important; }
          .scroll-line::after { animation: none !important; }
          .bday-banner { animation: none !important; }
          .konami-overlay, .konami-overlay * {
            animation: none !important;
            transition: none !important;
          }
        }

        .hero {
          min-height:100vh;
          display:flex; align-items:center;
          position:relative; overflow:hidden;
          padding-top:80px;
          background:var(--bg,#050A07);
        }
        .hero-canvas {
          position:absolute; inset:0;
          width:100%; height:100%;
          z-index:0; pointer-events:none;
        }
        .hero-glow {
          position:absolute;
          width:700px; height:700px;
          background:radial-gradient(circle,rgba(22,193,114,0.05) 0%,transparent 68%);
          top:50%; left:42%;
          transform:translate(-50%,-50%);
          pointer-events:none; z-index:0;
        }
        .hero-content {
          position:relative; z-index:1;
          max-width:1200px; margin:0 auto;
          padding:0 40px; width:100%;
        }

        /* Status */
        .hero-tag {
          font-family:'JetBrains Mono',monospace;
          font-size:11px; color:#16C172;
          letter-spacing:0.18em; text-transform:uppercase;
          margin-bottom:32px;
          display:flex; align-items:center; gap:10px;
          opacity:0; animation:fadeUp 0.65s 0.15s forwards;
        }
        .hero-tag::before {
          content:''; display:block;
          width:28px; height:1px;
          background:#16C172; box-shadow:0 0 6px #16C172;
        }
        .status-dot {
          width:7px; height:7px;
          background:#16C172; border-radius:50%;
          animation:dotPulse 2.2s ease-in-out infinite;
        }

        /* Name */
        .hero-name-wrap {
          position:relative; display:inline-block;
          margin-bottom:24px;
          cursor:pointer; user-select:none;
          opacity:0; animation:fadeUp 0.65s 0.32s forwards;
          max-width:100vw;
        }
        .hero-name {
          font-family:'Syne',sans-serif;
          font-size:clamp(36px,7vw,88px);
          font-weight:800; line-height:1.05;
          letter-spacing:-0.03em; color:#E8F5F0;
          text-shadow:0 0 32px rgba(22,193,114,0.15);
          margin:0;
          word-break:break-word;
          white-space:normal;
          max-width:90vw;
          overflow-wrap:break-word;
          overflow:visible;
          text-overflow:unset;
        }
        @media (max-width: 600px) {
          .hero-name {
            font-size:clamp(22px,7vw,44px);
            max-width:80vw;
          }
        }
        .hero-name.glitch { animation:nameGlitch 0.3s steps(1) 1; }
        .hero-name .hl { color:#16C172; text-shadow:0 0 40px rgba(22,193,114,0.4); }

        /* Scanline overlay */
        .name-scan {
          position:absolute; inset:0;
          pointer-events:none; overflow:hidden; z-index:2;
        }
        .name-scan::before {
          content:''; position:absolute; inset:0;
          background:repeating-linear-gradient(
            0deg, transparent 0px, transparent 2px,
            rgba(5,12,8,0.12) 2px, rgba(5,12,8,0.12) 3px
          );
        }
        .name-scan::after {
          content:''; position:absolute; left:0; right:0; height:32%;
          background:linear-gradient(
            to bottom,
            transparent 0%,
            rgba(22,193,114,0.06) 40%,
            rgba(22,193,114,0.16) 54%,
            rgba(22,193,114,0.06) 70%,
            transparent 100%
          );
          animation:scanSweep 3.6s linear infinite;
        }
        .name-hint {
          position:absolute; bottom:-16px; left:0;
          font-family:'JetBrains Mono',monospace;
          font-size:9px; letter-spacing:0.12em;
          color:rgba(22,193,114,0.3); text-transform:uppercase;
          opacity:0; transition:opacity 0.22s;
        }
        .hero-name-wrap:hover .name-hint { opacity:1; }

        /* Role */
        .hero-role-wrap {
          height:40px; display:flex; align-items:center;
          margin-bottom:32px;
          opacity:0; animation:fadeUp 0.65s 0.5s forwards;
        }
        .hero-role {
          font-family:'JetBrains Mono',monospace;
          font-size:clamp(13px,1.8vw,19px);
          color:#7A9E8C;
          display:flex; align-items:center;
        }
        .role-prefix { color:#4A6B57; margin-right:10px; }
        .role-text   { color:#16C172; }
        .role-caret  {
          display:inline-block; width:2px; height:1.1em;
          background:#16C172; margin-left:3px;
          border-radius:1px; vertical-align:middle;
          box-shadow:0 0 6px #16C172; transition:opacity 0.07s;
        }

        /* Desc */
        .hero-desc {
          max-width:500px; font-size:15px;
          color:#7A9E8C; font-weight:300; line-height:1.85;
          margin-bottom:44px;
          opacity:0; animation:fadeUp 0.65s 0.66s forwards;
        }

        /* CTAs */
        .hero-actions {
          display:flex; gap:14px; flex-wrap:wrap;
          opacity:0; animation:fadeUp 0.65s 0.82s forwards;
        }
        .btn-primary {
          display:inline-flex; align-items:center; gap:10px;
          background:#16C172; color:#050A07;
          font-family:'JetBrains Mono',monospace;
          font-size:11px; font-weight:600;
          letter-spacing:0.12em; text-transform:uppercase;
          padding:15px 30px; border-radius:4px;
          text-decoration:none; position:relative; overflow:hidden;
          transition:transform 0.22s, box-shadow 0.22s;
        }
        .btn-primary::before {
          content:''; position:absolute; inset:0;
          background:rgba(255,255,255,0.12);
          transform:translateX(-105%); transition:transform 0.26s;
        }
        .btn-primary:hover::before { transform:translateX(0); }
        .btn-primary:hover {
          transform:translateY(-2px);
          box-shadow:0 0 34px rgba(22,193,114,0.45),0 6px 22px rgba(22,193,114,0.2);
        }
        .btn-secondary {
          display:inline-flex; align-items:center; gap:10px;
          border:1px solid rgba(22,193,114,0.28); color:#E8F5F0;
          font-family:'JetBrains Mono',monospace;
          font-size:11px; letter-spacing:0.12em; text-transform:uppercase;
          padding:15px 30px; border-radius:4px; text-decoration:none;
          transition:border-color 0.22s, background 0.22s, transform 0.22s;
        }
        .btn-secondary:hover {
          border-color:rgba(22,193,114,0.6);
          background:rgba(22,193,114,0.06);
          transform:translateY(-2px);
        }

        /* Stats */
        .hero-stats {
          position:absolute; right:40px; bottom:80px;
          display:flex; flex-direction:column; gap:24px;
          z-index:1; text-align:right;
          opacity:0; animation:fadeUp 0.65s 1.0s forwards;
        }
        .stat-num {
          font-family:'Syne',sans-serif;
          font-size:38px; font-weight:800;
          color:#16C172; line-height:1;
        }
        .stat-label {
          font-family:'JetBrains Mono',monospace;
          font-size:9px; color:#4A6B57;
          letter-spacing:0.12em; text-transform:uppercase; margin-top:3px;
        }
        .stat-hr { height:1px; background:rgba(22,193,114,0.1); }

        /* Scroll */
        .hero-scroll {
          position:absolute; bottom:36px; left:40px;
          display:flex; align-items:center; gap:12px;
          font-family:'JetBrains Mono',monospace;
          font-size:9px; color:#4A6B57;
          letter-spacing:0.18em; text-transform:uppercase;
          z-index:1;
          opacity:0; animation:fadeUp 0.65s 1.15s forwards;
        }
        .scroll-line {
          width:44px; height:1px;
          background:rgba(22,193,114,0.14);
          position:relative; overflow:hidden; border-radius:1px;
        }
        .scroll-line::after {
          content:''; position:absolute;
          left:-100%; top:0; width:100%; height:100%;
          background:#16C172; box-shadow:0 0 6px #16C172;
          animation:scrollLine 2.4s ease-in-out infinite;
        }

        /* Birthday banner */
        .bday-banner {
          position:absolute; top:24px; right:40px;
          font-family:'JetBrains Mono',monospace;
          font-size:10px; color:#16C172;
          letter-spacing:0.1em;
          border:1px solid rgba(22,193,114,0.25);
          padding:6px 14px; border-radius:3px;
          background:rgba(22,193,114,0.06);
          z-index:2;
          opacity:0; animation:fadeUp 0.65s 1.3s forwards;
        }

        @media (max-width:768px) {
          .hero-content  { padding:0 24px; }
          .hero-stats    { display:none; }
          .hero-actions  { flex-direction:column; }
          .btn-primary,.btn-secondary { justify-content:center; }
          .hero-scroll   { left:24px; }
        }
      `}</style>



      {/* Ten very subtle, scattered Konami code hints */}
      {/* Hint 1: Top left, vague */}
      <div style={{position:'fixed',top:12,left:12,zIndex:999,background:'rgba(22,193,114,0.04)',color:'#16C172',fontFamily:'JetBrains Mono,monospace',fontSize:10,padding:'3px 10px',borderRadius:4,opacity:0.32,boxShadow:'none',pointerEvents:'none'}}>
        <span>Patterns unlock secrets.</span>
      </div>
      {/* Hint 2: Bottom left, tiny */}
      <div style={{position:'fixed',bottom:8,left:18,zIndex:999,background:'rgba(22,193,114,0.03)',color:'#16C172',fontFamily:'JetBrains Mono,monospace',fontSize:9,padding:'2px 7px',borderRadius:3,opacity:0.22,boxShadow:'none',pointerEvents:'none'}}>
        <span>Not all keys are visible.</span>
      </div>
      {/* Hint 3: Near scroll hint */}
      <div style={{position:'absolute',bottom:70,left:40,zIndex:999,background:'rgba(22,193,114,0.06)',color:'#16C172',fontFamily:'JetBrains Mono,monospace',fontSize:10,padding:'4px 10px',borderRadius:4,opacity:0.18,boxShadow:'none',pointerEvents:'none'}}>
        <span>Try a classic sequence.</span>
      </div>
      {/* Hint 4: Near name, very subtle */}
      <div style={{position:'absolute',top:110,left:60,zIndex:999,background:'rgba(22,193,114,0.04)',color:'#16C172',fontFamily:'JetBrains Mono,monospace',fontSize:9,padding:'2px 8px',borderRadius:3,opacity:0.13,boxShadow:'none',pointerEvents:'none'}}>
        <span>↑ ↑ ...</span>
      </div>
      {/* Hint 5: Top right, cryptic */}
      <div style={{position:'fixed',top:16,right:22,zIndex:999,background:'rgba(22,193,114,0.03)',color:'#16C172',fontFamily:'JetBrains Mono,monospace',fontSize:10,padding:'2px 8px',borderRadius:3,opacity:0.19,boxShadow:'none',pointerEvents:'none'}}>
        <span>Some codes are legendary.</span>
      </div>
      {/* Hint 6: Bottom right, tiny */}
      <div style={{position:'fixed',bottom:12,right:18,zIndex:999,background:'rgba(22,193,114,0.02)',color:'#16C172',fontFamily:'JetBrains Mono,monospace',fontSize:9,padding:'2px 7px',borderRadius:3,opacity:0.13,boxShadow:'none',pointerEvents:'none'}}>
        <span>Old school unlocks.</span>
      </div>
      {/* Hint 7: Middle left, faint */}
      <div style={{position:'fixed',top:'48%',left:10,zIndex:999,background:'rgba(22,193,114,0.02)',color:'#16C172',fontFamily:'JetBrains Mono,monospace',fontSize:9,padding:'2px 7px',borderRadius:3,opacity:0.11,boxShadow:'none',pointerEvents:'none'}}>
        <span>Up, up, ...</span>
      </div>
      {/* Hint 8: Middle right, faint */}
      <div style={{position:'fixed',top:'52%',right:10,zIndex:999,background:'rgba(22,193,114,0.02)',color:'#16C172',fontFamily:'JetBrains Mono,monospace',fontSize:9,padding:'2px 7px',borderRadius:3,opacity:0.11,boxShadow:'none',pointerEvents:'none'}}>
        <span>...down, down</span>
      </div>
      {/* Hint 9: Above hero actions, cryptic */}
      <div style={{position:'absolute',bottom:160,left:60,zIndex:999,background:'rgba(22,193,114,0.03)',color:'#16C172',fontFamily:'JetBrains Mono,monospace',fontSize:9,padding:'2px 7px',borderRadius:3,opacity:0.13,boxShadow:'none',pointerEvents:'none'}}>
        <span>Left, right, left, right...</span>
      </div>
      {/* Hint 10: Near stats, final nudge */}
      <div style={{position:'absolute',right:60,bottom:180,zIndex:999,background:'rgba(22,193,114,0.03)',color:'#16C172',fontFamily:'JetBrains Mono,monospace',fontSize:9,padding:'2px 7px',borderRadius:3,opacity:0.13,boxShadow:'none',pointerEvents:'none'}}>
        <span>B, A</span>
      </div>

      {showKonami && <KonamiOverlay onClose={() => setShowKonami(false)} />}

      <section className="hero">
        <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />
        <div className="hero-glow" aria-hidden="true" />

        {isBirthday && (
          <div className="bday-banner" role="note">🎂 IT'S YOUR DAY, KEITH!</div>
        )}

        <div className="hero-content">

          {/* Status tag */}
          <div className="hero-tag">
            <span className="status-dot" aria-hidden="true" />
            Available for remote work
          </div>

          {/* Clickable name with scanline overlay */}
          <div
            className="hero-name-wrap"
            onClick={handleNameClick}
            role="button"
            tabIndex={0}
            aria-label="Click to glitch the name"
            onKeyDown={(e) => e.key === 'Enter' && handleNameClick()}
          >
            <h1 className={`hero-name${glitch ? ' glitch' : ''}`} style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.05}}>
              {scrambledName.split(' ').map((word, wi) => (
                <span key={wi} style={{display: 'block', width: '100%'}}>
                  {word === highlight
                    ? <span className="hl">{word}</span>
                    : word}
                </span>
              ))}
            </h1>
            <div className="name-scan" aria-hidden="true" />
            <span className="name-hint" aria-hidden="true">[ click to glitch ]</span>
          </div>

          {/* Typing role */}
          <div className="hero-role-wrap">
            <div className="hero-role" aria-live="polite" aria-label={`Role: ${roleText}`}>
              <span className="role-prefix">$&nbsp;whoami —</span>
              <span className="role-text">{roleText}</span>
              <span
                className="role-caret"
                style={{ opacity: caretOn ? 1 : 0 }}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Bio */}
          <p className="hero-desc">
            BSIT graduate building enterprise-grade web systems. Specialized in
            real-time React applications, complex workflow automation, and
            full-stack solutions that scale.
          </p>

          {/* CTAs */}
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

        {/* Stats sidebar */}
        <div className="hero-stats" aria-label="Quick stats">
          <div>
            <div className="stat-num">4+</div>
            <div className="stat-label">Enterprise Systems</div>
          </div>
          <div className="stat-hr" />
          <div>
            <div className="stat-num">1K+</div>
            <div className="stat-label">SKUs Managed</div>
          </div>
          <div className="stat-hr" />
          <div>
            <div className="stat-num">∞</div>
            <div className="stat-label">Remote Ready</div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="hero-scroll" aria-hidden="true">
          <div className="scroll-line" />
          Scroll to explore
        </div>
      </section>
    </>
  )
}