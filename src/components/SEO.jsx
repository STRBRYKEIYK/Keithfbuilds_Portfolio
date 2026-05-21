import { Helmet } from 'react-helmet-async'

const SITE_URL = 'https://keithfbuilds.dev'
const SITE_NAME = 'Keith Wilhelm U. Felipe'
const DEFAULT_TITLE = 'Keith Wilhelm U. Felipe — Full-Stack Developer'
const DEFAULT_DESCRIPTION =
  'Building enterprise-grade web systems with React & TypeScript. Available for remote opportunities.'
const DEFAULT_IMAGE = '/images/ICON.png'

const toAbsolute = (value, fallback) => {
  const target = value || fallback
  if (!target) return SITE_URL
  if (/^https?:\/\//i.test(target)) return target
  if (target.startsWith('/')) return `${SITE_URL}${target}`
  return `${SITE_URL}/${target}`
}

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  path = '/',
  type = 'website',
  noindex = false,
}) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE
  const url = toAbsolute(path, '/')
  const ogImage = toAbsolute(image, DEFAULT_IMAGE)

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      <link rel="canonical" href={url} />
    </Helmet>
  )
}
