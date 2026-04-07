import { useEffect, useRef, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Cursor from './components/Cursor'

const SECTION_IDS = ['hero', 'about', 'skills', 'projects', 'contact']

const isDesktopViewport = () =>
  typeof window !== 'undefined' && window.matchMedia('(min-width: 1025px)').matches

export default function App() {
  const railRef = useRef(null)
  const [activeSection, setActiveSection] = useState('hero')
  const [isBooting, setIsBooting] = useState(true)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsBooting(false)
    }, 5000)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const scrollToSection = (id) => {
    const target = document.getElementById(id)
    if (!target) return

    if (isDesktopViewport() && railRef.current) {
      railRef.current.scrollTo({ left: target.offsetLeft, behavior: 'smooth' })
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    setActiveSection(id)
  }

  const handleRailKeyDown = (event) => {
    if (!isDesktopViewport()) return

    const keys = ['ArrowRight', 'ArrowLeft', 'PageDown', 'PageUp', 'Home', 'End']
    if (!keys.includes(event.key)) return

    event.preventDefault()

    if (event.key === 'Home') {
      scrollToSection(SECTION_IDS[0])
      return
    }

    if (event.key === 'End') {
      scrollToSection(SECTION_IDS[SECTION_IDS.length - 1])
      return
    }

    const direction = event.key === 'ArrowRight' || event.key === 'PageDown' ? 1 : -1
    const currentIndex = SECTION_IDS.indexOf(activeSection)
    const safeIndex = currentIndex === -1 ? 0 : currentIndex
    const nextIndex = Math.min(Math.max(safeIndex + direction, 0), SECTION_IDS.length - 1)

    scrollToSection(SECTION_IDS[nextIndex])
  }

  useEffect(() => {
    if (isBooting) return

    const rail = railRef.current
    if (!rail) return

    const onWheel = (event) => {
      if (!isDesktopViewport()) return
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return

      const panel = event.target instanceof Element ? event.target.closest('.portfolio-panel') : null
      if (panel) {
        const canScrollVertically = panel.scrollHeight > panel.clientHeight
        const atTop = panel.scrollTop <= 0
        const atBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1

        if (canScrollVertically) {
          if ((event.deltaY < 0 && !atTop) || (event.deltaY > 0 && !atBottom)) {
            return
          }
        }
      }

      event.preventDefault()
      rail.scrollBy({ left: event.deltaY * 1.15, behavior: 'auto' })
    }

    rail.addEventListener('wheel', onWheel, { passive: false })
    return () => rail.removeEventListener('wheel', onWheel)
  }, [isBooting])

  useEffect(() => {
    if (isBooting) return

    const rail = railRef.current
    if (!rail) return

    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean)
    if (!sections.length) return

    let frame = 0

    const setActiveFromViewport = () => {
      if (isDesktopViewport()) {
        const railRect = rail.getBoundingClientRect()
        const marker = railRect.left + railRect.width * 0.42
        let nearest = 'hero'
        let nearestDistance = Number.POSITIVE_INFINITY

        sections.forEach((section) => {
          const rect = section.getBoundingClientRect()
          const center = rect.left + rect.width / 2
          const distance = Math.abs(center - marker)
          if (distance < nearestDistance) {
            nearestDistance = distance
            nearest = section.id
          }
        })

        setActiveSection((prev) => (prev === nearest ? prev : nearest))
        return
      }

      const marker = window.innerHeight * 0.3
      const match = sections.find((section) => {
        const rect = section.getBoundingClientRect()
        return rect.top <= marker && rect.bottom >= marker
      })

      if (match?.id) {
        setActiveSection((prev) => (prev === match.id ? prev : match.id))
      }
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(setActiveFromViewport)
    }

    onScroll()

    rail.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      cancelAnimationFrame(frame)
      rail.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [isBooting])

  if (isBooting) {
    return (
      <div className="startup-loader" role="status" aria-live="polite" aria-busy="true">
        <div className="startup-loader-panel">
          <div className="startup-loader-art" aria-hidden="true">
            <img
              src="/images/ICON.png"
              alt=""
              className="startup-loader-icon startup-loader-icon-ghost startup-loader-icon-left"
              width="120"
              height="120"
              loading="eager"
              decoding="async"
            />
            <img
              src="/images/ICON.png"
              alt=""
              className="startup-loader-icon startup-loader-icon-main"
              width="120"
              height="120"
              loading="eager"
              decoding="async"
            />
            <img
              src="/images/ICON.png"
              alt=""
              className="startup-loader-icon startup-loader-icon-ghost startup-loader-icon-right"
              width="120"
              height="120"
              loading="eager"
              decoding="async"
            />
          </div>

          <p className="startup-loader-title">KeithFBuilds</p>

          <div className="startup-loader-progress" aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="portfolio-shell">
      <Cursor />

      <a className="skip-link focus-ring" href="#main-content">
        Skip to content
      </a>

      <Navbar activeSection={activeSection} onNavigate={scrollToSection} />

      <main
        id="main-content"
        className="portfolio-rail"
        ref={railRef}
        aria-label="Portfolio sections"
        role="region"
        tabIndex={0}
        onKeyDown={handleRailKeyDown}
      >
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>

      <Footer onNavigate={scrollToSection} />
    </div>
  )
}
