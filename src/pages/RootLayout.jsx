import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import CommandPalette from '../components/CommandPalette'
import CursorTrail from '../components/CursorTrail'
import EasterEggHost from '../components/EasterEggHost'
import HalftoneBackground from '../components/HalftoneBackground'
import SceneTransition from '../components/SceneTransition'

export default function RootLayout() {
  const location = useLocation()

  // Scroll to top on route change (except hash deep-links handled by Home).
  useEffect(() => {
    if (location.hash) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [location.pathname, location.hash])

  return (
    <>
      <HalftoneBackground />
      <CursorTrail />
      <SceneTransition />
      <CommandPalette />
      <EasterEggHost />
      <Outlet />
    </>
  )
}
