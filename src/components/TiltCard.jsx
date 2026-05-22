import useTilt from '../hooks/useTilt'

export default function TiltCard({
  children,
  as: Tag = 'div',
  maxDeg = 8,
  className = '',
  ...rest
}) {
  const ref = useTilt({ maxDeg })
  return (
    <Tag ref={ref} className={`tilt-card ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  )
}
