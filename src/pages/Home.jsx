import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import About from '../components/About'
import Skills from '../components/Skills'
import Projects from '../components/Projects'
import Contact from '../components/Contact'
import Footer from '../components/Footer'
import SEO from '../components/SEO'
import useLenis from '../hooks/useLenis'

const SECTION_IDS = ['hero', 'about', 'skills', 'projects', 'contact']

export default function Home() {
  const [activeSection, setActiveSection] = useState('hero')
  const location = useLocation()
  const navigate = useNavigate()

  useLenis()

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
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean)
    if (!sections.length) return

    let frame = 0

    const update = () => {
      const marker = window.innerHeight * 0.3
      let active = sections[0].id
      for (const section of sections) {
        const rect = section.getBoundingClientRect()
        if (rect.top <= marker) {
          active = section.id
        }
      }
      setActiveSection((prev) => (prev === active ? prev : active))
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    update()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="portfolio-shell">
      <SEO path="/" />

      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />

      <main
        id="main-content"
        className="portfolio-rail"
        aria-label="Portfolio sections"
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
