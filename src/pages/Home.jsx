import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import About from '../components/About'
import Skills from '../components/Skills'
import Projects from '../components/Projects'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import AmbientAudioToggle from '../components/AmbientAudioToggle'
import useCommandPalette from '../hooks/useCommandPalette'
import useLenis from '../hooks/useLenis'

const SECTION_IDS = ['hero', 'about', 'skills', 'projects', 'contact']

export default function Home() {
  const [activeSection, setActiveSection] = useState('hero')
  const [isTransitioning, setIsTransitioning] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const railRef = useRef(null)
  const { openPalette } = useCommandPalette()

  useLenis()

  useEffect(() => {
    const timer = window.setTimeout(() => setIsTransitioning(false), 400)
    return () => window.clearTimeout(timer)
  }, [])

  const scrollToSection = useCallback((id) => {
    const target = document.getElementById(id)
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSection(id)
  }, [])

  const handleNavigate = useCallback(
    (id) => {
      scrollToSection(id)
      if (location.hash) {
        navigate('/', { replace: true })
      }
    },
    [location.hash, navigate, scrollToSection]
  )

  // Scroll to the section named by the hash when arriving from /project/* etc.
  useEffect(() => {
    if (!location.hash) return
    const id = location.hash.replace('#', '')
    if (!SECTION_IDS.includes(id)) return
    const frame = window.requestAnimationFrame(() => scrollToSection(id))
    return () => window.cancelAnimationFrame(frame)
  }, [location.hash, scrollToSection])

  // Vertical scrollspy: highlight the section whose top crossed ~30% of viewport.
  useEffect(() => {
    const rail = railRef.current
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean)
    if (!sections.length) return

    if (!rail) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const id = entry.target.id
          setActiveSection((prev) => (prev === id ? prev : id))
        }
      },
      {
        root: rail,
        threshold: 0,
        rootMargin: '-30% 0px -69% 0px',
      }
    )

    sections.forEach((section) => observer.observe(section))

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div className="portfolio-shell">
      <SEO path="/" />

      <div className="home-system-controls" aria-label="System controls">
        <AmbientAudioToggle />

        <button type="button" className="cmdk-trigger focus-ring" onClick={openPalette}>
          Menu <span className="cmdk-trigger-key">⌘K</span>
        </button>
      </div>

      <div className={`scene-shutter ${isTransitioning ? 'entering' : 'leaving'}`} aria-hidden="true">
        <div
          className="scene-shutter-panel scene-shutter-panel-red"
          style={{ transition: 'transform 480ms cubic-bezier(0.2, 0.9, 0.2, 1)' }}
        />
        <div
          className="scene-shutter-panel scene-shutter-panel-cyan"
          style={{ transition: 'transform 480ms cubic-bezier(0.2, 0.9, 0.2, 1) 60ms' }}
        />
      </div>

      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

      <main
        id="main-content"
        className="portfolio-rail"
        aria-label="Portfolio sections"
        ref={railRef}
      >
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  )
}
