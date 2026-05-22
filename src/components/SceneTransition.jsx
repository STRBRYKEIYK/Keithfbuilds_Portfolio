import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion'
import useDeviceCapabilities from '../hooks/useDeviceCapabilities'

export default function SceneTransition() {
  const location = useLocation()
  const prefersReducedMotion = usePrefersReducedMotion()
  const { shouldReduceEffects } = useDeviceCapabilities()
  const disabled = prefersReducedMotion || shouldReduceEffects
  const lastPath = useRef(location.pathname)
  const [phase, setPhase] = useState('idle') // 'entering' | 'leaving' | 'idle'

  useEffect(() => {
    if (disabled) return
    if (lastPath.current === location.pathname) return
    lastPath.current = location.pathname

    let inTimer = 0
    let outTimer = 0
    setPhase('entering')
    inTimer = window.setTimeout(() => {
      setPhase('leaving')
      outTimer = window.setTimeout(() => setPhase('idle'), 320)
    }, 480)
    return () => {
      window.clearTimeout(inTimer)
      window.clearTimeout(outTimer)
    }
  }, [location.pathname, disabled])

  if (disabled) return null

  return (
    <div className={`scene-shutter ${phase}`} aria-hidden="true">
      <span
        className="scene-shutter-panel scene-shutter-panel-red"
        style={{ transition: 'transform 480ms cubic-bezier(0.2, 0.9, 0.2, 1)' }}
      />
      <span
        className="scene-shutter-panel scene-shutter-panel-cyan"
        style={{ transition: 'transform 480ms cubic-bezier(0.2, 0.9, 0.2, 1) 60ms' }}
      />
    </div>
  )
}
