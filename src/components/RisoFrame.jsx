export default function RisoFrame({
  children,
  as: Tag = 'div',
  colors = ['red', 'cyan'],
  className = '',
  style,
  ...rest
}) {
  return (
    <Tag className={`riso-frame ${className}`.trim()} style={style} {...rest}>
      {colors.includes('red') && (
        <span className="riso-frame-layer riso-frame-layer-red" aria-hidden="true" />
      )}
      {colors.includes('cyan') && (
        <span className="riso-frame-layer riso-frame-layer-cyan" aria-hidden="true" />
      )}
      {children}
    </Tag>
  )
}
