import { FiPlay } from 'react-icons/fi'

/**
 * Lightweight "video coming soon" poster.
 * Uses project accent color for tactile borders/glow.
 */
export default function ProjectVideoPlaceholder({
  color,
  posterLabel = 'Video coming soon',
  badgeText = 'SHOWCASE',
}) {
  if (!color) return null

  const hex = color

  return (
    <div
      className="proj-video-placeholder"
      role="note"
      aria-label={posterLabel}
      style={{
        border: `1px solid ${hex}33`,
        background: `${hex}08`,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform 220ms var(--ease-out), box-shadow 220ms var(--ease-out), border-color 220ms var(--ease-out)',
      }}
    >
      <div
        className="proj-video-frame"
        style={{
          width: '100%',
          aspectRatio: '16 / 9',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 3px, ${hex}06 3px, ${hex}06 4px)`,
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 25% 20%, ${hex}1A 0%, transparent 60%)`,
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            width: 56,
            height: 56,
            borderRadius: 999,
            border: `1px solid ${hex}55`,
            color: hex,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 24px ${hex}22`,
            transform: 'translateY(-2px)',
          }}
        >
          <FiPlay />
        </div>

        <div
          style={{
            position: 'absolute',
            left: 14,
            top: 14,
            padding: '6px 10px',
            borderRadius: 999,
            border: `1px solid ${hex}55`,
            color: hex,
            background: `${hex}0A`,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span aria-hidden="true">●</span>
          {badgeText}
        </div>
      </div>

      <div
        style={{
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.06em',
            color: hex,
            textTransform: 'uppercase',
          }}
        >
          {posterLabel}
        </div>
        <div
          aria-hidden="true"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.1em',
            color: 'var(--text-dim)',
          }}
        >
          coming soon
        </div>
      </div>

      <style>{`
        .proj-video-placeholder:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 0 44px ${hex}22;
          border-color: ${hex}66;
        }
        @media (prefers-reduced-motion: reduce) {
          .proj-video-placeholder { transition: none; }
          .proj-video-placeholder:hover { transform: none; }
        }
      `}</style>
    </div>
  )
}

