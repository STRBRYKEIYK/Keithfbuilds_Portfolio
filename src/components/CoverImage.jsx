/**
 * Renders a responsive <picture> element with AVIF + WebP + raster fallback.
 *
 * Expects a `cover` object shaped like what `vite-imagetools` returns for
 * `?as=picture` (with `format=avif;webp;png` and `w=800;1600`):
 *
 *   {
 *     sources: {
 *       avif: 'url-800.avif 800w, url-1600.avif 1600w',
 *       webp: 'url-800.webp 800w, url-1600.webp 1600w',
 *     },
 *     img: { src: 'url-1600.png', w: 1600, h: 900 },
 *     alt: 'Optional human-written alt text',
 *   }
 *
 * Returns null if `cover` is null/undefined, so callers can render it
 * unconditionally inside JSX without adding extra ternaries.
 */
export default function CoverImage({
  cover,
  eager = false,
  sizes = '(min-width: 880px) 880px, 100vw',
  className = 'case-cover-img',
}) {
  if (!cover || !cover.img) return null

  const { sources, img, alt } = cover

  return (
    <picture>
      {sources?.avif ? (
        <source type="image/avif" srcSet={sources.avif} sizes={sizes} />
      ) : null}
      {sources?.webp ? (
        <source type="image/webp" srcSet={sources.webp} sizes={sizes} />
      ) : null}
      <img
        src={img.src}
        alt={alt || ''}
        width={img.w}
        height={img.h}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchpriority={eager ? 'high' : 'auto'}
        className={className}
      />
    </picture>
  )
}
