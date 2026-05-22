import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import useDeviceCapabilities from '../hooks/useDeviceCapabilities'
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion'

export default function SignatureTitle({
  text,
  as: Tag = 'h2',
  spacing = '0.32em',
  className = '',
  style: styleProp,
  misregister = true,
  misregisterColor = 'red',
  ...rest
}) {
  const rootRef = useRef(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const { shouldReduceEffects } = useDeviceCapabilities()
  const skipAnimation = prefersReducedMotion || shouldReduceEffects

  useEffect(() => {
    if (skipAnimation) return
    const root = rootRef.current
    if (!root) return

    const letters = root.querySelectorAll('.signature-letter')
    if (!letters.length) return

    const tl = gsap.timeline()
    tl.fromTo(
      letters,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.035 }
    )
    tl.fromTo(
      root,
      { letterSpacing: '0em' },
      { letterSpacing: spacing, duration: 0.6, ease: 'power3.out' },
      '<'
    )

    return () => {
      tl.kill()
    }
  }, [text, spacing, skipAnimation])

  if (!text) return null

  const characters = Array.from(text)
  const ghostClass = misregisterColor === 'cyan' ? 'signature-ghost-cyan' : 'signature-ghost-red'

  return (
    <Tag
      ref={rootRef}
      className={`signature-title ${className}`.trim()}
      {...rest}
      style={{
        letterSpacing: skipAnimation ? spacing : '0em',
        ...(styleProp || {}),
      }}
      aria-label={text}
    >
      {misregister && (
        <span className={`signature-ghost ${ghostClass}`} aria-hidden="true">
          {characters.map((char, i) => (
            <span key={`g-${i}`} className="signature-letter-ghost">
              {char === ' ' ? ' ' : char}
            </span>
          ))}
        </span>
      )}
      {characters.map((char, i) => (
        <span
          key={`${char}-${i}`}
          className="signature-letter"
          aria-hidden="true"
        >
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </Tag>
  )
}
