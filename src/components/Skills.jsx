import { useEffect, useRef, useState } from 'react'
import { FaStore, FaTruckMoving, FaMoneyCheckAlt, FaFileAlt } from 'react-icons/fa'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { RiTerminalBoxLine } from 'react-icons/ri'

const SKILLS_PRIMARY = [
  { name: 'React 18', level: 95, cat: 'frontend' },
  { name: 'TypeScript', level: 88, cat: 'frontend' },
  { name: 'Tailwind CSS', level: 92, cat: 'frontend' },
  { name: 'WebSocket/Socket.IO', level: 85, cat: 'backend' },
  { name: 'REST APIs', level: 90, cat: 'backend' },
  { name: 'Node.js', level: 78, cat: 'backend' },
  { name: 'PWA / Offline-First', level: 82, cat: 'architecture' },
  { name: 'Git / GitHub', level: 90, cat: 'tools' },
]

const TECH_TAGS = [
  'React', 'TypeScript', 'Tailwind CSS', 'WebSocket', 'Socket.IO', 'PWA',
  'REST APIs', 'Node.js', 'Radix UI', 'Zod', 'Axios', 'Context API',
  'IndexedDB', 'LocalStorage', 'CSV Export', 'XLSX Export', 'PDF Gen',
  'Vite', 'Git', 'GitHub', 'Framer Motion', 'GSAP',
]

const SPECIALIZATIONS = [
  {
    title: 'POS & Inventory Systems',
    desc: 'Full-stack point-of-sale platforms with barcode scanning, 1,000+ SKU support, real-time stock validation, and offline-first PWA capabilities.',
    tags: ['React', 'WebSocket', 'PWA', 'IndexedDB'],
    icon: FaStore,
    id: '01',
    stat: '1,000+ SKUs',
    statLabel: 'Supported',
    accentColor: '#16C172',
  },
  {
    title: 'Procurement & Supply Chain',
    desc: 'Enterprise procurement modules with QR/barcode integration, multi-step PO wizards, supplier management, and duplicate detection algorithms.',
    tags: ['React', 'QR/Barcode', 'Workflow', 'CSV/Excel'],
    icon: FaTruckMoving,
    id: '02',
    stat: 'End-to-End',
    statLabel: 'Supply Chain',
    accentColor: '#0EADD4',
  },
  {
    title: 'Financial Management Systems',
    desc: 'Sophisticated payroll and financial platforms with multi-level approval workflows, dynamic dashboards, voucher management, and audit trails.',
    tags: ['State Machine', 'Dashboards', 'Excel Export', 'TypeScript'],
    icon: FaMoneyCheckAlt,
    id: '03',
    stat: 'Multi-Level',
    statLabel: 'Approvals',
    accentColor: '#F59E0B',
  },
  {
    title: 'Ingestion & Document Automation',
    desc: 'Backend service for automated document ingestion, OCR, and data extraction. Handles PDFs, images, spreadsheets, and Word docs with multi-provider OCR and secure API endpoints.',
    tags: ['Express', 'TypeScript', 'Python', 'OCR', 'API', 'Data Automation'],
    icon: FaFileAlt,
    id: '04',
    stat: 'Multi-Provider',
    statLabel: 'OCR Engine',
    accentColor: '#3B82F6',
  },
]

export default function Skills() {
  const sectionRef = useRef(null)
  const barsRef = useRef([])
  const [activeSpec, setActiveSpec] = useState(0)
  const [direction, setDirection] = useState(1)
  const [animating, setAnimating] = useState(false)

  const goTo = (idx) => {
    if (animating) return
    setDirection(idx > activeSpec ? 1 : -1)
    setAnimating(true)
    setTimeout(() => {
      setActiveSpec(idx)
      setAnimating(false)
    }, 280)
  }

  const prev = () => goTo((activeSpec - 1 + SPECIALIZATIONS.length) % SPECIALIZATIONS.length)
  const next = () => goTo((activeSpec + 1) % SPECIALIZATIONS.length)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('[data-reveal]').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 80)
            })
            barsRef.current.forEach((bar, i) => {
              if (bar) {
                setTimeout(() => {
                  bar.style.width = bar.dataset.level + '%'
                }, 400 + i * 80)
              }
            })
          }
        })
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const spec = SPECIALIZATIONS[activeSpec]
  const SpecIcon = spec.icon

  return (
    <>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes specFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanPulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes cornerBlink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0; }
        }
        .skills {
          padding: 140px 0;
          background: var(--bg-2);
          overflow: hidden;
        }
        .skills-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
        }
        .skills-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 80px;
        }
        .skills-section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #16C172;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .skills-section-label::before {
          content: '';
          display: block;
          width: 24px;
          height: 1px;
          background: #16C172;
        }
        .skills-heading {
          font-size: clamp(36px, 4vw, 56px);
          color: #E8F5F0;
        }
        .skills-subtext {
          font-size: 15px;
          color: #4A6B57;
          max-width: 320px;
          text-align: right;
          font-family: 'JetBrains Mono', monospace;
          line-height: 1.6;
        }

        /* Ticker */
        .skills-ticker {
          overflow: hidden;
          padding: 24px 0;
          margin-bottom: 80px;
          border-top: 1px solid rgba(22,193,114,0.08);
          border-bottom: 1px solid rgba(22,193,114,0.08);
          position: relative;
        }
        .skills-ticker::before, .skills-ticker::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 80px;
          z-index: 2;
          pointer-events: none;
        }
        .skills-ticker::before { left: 0; background: linear-gradient(to right, var(--bg-2), transparent); }
        .skills-ticker::after { right: 0; background: linear-gradient(to left, var(--bg-2), transparent); }
        .ticker-track {
          display: flex;
          gap: 16px;
          animation: ticker 28s linear infinite;
          width: max-content;
        }
        .ticker-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.08em;
          color: #4A6B57;
          white-space: nowrap;
          padding: 8px 16px;
          border: 1px solid rgba(22,193,114,0.1);
          border-radius: 3px;
          transition: color 0.2s, border-color 0.2s;
        }
        .ticker-tag:hover { color: #16C172; border-color: rgba(22,193,114,0.3); }

        /* Skill bars */
        .skills-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px 60px;
          margin-bottom: 100px;
        }
        .skill-bar-item {
          padding: 0 0 20px;
          border-bottom: 1px solid rgba(22,193,114,0.06);
        }
        .skill-bar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .skill-bar-name {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #E8F5F0;
        }
        .skill-bar-level {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #16C172;
        }
        .skill-bar-track {
          height: 3px;
          background: rgba(22,193,114,0.1);
          border-radius: 2px;
          overflow: hidden;
        }
        .skill-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #0D8A50, #16C172);
          border-radius: 2px;
          width: 0;
          transition: width 1.2s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 0 8px rgba(22,193,114,0.4);
        }

        /* ── Specializations ── */
        .spec-section-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .spec-heading {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
          color: #4A6B57;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .spec-heading svg { color: #16C172; }

        /* Scanline nav buttons */
        .scanline-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border: 1px solid rgba(22,193,114,0.35);
          border-radius: 4px;
          background: rgba(22,193,114,0.04);
          color: #16C172;
          cursor: pointer;
          overflow: hidden;
          transition: border-color 0.2s, background 0.2s, color 0.2s, box-shadow 0.2s;
        }
        .scanline-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(22,193,114,0.04) 3px,
            rgba(22,193,114,0.04) 4px
          );
          pointer-events: none;
          z-index: 1;
        }
        .scanline-btn svg { position: relative; z-index: 2; font-size: 18px; }
        .scanline-btn:hover {
          border-color: #16C172;
          background: rgba(22,193,114,0.12);
          box-shadow: 0 0 16px rgba(22,193,114,0.2), inset 0 0 16px rgba(22,193,114,0.05);
          color: #fff;
        }
        .scanline-btn:active { transform: scale(0.95); }

        .spec-nav-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .spec-counter {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #4A6B57;
          min-width: 52px;
          text-align: center;
          letter-spacing: 0.05em;
        }
        .spec-counter span { color: #16C172; }

        /* Main spec card */
        .spec-showcase {
          position: relative;
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 0;
          border: 1px solid rgba(22,193,114,0.12);
          border-radius: 12px;
          overflow: hidden;
          min-height: 320px;
          background: var(--bg-card);
        }
        .spec-showcase-left {
          padding: 40px 32px;
          border-right: 1px solid rgba(22,193,114,0.08);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .spec-showcase-left::after {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(22,193,114,0.018) 3px,
            rgba(22,193,114,0.018) 4px
          );
          pointer-events: none;
        }
        .spec-left-id {
          font-family: 'JetBrains Mono', monospace;
          font-size: 72px;
          font-weight: 700;
          line-height: 1;
          opacity: 0.06;
          position: absolute;
          bottom: 24px;
          left: 24px;
          color: #16C172;
          letter-spacing: -0.04em;
        }
        .spec-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: 10px;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          margin-bottom: 24px;
          position: relative;
          z-index: 1;
          transition: box-shadow 0.3s;
        }
        .spec-stat-block { position: relative; z-index: 1; }
        .spec-stat-number {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #E8F5F0;
          line-height: 1;
          margin-bottom: 4px;
        }
        .spec-stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #4A6B57;
        }

        /* Dot indicators */
        .spec-dots {
          display: flex;
          gap: 6px;
          position: relative;
          z-index: 1;
        }
        .spec-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(22,193,114,0.2);
          border: 1px solid rgba(22,193,114,0.3);
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .spec-dot.active {
          background: #16C172;
          transform: scale(1.3);
        }

        .spec-showcase-right {
          padding: 40px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .spec-card-content {
          animation: specFadeIn 0.32s ease both;
        }
        .spec-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #E8F5F0;
          margin-bottom: 16px;
          line-height: 1.2;
        }
        .spec-card-desc {
          font-size: 14.5px;
          color: #7A9E8C;
          line-height: 1.8;
          font-weight: 300;
          margin-bottom: 28px;
          max-width: 520px;
        }
        .spec-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .spec-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.06em;
          color: #16C172;
          background: rgba(22,193,114,0.08);
          padding: 5px 12px;
          border-radius: 3px;
          border: 1px solid rgba(22,193,114,0.15);
          transition: background 0.2s;
        }
        .spec-tag:hover { background: rgba(22,193,114,0.15); }

        /* Corner decoration */
        .spec-corner {
          position: absolute;
          top: 14px;
          right: 14px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px;
          color: rgba(22,193,114,0.25);
          letter-spacing: 0.1em;
          animation: cornerBlink 4s infinite;
        }

        @media (max-width: 900px) {
          .spec-showcase { grid-template-columns: 1fr; }
          .spec-showcase-left {
            flex-direction: row;
            align-items: center;
            padding: 24px 28px;
            border-right: none;
            border-bottom: 1px solid rgba(22,193,114,0.08);
          }
          .spec-showcase-left::after { display: none; }
          .spec-left-id { display: none; }
          .spec-icon-wrap { margin-bottom: 0; margin-right: 16px; }
          .skills-grid { grid-template-columns: 1fr; gap: 16px; }
          .skills-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .skills-subtext { text-align: left; }
        }
        @media (max-width: 768px) {
          .skills { padding: 100px 0; }
          .skills-inner { padding: 0 24px; }
          .spec-showcase-right { padding: 28px 24px; }
        }
      `}</style>

      <section id="skills" className="skills" ref={sectionRef}>
        <div className="skills-inner">
          <div className="skills-header">
            <div>
              <div className="skills-section-label reveal" data-reveal>Technical Arsenal</div>
              <h2 className="skills-heading reveal" data-reveal>
                What I Build<br />With
              </h2>
            </div>
            <p className="skills-subtext reveal" data-reveal>
              Full-stack capabilities with deep React/TypeScript expertise across enterprise domains
            </p>
          </div>

          {/* Ticker */}
          <div className="skills-ticker">
            <div className="ticker-track">
              {[...TECH_TAGS, ...TECH_TAGS].map((tag, i) => (
                <span key={i} className="ticker-tag">{tag}</span>
              ))}
            </div>
          </div>

          {/* Skill Bars */}
          <div className="skills-grid">
            {SKILLS_PRIMARY.map((skill, i) => (
              <div key={skill.name} className="skill-bar-item reveal" data-reveal>
                <div className="skill-bar-header">
                  <span className="skill-bar-name">{skill.name}</span>
                  <span className="skill-bar-level">{skill.level}%</span>
                </div>
                <div className="skill-bar-track">
                  <div
                    className="skill-bar-fill"
                    ref={el => barsRef.current[i] = el}
                    data-level={skill.level}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ── Specializations ── */}
          <div className="spec-section-top reveal" data-reveal>
            <p className="spec-heading">
              <RiTerminalBoxLine size={14} />
              // Specialization Areas
            </p>
            <div className="spec-nav-group">
              <button className="scanline-btn" onClick={prev} aria-label="Previous">
                <FiChevronLeft />
              </button>
              <span className="spec-counter">
                <span>{String(activeSpec + 1).padStart(2, '0')}</span>
                &nbsp;/&nbsp;
                {String(SPECIALIZATIONS.length).padStart(2, '0')}
              </span>
              <button className="scanline-btn" onClick={next} aria-label="Next">
                <FiChevronRight />
              </button>
            </div>
          </div>

          {/* Main Showcase Card */}
          <div className="spec-showcase reveal" data-reveal>
            <div
              className="spec-showcase-left"
              style={{ background: `${spec.accentColor}08` }}
            >
              <div>
                <div
                  className="spec-icon-wrap"
                  style={{
                    color: spec.accentColor,
                    borderColor: `${spec.accentColor}33`,
                    background: `${spec.accentColor}10`,
                    boxShadow: `0 0 20px ${spec.accentColor}22`,
                  }}
                >
                  <SpecIcon />
                </div>
                <div className="spec-stat-block">
                  <div className="spec-stat-number" style={{ color: spec.accentColor }}>
                    {spec.stat}
                  </div>
                  <div className="spec-stat-label">{spec.statLabel}</div>
                </div>
              </div>
              <div>
                <div className="spec-dots" style={{ marginTop: 32 }}>
                  {SPECIALIZATIONS.map((_, i) => (
                    <button
                      key={i}
                      className={`spec-dot ${i === activeSpec ? 'active' : ''}`}
                      onClick={() => goTo(i)}
                      aria-label={`Go to specialization ${i + 1}`}
                      style={i === activeSpec ? { background: spec.accentColor, borderColor: spec.accentColor } : {}}
                    />
                  ))}
                </div>
              </div>
              <div className="spec-left-id">{spec.id}</div>
            </div>

            <div className="spec-showcase-right">
              <div key={activeSpec} className="spec-card-content">
                <div className="spec-card-title">{spec.title}</div>
                <p className="spec-card-desc">{spec.desc}</p>
                <div className="spec-tags">
                  {spec.tags.map(t => (
                    <span
                      key={t}
                      className="spec-tag"
                      style={{ color: spec.accentColor, background: `${spec.accentColor}10`, borderColor: `${spec.accentColor}25` }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="spec-corner">SYS_ACTIVE</div>
          </div>
        </div>
      </section>
    </>
  )
}