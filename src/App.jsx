import { useEffect, useState } from 'react'
import Cursor from './components/Cursor'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'

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
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '13px',
        color: '#16C172',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
      }}>
        keithfbuilds.dev
      </div>
      <div style={{ width: '200px', height: '1px', background: 'rgba(22,193,114,0.15)', borderRadius: '1px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          background: '#16C172',
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
      }}>
        {Math.min(Math.round(progress), 100)}%
      </div>
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