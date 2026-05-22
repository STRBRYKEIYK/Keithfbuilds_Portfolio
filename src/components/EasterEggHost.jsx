import { useEffect, useRef } from 'react'
import useKonamiCode from '../hooks/hero/useKonamiCode'
import useCommandPalette from '../hooks/useCommandPalette'

export default function EasterEggHost() {
  const { registerAction, removeAction } = useCommandPalette()
  const chaosTimerRef = useRef(0)

  useKonamiCode({
    onComplete: () => {
      const root = document.documentElement
      root.classList.add('riso-chaos')

      if (chaosTimerRef.current) {
        window.clearTimeout(chaosTimerRef.current)
      }
      chaosTimerRef.current = window.setTimeout(() => {
        root.classList.remove('riso-chaos')
      }, 6000)

      registerAction({
        id: 'credits',
        group: 'Hidden',
        glyph: '★',
        label: 'View credits',
        hint: 'You found the Konami egg',
        run: () => {
          window.alert(
            'Keith F. Builds — built with care.\nThanks for poking around. Try /, ⌘K, or drag the project rail.'
          )
        },
      })
    },
  })

  useEffect(
    () => () => {
      if (chaosTimerRef.current) {
        window.clearTimeout(chaosTimerRef.current)
        document.documentElement.classList.remove('riso-chaos')
      }
      removeAction('credits')
    },
    [removeAction]
  )

  return null
}
