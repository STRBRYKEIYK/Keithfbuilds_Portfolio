import useMagnetic from '../hooks/useMagnetic'

export default function MagneticButton({
  as: Tag = 'button',
  children,
  className = '',
  radius = 140,
  strength = 0.35,
  ...rest
}) {
  const ref = useMagnetic({ radius, strength })
  return (
    <Tag ref={ref} className={`magnetic ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  )
}
