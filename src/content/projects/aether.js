// To add a case cover image:
//   1. Place a 1600x900 source at: src/assets/projects/aether/cover.{png,jpg}
//   2. Uncomment the import and the `cover` field below.
//   3. The `?cover` query triggers the vite-imagetools default directive
//      configured in vite.config.js (AVIF + WebP + raster, 800w + 1600w).
//
// import coverSrc from '../../assets/projects/aether/cover.png?cover'
// const cover = { ...coverSrc, alt: 'AETHER real-estate browser hero shot' }

const aether = {
  slug: "aether",
  title: "AETHER",
  subtitle: "Real Estate Platform",
  impact: "Dynamic Property Discovery",
  color: "#0f766e",
  year: 2025,
  client: "Internal / Concept",
  role: "Full-stack development, UI/UX, performance",
  stack: [
    "Next.js",
    "React",
    "Tailwind CSS",
    "Framer Motion",
    "Lucide React",
    "Relume UI",
  ],
  liveDemoUrl: "https://aether.keithfbuilds.dev",
  repoUrl: null,
  collaborators: [],
  ogImage: "/og/aether.png",
  cover: null, // replace with `cover` (see top-of-file note) when an image is added
  desc:
    "A modern, high-performance real estate web application for showcasing property listings, neighborhood guides, and delivering a seamless experience for homebuyers and renters.",
  story:
    "AETHER is a real-estate browsing experience built around two audiences at once: buyers who want a fast property search, and renters who want to understand the neighborhood before they commit. It pairs a high-density listing grid with editorial neighborhood guides.",
  why:
    "Most listing sites are slow and bury context. The goal here was a property browser that feels native on first paint and treats neighborhood content as a first-class object, not a footer link.",
  how:
    "Next.js with SSR/SSG splits the load: listing pages are statically generated for SEO, detail pages render server-side for fresh availability, and amenities/neighborhood views are dynamic routes. Tailwind plus Framer Motion handles the visual layer without a heavy CSS-in-JS runtime.",
  what:
    "The stack is Next.js on the front, Tailwind CSS for styling, Framer Motion for entrance and exit animations, and Relume UI patterns adapted for the property grid. The highlights below cover the specific engineering choices that drove the result.",
  highlights: [
    "Server-Side Rendering (SSR) and Static Site Generation (SSG) for optimal performance and SEO",
    "Dynamic property routing with dedicated detail pages and amenity exploration",
    "Comprehensive neighborhood guides with location insights",
    "Fully responsive mobile-first design with fluid animations",
  ],
};

export default aether;
