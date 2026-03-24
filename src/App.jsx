import { useEffect, useState } from 'react'
import Cursor from './components/Cursor'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ScanlineIcon from './components/ScanlineIcon'

function Loader({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setLeaving(true)
            setTimeout(onDone, 600)
          }, 300)
          return 100
        }
        return p + Math.random() * 18
      })
    }, 60)
    return () => clearInterval(interval)
  }, [onDone])
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#050A07',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '32px',
      transition: 'opacity 0.6s ease, transform 0.6s ease',
      opacity: leaving ? 0 : 1,
      transform: leaving ? 'translateY(-20px)' : 'translateY(0)',
    }}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {/* Header / Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/favicon.svg" alt="logo" width={64} height={64} style={{ filter: 'drop-shadow(0 0 16px #16C17288)' }} />
              {/* Optional: animated scanline overlay on logo */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'repeating-linear-gradient(0deg, rgba(22, 193, 114, 0.08) 0px, transparent 2px, transparent 4px)',
                pointerEvents: 'none',
                borderRadius: 12,
                zIndex: 2,
                animation: 'scanlinesLogo 1.2s linear infinite'
              }} />
              <style>{`
                @keyframes scanlinesLogo {
                  0% { opacity: 0.7; }
                  50% { opacity: 1; }
                  100% { opacity: 0.7; }
                }
              `}</style>
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: '#16C172',
              textShadow: '0 0 10px #16C17288'
            }}>
              <h1 style={{ fontSize: '24px', margin: 0, letterSpacing: '0.1em' }}>KEITHFBUILDS.DEV</h1>
              <p style={{ fontSize: '12px', opacity: 0.7, margin: '4px 0 0 0' }}>v2.0.4 // NEURAL_LINK_ACTIVE</p>
            </div>
          </div>
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '13px',
        color: '#16C172',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        marginTop: 8,
        textShadow: '0 0 8px #16C17288',
      }}>
        keithfbuilds.dev
      </div>
      <div style={{ width: '200px', height: '1px', background: 'rgba(22,193,114,0.15)', borderRadius: '1px', overflow: 'hidden', marginTop: 16 }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #16C172 0%, #16C17288 100%)',
          width: `${Math.min(progress, 100)}%`,
          transition: 'width 0.1s ease',
          boxShadow: '0 0 8px #16C172',
        }} />
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '11px',
        color: '#4A6B57',
        letterSpacing: '0.1em',
        marginTop: 8,
        textShadow: '0 0 4px #16C17244',
      }}>
        {Math.min(Math.round(progress), 100)}%
      </div>
      <div style={{
        width: 220,
        height: 24,
        marginTop: 24,
        background: 'repeating-linear-gradient(0deg, #16C17211 0 2px, transparent 2px 6px)',
        borderRadius: 4,
        boxShadow: '0 0 24px #16C17222',
        opacity: 0.7,
        pointerEvents: 'none',
        animation: 'scanlines 1.2s linear infinite',
      }} />
      <style>{`
        @keyframes scanlines {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}

export default function App() {
  const [loaded, setLoaded] = useState(false)

  // Smooth scroll init with Lenis
  useEffect(() => {
    if (!loaded) return
    let lenis
    import('lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
      })

      function raf(time) {
        lenis.raf(time)
        requestAnimationFrame(raf)
      }
      requestAnimationFrame(raf)
    })

    return () => { if (lenis) lenis.destroy() }
  }, [loaded])

  return (
    <>
      {!loaded && <Loader onDone={() => setLoaded(true)} />}
      <Cursor />
      <div style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.5s ease 0.1s' }}>
        <Navbar />
        <main>
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  )
}