import { Command } from 'cmdk'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCommandPalette from '../hooks/useCommandPalette'
import projects from '../content/projects/index.js'

const SECTIONS = [
  { id: 'hero', label: 'Hero' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]

const EMAIL = 'keithfelipe024@gmail.com'

export default function CommandPalette() {
  const { open, closePalette, actions } = useCommandPalette()
  const navigate = useNavigate()
  const [value, setValue] = useState('')

  useEffect(() => {
    if (!open) setValue('')
  }, [open])

  const goToSection = (id) => {
    closePalette()
    if (window.location.pathname !== '/') {
      navigate(`/#${id}`)
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const builtIns = useMemo(
    () => [
      ...SECTIONS.map((section) => ({
        id: `section-${section.id}`,
        group: 'Sections',
        glyph: section.label[0],
        label: `Jump to ${section.label}`,
        run: () => goToSection(section.id),
      })),
      ...projects.map((project) => ({
        id: `project-${project.slug}`,
        group: 'Case studies',
        glyph: '/',
        label: `Open ${project.title}`,
        hint: project.subtitle,
        run: () => {
          closePalette()
          navigate(`/project/${project.slug}`)
        },
      })),
      {
        id: 'copy-email',
        group: 'Actions',
        glyph: '@',
        label: 'Copy email address',
        hint: EMAIL,
        run: async () => {
          try {
            await navigator.clipboard.writeText(EMAIL)
          } catch (_) {
            // no-op
          }
          closePalette()
        },
      },
      {
        id: 'download-resume',
        group: 'Actions',
        glyph: '↓',
        label: 'Download résumé',
        run: () => {
          window.open('/KeithFbuilds.dev - Resume.pdf', '_blank', 'noopener')
          closePalette()
        },
      },
      {
        id: 'open-github',
        group: 'Actions',
        glyph: '↗',
        label: 'Open GitHub profile',
        run: () => {
          window.open('https://github.com/STRBRYKEIYK', '_blank', 'noopener,noreferrer')
          closePalette()
        },
      },
    ],
    [navigate, closePalette]
  )

  const allActions = useMemo(() => [...builtIns, ...actions], [builtIns, actions])

  if (!open) return null

  const onOverlayClick = (event) => {
    if (event.target === event.currentTarget) closePalette()
  }

  return (
    <div
      className="cmdk-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={onOverlayClick}
    >
      <Command className="cmdk-shell" label="Command palette" value={value} onValueChange={setValue}>
        <Command.Input
          className="cmdk-input"
          placeholder="Search sections, cases, actions…"
          autoFocus
        />
        <Command.List className="cmdk-list">
          <Command.Empty className="cmdk-empty">No matches. Try a different word.</Command.Empty>
          {groupBy(allActions).map(([group, items]) => (
            <Command.Group key={group} heading={group} className="cmdk-group">
              <div className="cmdk-group-heading">{group}</div>
              {items.map((action) => (
                <Command.Item
                  key={action.id}
                  value={`${action.label} ${action.hint || ''}`}
                  className="cmdk-item"
                  onSelect={() => action.run()}
                >
                  <span className="cmdk-item-glyph" aria-hidden="true">
                    {action.glyph || '·'}
                  </span>
                  <span>
                    {action.label}
                    {action.hint && (
                      <span style={{ color: 'var(--ink-muted)', marginLeft: '0.5rem', fontSize: '0.78rem' }}>
                        {action.hint}
                      </span>
                    )}
                  </span>
                  {action.kbd && <span className="cmdk-item-kbd">{action.kbd}</span>}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
      </Command>
    </div>
  )
}

function groupBy(actions) {
  const map = new Map()
  for (const action of actions) {
    const key = action.group || 'Actions'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(action)
  }
  return Array.from(map.entries())
}
