import { useEffect, useRef, useState } from 'react'

const NAV_LINKS = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
]

export default function Navbar({ activeSection = 'hero', onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleRef = useRef(null)
  const navRef = useRef(null)
  const hadMenuOpenRef = useRef(false)

  useEffect(() => {
    if (menuOpen) {
      const firstLink = navRef.current?.querySelector('a')
      firstLink?.focus()
      hadMenuOpenRef.current = true
      return
    }

    if (hadMenuOpenRef.current) {
      toggleRef.current?.focus()
      hadMenuOpenRef.current = false
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    const trapFocus = (event) => {
      if (event.key !== 'Tab') return

      const focusable = navRef.current?.querySelectorAll('a')
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    window.addEventListener('keydown', trapFocus)

    return () => {
      window.removeEventListener('keydown', closeOnEscape)
      window.removeEventListener('keydown', trapFocus)
    }
  }, [menuOpen])

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth > 1024) setMenuOpen(false)
    }

    window.addEventListener('resize', closeOnDesktop)
    return () => window.removeEventListener('resize', closeOnDesktop)
  }, [])

  const handleNavigate = (event, id) => {
    event.preventDefault()
    onNavigate?.(id)
    setMenuOpen(false)
  }

  return (
    <header className="top-nav">
      <a href="#hero" className="brand focus-ring" onClick={(event) => handleNavigate(event, 'hero')}>
        KeithFBuilds
      </a>

      <button
        type="button"
        ref={toggleRef}
        className="nav-toggle focus-ring"
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        Menu
      </button>

      <nav id="primary-navigation" ref={navRef} className={`top-nav-links ${menuOpen ? 'open' : ''}`} aria-label="Primary">
        {NAV_LINKS.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={(event) => handleNavigate(event, link.id)}
            className={`focus-ring ${activeSection === link.id ? 'active' : ''}`}
            aria-current={activeSection === link.id ? 'page' : undefined}
          >
            {link.label}
          </a>
        ))}

        <a
          href="#contact"
          className="focus-ring nav-hire"
          onClick={(event) => handleNavigate(event, 'contact')}
        >
          Open to Work
        </a>
      </nav>
    </header>
  )
}
