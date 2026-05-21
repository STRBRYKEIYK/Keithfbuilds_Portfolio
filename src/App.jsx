import { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Cursor from './components/Cursor'
import { router } from './router.jsx'

const getBootTime = () => {
  if (typeof window === 'undefined') return 5000
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
  const cores = navigator.hardwareConcurrency || 4
  const isLowEnd = cores <= 2

  if (isLowEnd || isMac) return 2000
  return 5000
}

export default function App() {
  const [isBooting, setIsBooting] = useState(true)

  useEffect(() => {
    const bootTime = getBootTime()
    const timeoutId = window.setTimeout(() => {
      setIsBooting(false)
    }, bootTime)

    return () => window.clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    const onContextMenu = (event) => {
      event.preventDefault()
    }

    const onDragStart = (event) => {
      const target = event.target
      if (target instanceof Element && target.closest('img')) {
        event.preventDefault()
      }
    }

    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('dragstart', onDragStart)

    return () => {
      document.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('dragstart', onDragStart)
    }
  }, [])

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
    <HelmetProvider>
      <Cursor />

      <a className="skip-link focus-ring" href="#main-content">
        Skip to content
      </a>

      <RouterProvider router={router} />
    </HelmetProvider>
  )
}
