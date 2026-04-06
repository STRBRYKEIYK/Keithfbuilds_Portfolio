import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { useEffect } from 'react'

const CarouselContext = createContext(null)

function useCarouselContext() {
  const ctx = useContext(CarouselContext)
  if (!ctx) throw new Error('Carousel.* components must be used within <Carousel.Root />')
  return ctx
}

/**
 * @param {object} props
 * @param {number} props.count Total number of items.
 * @param {number} [props.initialIndex=0]
 * @param {number} [props.transitionMs=300] Minimum interval between navigation actions.
 * @param {boolean} [props.loop=true]
 * @param {(value: ReturnType<typeof getApi>) => React.ReactNode} props.children
 */
function Root({ count, initialIndex = 0, transitionMs = 300, loop = true, children }) {
  const [activeIndex, setActiveIndex] = useState(initialIndex)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState(1)
  const timeoutRef = useRef(0)

  const safeCount = Math.max(0, Number(count) || 0)

  const goTo = useCallback(
    (idx) => {
      if (isAnimating) return
      if (safeCount <= 0) return

      const next = ((idx % safeCount) + safeCount) % safeCount
      if (next === activeIndex) return

      setDirection(next > activeIndex ? 1 : -1)
      setIsAnimating(true)

      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => {
        setActiveIndex(next)
        setIsAnimating(false)
      }, transitionMs)
    },
    [activeIndex, isAnimating, transitionMs, safeCount]
  )

  const goPrev = useCallback(() => {
    if (safeCount <= 0) return
    goTo(activeIndex - 1)
  }, [activeIndex, goTo, safeCount])

  const goNext = useCallback(() => {
    if (safeCount <= 0) return
    goTo(activeIndex + 1)
  }, [activeIndex, goTo, safeCount])

  // Keep stable API for consumers.
  const api = useMemo(
    () => ({
      count: safeCount,
      activeIndex,
      isAnimating,
      direction,
      goTo,
      goPrev: loop ? goPrev : () => activeIndex > 0 && goTo(activeIndex - 1),
      goNext: loop ? goNext : () => activeIndex < safeCount - 1 && goTo(activeIndex + 1),
    }),
    [activeIndex, direction, goNext, goPrev, goTo, isAnimating, loop, safeCount]
  )

  const ariaLabel = 'Carousel'

  const onKeyDown = (e) => {
    const t = e.target
    const tag = t?.tagName
    const isTypingTarget =
      tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t?.isContentEditable
    if (isTypingTarget) return

    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goPrev()
      return
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goNext()
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      style={{ position: 'relative', outline: 'none' }}
    >
      {/* Screen-reader friendly live region for slide changes */}
      <span
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {safeCount > 0 ? `Item ${activeIndex + 1} of ${safeCount}` : 'Carousel'}
      </span>

      <CarouselContext.Provider value={api}>{children}</CarouselContext.Provider>
    </div>
  )
}

function Panel({ children }) {
  const api = useCarouselContext()
  if (typeof children === 'function') return children(api)
  return null
}

function Prev({ children, className, ariaLabel = 'Previous' }) {
  const { goPrev, isAnimating } = useCarouselContext()
  return (
    <button type="button" className={className} onClick={goPrev} aria-label={ariaLabel} disabled={isAnimating}>
      {children}
    </button>
  )
}

function Next({ children, className, ariaLabel = 'Next' }) {
  const { goNext, isAnimating } = useCarouselContext()
  return (
    <button type="button" className={className} onClick={goNext} aria-label={ariaLabel} disabled={isAnimating}>
      {children}
    </button>
  )
}

function Counter({ children, className }) {
  const { activeIndex, count } = useCarouselContext()
  if (typeof children === 'function') return <div className={className}>{children({ activeIndex, count })}</div>
  return <div className={className}>{activeIndex + 1} / {count}</div>
}

function Dots({ className, renderDot }) {
  const { count, activeIndex, goTo, isAnimating } = useCarouselContext()
  if (!renderDot) return <div className={className} />
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) =>
        renderDot(i, { active: i === activeIndex, isAnimating, onClick: () => goTo(i) })
      )}
    </div>
  )
}

const Carousel = Object.assign(Root, { Root, Panel, Prev, Next, Counter, Dots })

export default Carousel

