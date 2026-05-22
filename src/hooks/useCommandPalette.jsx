import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const CommandPaletteContext = createContext(null)

export function CommandPaletteProvider({ children }) {
  const [open, setOpen] = useState(false)
  const [actions, setActions] = useState([])

  const openPalette = useCallback(() => setOpen(true), [])
  const closePalette = useCallback(() => setOpen(false), [])
  const togglePalette = useCallback(() => setOpen((v) => !v), [])

  const registerAction = useCallback((action) => {
    setActions((current) => {
      if (current.some((a) => a.id === action.id)) return current
      return [...current, action]
    })
  }, [])

  const removeAction = useCallback((id) => {
    setActions((current) => current.filter((a) => a.id !== id))
  }, [])

  // Global shortcut handling. Bind ⌘K / Ctrl+K, plus `/` and `?` outside inputs.
  useEffect(() => {
    const onKey = (event) => {
      const inField =
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)

      const isMeta = event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)
      const isSlash = !inField && event.key === '/'
      const isQuery = !inField && event.key === '?'

      if (isMeta || isSlash || isQuery) {
        event.preventDefault()
        setOpen(true)
        return
      }
      if (event.key === 'Escape' && open) {
        event.preventDefault()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const value = useMemo(
    () => ({
      open,
      actions,
      openPalette,
      closePalette,
      togglePalette,
      registerAction,
      removeAction,
    }),
    [open, actions, openPalette, closePalette, togglePalette, registerAction, removeAction]
  )

  return (
    <CommandPaletteContext.Provider value={value}>{children}</CommandPaletteContext.Provider>
  )
}

export default function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext)
  if (!ctx) {
    throw new Error('useCommandPalette must be used inside <CommandPaletteProvider>')
  }
  return ctx
}
