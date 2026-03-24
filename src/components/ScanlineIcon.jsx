// components/ScanlineIcon.jsx
import React from 'react'

export default function ScanlineIcon({ size = 80 }) {
  return (
    <div style={{
      width: size,
      height: size,
      position: 'relative',
      display: 'inline-block',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 0 24px #16C17255',
      background: '#050A07',
    }}>
      <img
        src="/favicon.svg"
        alt="icon"
        width={size}
        height={size}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          filter: 'drop-shadow(0 0 16px #16C17288)',
          borderRadius: 16,
        }}
      />
      {/* Scanline overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, rgba(22, 193, 114, 0.08) 0px, transparent 2px, transparent 4px)',
        pointerEvents: 'none',
        borderRadius: 16,
        zIndex: 2,
        animation: 'scanlinesLogo 1.2s linear infinite'
      }} />
      {/* Neon glow overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 16,
        boxShadow: '0 0 32px 8px #16C17255',
        pointerEvents: 'none',
        zIndex: 1,
      }} />
      <style>{`
        @keyframes scanlinesLogo {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}