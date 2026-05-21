# Award-Tier Portfolio Upgrade — Keithfbuilds_Portfolio

## Context

This plan synthesizes a Firecrawl research session into a concrete upgrade for the existing portfolio at `c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio`.

The research surveyed Awwwards, CSS Design Awards, Godly, and One Page Love (May 2026) and benchmarked three winning developer portfolios:

- **Andreas Antonsson** ([andreasantonsson.dev](https://www.andreasantonsson.dev/)) — Awwwards Developer Award ×3, FWA OTD ×5
- **Valentin Gassend** ([valentingassend.com](https://valentingassend.com/)) — Awwwards Nominee May 18, 2026
- **Code by Jesse** ([codebyjesse.com](https://www.codebyjesse.com/)) — Awwwards Nominee May 12, 2026

Three patterns explained their wins, and three signature techniques are worth stealing:

1. **Andreas's letter-spaced display titles** as a recurring identity motif (typography = brand, no logo needed).
2. **Valentin's four-section case template** — `Histoire / Pourquoi / Comment / Quoi` (Story / Why / How / What) — forces narrative AND engineering accountability.
3. **Jesse's fixed metadata strip** on every case (Client · Year · Stack · Credits) — recruiters get the facts in one glance before deciding to read prose.

The audit of the current portfolio identified **6 critical gaps**:

1. **No dedicated `/project/[slug]` routes** — every project is hardcoded in `Projects.jsx` behind anchor links. Recruiters cannot share, bookmark, or unfurl a specific case. (The single biggest gap.)
2. **No per-page OG/Twitter meta** — only global metadata in `index.html`. Shared case links don't unfurl with the case content.
3. **No custom 404** — framework default.
4. **PNG-only images, no responsive `srcset`** — no WebP/AVIF, no `<picture>` element, no width-aware delivery.
5. **GSAP 3.12.5, Framer Motion 11, Lenis 1.1.9 all installed but unused** — ~50KB of inert dependencies (per the project's own `PERFORMANCE_OPTIMIZATIONS.md`).
6. **No recurring typographic motif** that functions as an identity device. The design system is coherent (green/cream/burnt-orange + Space Grotesk + IBM Plex Mono) but lacks the one repeatable signature element.

Strengths already in place that the plan preserves: device-capability gating ([useDeviceCapabilities.js](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\hooks\useDeviceCapabilities.js)), prefers-reduced-motion handling ([usePrefersReducedMotion.js](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\hooks\usePrefersReducedMotion.js)), skip-to-content link, semantic landmarks, adaptive boot loader, custom cursor.

**Intended outcome:** a single focused session lands all 5 MVP changes below, making the portfolio competitive with the May 2026 Awwwards Developer-Award tier without rebuilding the existing design system.

---

## Handoff Prompt (paste this into a fresh Claude Code session)

> You are upgrading the React + Vite portfolio at `c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio` against an award-tier benchmark. The full plan, evidence, and file inventory live at `C:\Users\J\.claude\plans\ok-greate-create-a-witty-gem.md` — read it first, then execute the 5 MVP changes in the order listed.
>
> Stack: Vite 8, React 18, Tailwind 4. SPA today; we are adding React Router. Projects are hardcoded in [src/components/Projects.jsx](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\components\Projects.jsx); they need to move to per-project content files and each get a real URL. Three installed-but-unused libs (`gsap`, `framer-motion`, `lenis`) — we use GSAP + Lenis for the signature motif, drop Framer Motion.
>
> Goals (in priority order): (1) `/project/[slug]` routes with per-page OG meta and a custom 404, (2) reusable 4-section `CaseLayout` with metadata strip, (3) recurring letter-spaced "SignatureTitle" identity element wired through GSAP+Lenis, (4) AVIF/WebP image pipeline via `vite-imagetools`, (5) preserve all existing a11y (skip-link, reduced-motion gating, semantic landmarks) and device-capability gating.
>
> Do NOT touch: boot loader timing logic, device-capability hook, contact serverless functions, color palette, font choices. Those are working.
>
> When done, run `npm run dev`, visit `/`, `/project/aether`, `/project/does-not-exist`, and confirm each route's `<head>` carries case-specific `og:title` / `og:image` / `og:description`. Then report what changed.

---

## The 5 MVP Changes

### 1. React Router + content-file project schema

**Add deps:**
```
npm install react-router-dom react-helmet-async
```

**Create content files** (one per project — move the 5 entries currently in [src/components/Projects.jsx](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\components\Projects.jsx) lines 1–86):

```
src/content/projects/
  aether.js
  toolbox.js
  financial-workflow.js
  procurement-supply-chain.js
  doc-automation.js
  index.js          # exports the array in display order
```

Each file exports an object with this schema (extends what `PROJECTS` already has):

```js
export default {
  slug: "aether",
  title: "AETHER",
  subtitle: "Real Estate Platform",
  impact: "Dynamic Property Discovery",
  color: "#0f766e",
  year: 2025,                                   // NEW — used in metadata strip
  client: "Internal / Concept",                 // NEW
  role: "Full-stack development",               // NEW
  stack: ["Next.js", "React", "Tailwind CSS"],  // existing
  liveDemoUrl: "https://aether.keithfbuilds.dev",
  repoUrl: null,                                // NEW — optional GitHub link
  collaborators: [],                            // NEW — Jesse-style credits
  ogImage: "/og/aether.png",                    // NEW — per-case OG
  cover: "/projects/aether/cover.avif",         // NEW — case hero
  // The four narrative sections (Valentin-style):
  story: "...",      // What this is and who it's for
  why: "...",        // Motivation, constraint, the brief
  how: "...",        // Approach, decisions, tradeoffs
  what: "...",       // Concrete tech, specific optimizations
  highlights: [...]  // existing — keep as bullet list inside `what`
}
```

**Add router** — create [src/router.jsx](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\router.jsx):

```jsx
import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Project from "./pages/Project.jsx";
import NotFound from "./pages/NotFound.jsx";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/project/:slug", element: <Project /> },
  { path: "*", element: <NotFound /> },
]);
```

**Refactor [src/App.jsx](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\App.jsx):** extract the current homepage layout (boot loader → Cursor → Navbar → Hero → About → Skills → Projects → Contact → Footer) into a new `src/pages/Home.jsx`. `App.jsx` becomes a thin shell wrapping `<HelmetProvider>` + `<RouterProvider router={router} />`.

**Modify [src/components/Projects.jsx](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\components\Projects.jsx):** import from `src/content/projects/index.js` instead of the hardcoded array. Each project card becomes `<Link to={`/project/${p.slug}`}>` instead of an in-page expand. Keep the carousel/grid visual.

### 2. Per-page OG meta + custom 404

**Create [src/components/SEO.jsx](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\components\SEO.jsx):**

```jsx
import { Helmet } from "react-helmet-async";

export function SEO({ title, description, ogImage, url, type = "website" }) {
  const fullTitle = title ? `${title} — Keith F. Builds` : "Keith F. Builds";
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={ogImage} />
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
```

Mount `<SEO>` inside both `Home.jsx` and the case `CaseLayout.jsx` (next change). The current global `<meta>` tags in [index.html](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\index.html) become defaults that `<SEO>` overrides per route.

**Custom 404** — [src/pages/NotFound.jsx](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\pages\NotFound.jsx):
- Reuse Navbar + Footer.
- Centerpiece is a `<SignatureTitle text="L o s t" />` (the motif from change 3) with the cursor-trail hovering over it.
- One-line apology + `Link` back to `/`.
- Keep within the green/cream palette.

### 3. Signature typographic motif (GSAP + Lenis)

**Create [src/components/SignatureTitle.jsx](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\components\SignatureTitle.jsx):**

A `<h1>` / `<h2>` component that renders text in a hyper-letter-spaced display style (Andreas's stolen technique). On mount, GSAP staggers each letter from `letter-spacing: 0` → its final value with a slight `y` and `opacity` interpolation, gated by:

- `usePrefersReducedMotion()` returns true → render static, no animation
- `useDeviceCapabilities()` says low-end → static, no animation
- Otherwise → GSAP timeline, 0.6s, ease `power3.out`

Props: `text`, `as` (h1/h2/h3, default h2), `spacing` (default `0.35em`), `weight` (default `500`).

Use it for:
- The hero name/title (replacing the current hero headline)
- Every case study title on `/project/[slug]`
- The 404 page hero
- About section's "what I do" heading

**Wire Lenis** — initialize in `App.jsx` (gated by device caps; off for low-end and touch). Lenis gives the smoother scroll Valentin/Andreas use; GSAP's `ScrollTrigger` can hook into it for any future scroll-pinned reveals.

**Remove Framer Motion** — `npm uninstall framer-motion`. Verify no imports remain via `grep`.

### 4. Reusable CaseLayout with metadata strip

**Create [src/components/CaseLayout.jsx](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\components\CaseLayout.jsx):**

```
┌─────────────────────────────────────────┐
│ Navbar                                  │
├─────────────────────────────────────────┤
│ <SignatureTitle text={project.title}/>  │  ← motif from change 3
│ project.subtitle                         │
├─────────────────────────────────────────┤
│ Client · Year · Role · Stack            │  ← Jesse's metadata strip
│ [Live →]  [Repo →]                       │     fixed grid, always 4 cols on md+
├─────────────────────────────────────────┤
│ ## Story          project.story          │
│ ## Why            project.why            │
│ ## How            project.how            │
│ ## What           project.what +         │  ← Valentin's 4-section template
│                    highlights bullets    │
├─────────────────────────────────────────┤
│ Collaborators credit block (if any)     │
├─────────────────────────────────────────┤
│ Next project →                          │  ← Andreas's pattern
├─────────────────────────────────────────┤
│ Footer                                  │
└─────────────────────────────────────────┘
```

**Create [src/pages/Project.jsx](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\pages\Project.jsx):**

```jsx
import { useParams } from "react-router-dom";
import projects from "../content/projects/index.js";
import CaseLayout from "../components/CaseLayout.jsx";
import NotFound from "./NotFound.jsx";

export default function Project() {
  const { slug } = useParams();
  const project = projects.find(p => p.slug === slug);
  if (!project) return <NotFound />;
  return <CaseLayout project={project} />;
}
```

### 5. AVIF / WebP image pipeline

**Add dep:**
```
npm install -D vite-imagetools
```

**Update [vite.config.js](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\vite.config.js):**

```js
import { imagetools } from "vite-imagetools";
// inside defineConfig({ plugins: [..., imagetools()] })
```

**Replace** every `<img src="...png">` in [src/components/Hero.jsx](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\components\Hero.jsx) and [src/components/Projects.jsx](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\components\Projects.jsx) **case covers** with:

```jsx
import coverAvif from "/projects/aether/cover.png?format=avif&w=800;1600&as=srcset";
import coverWebp from "/projects/aether/cover.png?format=webp&w=800;1600&as=srcset";
import coverPng  from "/projects/aether/cover.png?w=1600";

<picture>
  <source type="image/avif" srcSet={coverAvif} />
  <source type="image/webp" srcSet={coverWebp} />
  <img src={coverPng} alt="..." loading="lazy" decoding="async" width="1600" height="900" />
</picture>
```

Leave the boot-loader icon and hero `art.png` as PNG with `loading="eager"` (per the existing performance optimization notes — those load before paint).

---

## Critical Files

**Modify:**
- [src/App.jsx](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\App.jsx) — becomes a router shell wrapping `HelmetProvider` + `RouterProvider`.
- [src/components/Projects.jsx](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\components\Projects.jsx) — drop the hardcoded `PROJECTS` array, import from `src/content/projects/index.js`, wrap cards in `<Link>`.
- [src/components/Hero.jsx](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\components\Hero.jsx) — swap hero headline to `<SignatureTitle>`.
- [vite.config.js](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\vite.config.js) — add `vite-imagetools` plugin.
- [index.html](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\index.html) — keep global meta as fallback; the `<SEO>` component overrides per route.
- [package.json](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\package.json) — add `react-router-dom`, `react-helmet-async`, `vite-imagetools`; remove `framer-motion`.

**Create:**
- `src/router.jsx`
- `src/pages/Home.jsx` (extracted from current `App.jsx` body)
- `src/pages/Project.jsx`
- `src/pages/NotFound.jsx`
- `src/components/SEO.jsx`
- `src/components/SignatureTitle.jsx`
- `src/components/CaseLayout.jsx`
- `src/content/projects/{aether,toolbox,financial-workflow,procurement-supply-chain,doc-automation}.js`
- `src/content/projects/index.js`
- `public/og/{aether,toolbox,...}.png` (1200×630 social cards — can be generated with a screenshot of `/project/[slug]` post-launch, placeholder for now)

**Reuse (do not modify):**
- [src/hooks/useDeviceCapabilities.js](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\hooks\useDeviceCapabilities.js) — gate GSAP + Lenis.
- [src/hooks/usePrefersReducedMotion.js](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\hooks\usePrefersReducedMotion.js) — gate `SignatureTitle` animation.
- [src/components/Cursor.jsx](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\components\Cursor.jsx) — mount in `App.jsx` so it persists across routes.
- [src/components/Navbar.jsx](c:\Users\J\Documents\KEITH\Keithfbuilds_Portfolio\src\components\Navbar.jsx) — already supports anchor links; on `/project/*` routes its anchor links should route to `/#section`. Add this fallback in one place.

---

## Verification

After implementation, run from the project root:

```
npm install
npm run dev
```

Then manually verify:

1. **Routing**
   - `/` renders the existing homepage unchanged visually.
   - `/project/aether` renders the new `CaseLayout`.
   - `/project/does-not-exist` renders the custom 404.
   - Browser back/forward works between cases.

2. **Per-page meta** — In DevTools → Elements → `<head>`:
   - On `/`, `<meta property="og:title">` reads `Keith F. Builds`.
   - On `/project/aether`, it reads `AETHER — Keith F. Builds`.
   - `og:image` resolves to `/og/aether.png` (or its placeholder).
   - Test with [opengraph.xyz](https://www.opengraph.xyz) or `curl -I` for unfurl preview.

3. **Signature motif**
   - Hero name renders with the wide letter-spacing.
   - Refresh with browser DevTools "Emulate prefers-reduced-motion: reduce" — animation skips, final letter-spacing still applied.
   - Throttle CPU 6× → device-caps hook should mark low-end and skip animation.

4. **Image pipeline** — Network tab on `/project/aether`:
   - Case cover requests `.avif` first (modern browsers), `.webp` fallback, `.png` last.
   - At least one `srcset` candidate is selected at the current viewport width.

5. **Bundle size** — `npm run build` and check `dist/assets/*.js`. Framer Motion should be gone (~30KB saved). Total JS shouldn't grow more than ~20KB net after adding Router + Helmet (offsets the Framer removal).

6. **A11y regression check** — Run Lighthouse on `/` and `/project/aether`. A11y score should be ≥95 on both (the existing skip-link, semantic landmarks, and reduced-motion handling are preserved).

7. **No console errors** on either route. Hydration warning specifically would indicate the `HelmetProvider` isn't wrapping correctly.

---

## Out of Scope (Phase 2, if asked later)

These are from the 12-item benchmark checklist but excluded from this MVP. List them here so the future Claude knows what to *not* drift into:

- Availability chip + live local-time clock on the hero
- Collaborator credit blocks per case (schema field exists but display deferred)
- Project-level performance metric callouts (e.g., "LCP 1.1s", "60fps confirmed on Pixel 6a")
- Sitemap.xml + robots.txt for SEO completeness
- Pre-generated 1200×630 OG image build step (currently expects manual placement in `public/og/`)
- Lazy-loading audit for below-fold homepage sections
- Mobile-parity animation review across every component
