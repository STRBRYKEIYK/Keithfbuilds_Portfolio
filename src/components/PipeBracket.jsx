/**
 * Wraps text with the recurring |…| motif. Pipes are mono-styled
 * pseudo-elements; the inner content inherits the parent's font,
 * so this works inside any headline or paragraph.
 */
export default function PipeBracket({ children, className = '' }) {
  return (
    <span className={`pipe-bracket ${className}`.trim()}>{children}</span>
  )
}
