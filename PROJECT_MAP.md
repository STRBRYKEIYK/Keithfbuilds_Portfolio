# Project Map — Keithfbuilds_Portfolio

A React 18 + Vite + Tailwind 4 portfolio. SPA with a router (`/`, `/project/:slug`, `*` → 404). Custom design system in `src/index.css` (Risograph palette, no Tailwind utility colors). Netlify-style serverless functions for the contact form, mirrored locally by a Vite dev middleware.

---

## Quick orientation

- **Entry point**: `src/main.jsx` → `src/App.jsx` → router (`src/router.jsx`)
- **Routes**: `/` (Home), `/project/:slug` (case study), `*` (NotFound)
- **Design tokens**: `:root` block at the top of `src/index.css`
- **Project content**: one file per case study in `src/content/projects/`
- **Server-side**: `functions/*.js` are Netlify-compatible; the Vite dev bridge in `vite.config.js` proxies `/api/*` to them during `npm run dev`

---

## Full tree

```
Keithfbuilds_Portfolio/
├── .cursorrules                  # Cursor editor rules
├── .env.example                  # Sample env vars (contact endpoints, etc.)
├── .gitignore
├── .vscode/                      # Editor settings
├── .claude/                      # Claude Code session state
│
├── README.md                     # Public-facing repo overview
├── AGENTS.md                     # Notes for AI agents working on this repo
├── PERFORMANCE_OPTIMIZATIONS.md  # Past perf work notes
├── PROJECT_MAP.md                # THIS FILE
├── ok-greate-create-a-witty-gem.md     # Award-tier upgrade plan
├── Top-3-Award-winning-Portfolio.md    # Award-portfolio research
│
├── package.json                  # Deps + npm scripts
├── package-lock.json
├── index.html                    # Vite HTML entry — meta, fonts, root div
├── vite.config.js                # Vite + plugin config + dev API bridge
├── tailwind.config.js            # Tailwind theme tokens (riso palette)
├── postcss.config.js             # PostCSS pipeline (tailwind + autoprefixer)
│
├── public/                       # Static assets, served from /
│   ├── favicon.svg
│   ├── KeithFbuilds.dev - Resume.pdf
│   ├── _redirects                # Netlify SPA fallback
│   ├── cloudflare-insights.js
│   ├── images/
│   │   ├── ICON.png              # OG / boot-loader icon
│   │   └── art.png               # Hero artwork (legacy / reference)
│   └── videos/.gitkeep
│
├── functions/                    # Netlify Functions (serverless)
│   ├── contact.js                # POST /api/contact — sends email via nodemailer
│   ├── contact-analytics.js      # POST /api/contact-analytics — beacon endpoint
│   └── contact-summary.js        # GET /api/contact-summary — admin/debug view
│
├── scripts/
│   └── fetch_cloudflare_insights.js  # Pulls CF analytics on demand
│
├── dist/                         # Vite production build output (gitignored)
├── node_modules/                 # Installed deps (gitignored)
│
└── src/
    ├── main.jsx                  # ReactDOM.createRoot — mounts <App />
    ├── App.jsx                   # Boot loader, HelmetProvider, CommandPaletteProvider, Cursor, RouterProvider
    ├── router.jsx                # createBrowserRouter — layout + child routes
    ├── index.css                 # All styles (1700+ lines): tokens, components, riso utilities
    │
    ├── pages/                    # Route-level components
    │   ├── RootLayout.jsx        # Layout route: mounts HalftoneBackground, CursorTrail,
    │   │                         #   SceneTransition, CommandPalette, EasterEggHost + <Outlet />
    │   ├── Home.jsx              # Homepage: Navbar + Hero/About/Skills/Projects/Contact + Footer
    │   ├── Project.jsx           # Case study: reads :slug, finds project, renders CaseLayout
    │   └── NotFound.jsx          # 404 page with SignatureTitle "Lost signal"
    │
    ├── components/               # All UI components
    │   ├── Navbar.jsx            # Sticky nav + scroll-spy active state + ⌘K trigger
    │   ├── Hero.jsx              # Hero section: meta chips, stacked wordmark, CTAs, ticker
    │   ├── About.jsx             # About section: copy + timeline (TiltCard)
    │   ├── Skills.jsx            # Skills section: marquee chips + spec-grid (TiltCard)
    │   ├── Projects.jsx          # Projects section: draggable rail + tilt preview + magnetic CTAs
    │   ├── Contact.jsx           # Contact form + contact list + magnetic submit
    │   ├── Footer.jsx            # Compact footer with AmbientAudioToggle
    │   │
    │   ├── CaseLayout.jsx        # Reusable /project/[slug] layout (Story/Why/How/What)
    │   ├── CoverImage.jsx        # AVIF/WebP <picture> wrapper for case covers
    │   ├── SEO.jsx               # react-helmet-async <Helmet> wrapper for per-route meta
    │   │
    │   ├── SignatureTitle.jsx    # Letter-spaced display title with riso misregistration ghost
    │   ├── PipeBracket.jsx       # |word| motif wrapper
    │   ├── LiveTimeChip.jsx      # Live PHT time chip (ticks every minute)
    │   │
    │   ├── RisoFrame.jsx         # Misregistration frame (red + cyan offset rectangles)
    │   ├── HalftoneBackground.jsx # SVG halftone-dot bg, glow follows cursor
    │   ├── TiltCard.jsx          # 3D perspective tilt on pointer-move (uses useTilt)
    │   ├── MagneticButton.jsx    # Button that leans toward the cursor (uses useMagnetic)
    │   ├── Cursor.jsx            # Custom dot + ring cursor (gated by device caps)
    │   ├── CursorTrail.jsx       # 10 lagging dots behind the cursor (riso colors)
    │   ├── CommandPalette.jsx    # ⌘K palette — sections, cases, copy email, résumé
    │   ├── SceneTransition.jsx   # Riso shutter overlay on route change
    │   ├── EasterEggHost.jsx     # Wires useKonamiCode → .riso-chaos class + secret action
    │   ├── AmbientAudioToggle.jsx # Footer toggle for ambient audio (HEAD-probes mp3)
    │   │
    │   ├── Projects/
    │   │   └── ProjectVideoPlaceholder.jsx  # Fallback when a project has no cover image
    │   └── ui/
    │       └── Carousel/
    │           └── Carousel.jsx  # Generic carousel primitive (utility, not currently used by Home)
    │
    ├── hooks/                    # Custom React hooks
    │   ├── useBootLoader.js          # Startup-loader timing + progress + visible lines
    │   ├── useDeviceCapabilities.js  # Mac/low-end/tablet/slow-net detection + gating flags
    │   ├── usePrefersReducedMotion.js # Wraps prefers-reduced-motion + device-cap downgrade
    │   ├── useRevealOnScroll.js      # IntersectionObserver → adds `.visible` to [data-reveal]
    │   ├── useScrollSpy.js           # Tracks active section by vertical reference line
    │   ├── useLenis.js               # Mounts Lenis smooth scroll (gated)
    │   ├── useSmoothLenis.js         # Alt Lenis hook (toggleable via enabled flag)
    │   │
    │   ├── useTilt.js                # Pointer → --tilt-x / --tilt-y CSS vars
    │   ├── useMagnetic.js            # Pointer-proximity GSAP quickTo translate
    │   ├── useDraggableRail.js       # Mouse-drag horizontal rail with GSAP momentum
    │   ├── useCommandPalette.jsx     # Context provider + open-state hook (⌘K / Ctrl+K / /)
    │   │
    │   └── hero/                     # Hero-only experimental hooks
    │       ├── useDotGrid.js         # Canvas dot grid that glows under the cursor
    │       ├── useKonamiCode.js      # Konami sequence detector (consumed by EasterEggHost)
    │       ├── useScramble.js        # 800ms char-scramble text reveal
    │       └── useTypingLoop.js      # Cycling typing/delete loop with blinking caret
    │
    ├── content/
    │   └── projects/             # One file per case study + an index
    │       ├── index.js          # Exports the ordered array of all projects
    │       ├── aether.js
    │       ├── toolbox.js
    │       ├── financial-workflow.js
    │       ├── procurement-supply-chain.js
    │       └── doc-automation.js
    │
    └── utils/
        └── performanceMonitoring.js  # Lightweight perf instrumentation helpers
```

---

## Routing & data flow

```
            ┌──────────────────────────────────────────┐
            │  src/main.jsx                            │
            │  ReactDOM.createRoot → <App />           │
            └──────────────────────────────────────────┘
                              │
                              ▼
            ┌──────────────────────────────────────────┐
            │  src/App.jsx                             │
            │  ├─ Boot loader (gated by device caps)   │
            │  └─ <HelmetProvider>                     │
            │      └─ <CommandPaletteProvider>         │
            │          ├─ <Cursor />                   │
            │          ├─ skip-link                    │
            │          └─ <RouterProvider router={…}/> │
            └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────────────┐
        │  src/router.jsx  (createBrowserRouter)           │
        │  path "/"  →  <RootLayout> with children:        │
        │     index           → <Home />                   │
        │     project/:slug   → <Project />                │
        │     *               → <NotFound />               │
        └──────────────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────────────┐
        │  src/pages/RootLayout.jsx                        │
        │  Mounts once, survives route changes:            │
        │    • <HalftoneBackground />                      │
        │    • <CursorTrail />                             │
        │    • <SceneTransition />                         │
        │    • <CommandPalette />                          │
        │    • <EasterEggHost />                           │
        │  Then renders <Outlet /> for the matched page    │
        └──────────────────────────────────────────────────┘
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
         ┌─────────┐   ┌─────────────┐   ┌─────────────┐
         │  Home   │   │   Project   │   │  NotFound   │
         └─────────┘   └─────────────┘   └─────────────┘
              │               │
              │               └─ Reads :slug, looks it up in
              │                   src/content/projects/index.js,
              │                   passes to <CaseLayout project={…}/>.
              │
              ▼
   ┌─────────────────────────────────────────────────────────────┐
   │  Home composes the long-scroll page:                        │
   │    <Navbar/> → Hero → About → Skills → Projects → Contact   │
   │    → <Footer/>                                              │
   │  Each section keeps its semantic id (hero/about/.../contact)│
   │  so Navbar scroll-spy + hash deep-links keep working.       │
   └─────────────────────────────────────────────────────────────┘
```

---

## Root-level files explained

| File | Purpose |
|---|---|
| `package.json` | Scripts (`dev` / `build` / `preview`), dependencies (React, Vite, GSAP, Lenis, cmdk, react-router-dom, react-helmet-async, react-icons). |
| `index.html` | Vite entry HTML. Loads Google Fonts (Syne, DM Sans, JetBrains Mono), defines `<meta>` defaults, `<div id="root">`. |
| `vite.config.js` | Vite config + `@vitejs/plugin-react` + `vite-imagetools` (AVIF/WebP pipeline) + a custom `netlifyFunctionDevBridge` middleware that maps `/api/*` to `functions/*.js` during dev so the contact form works locally. |
| `tailwind.config.js` | Theme extension: riso palette, font families, riso box-shadows. (Most styling lives in `index.css`, not Tailwind utilities.) |
| `postcss.config.js` | Tailwind v4 + autoprefixer pipeline. |
| `.env.example` | Documents environment variables (e.g. `VITE_CONTACT_ENDPOINT`, SMTP creds for `functions/contact.js`). |
| `README.md` | Public repo overview / how to run. |
| `AGENTS.md` | Notes for AI agents (do/don't list when working on the repo). |
| `PERFORMANCE_OPTIMIZATIONS.md` | Past performance work record. |
| `ok-greate-create-a-witty-gem.md` | Original award-tier upgrade plan. |
| `Top-3-Award-winning-Portfolio.md` | Research notes on Awwwards 2026 winners that drove the design direction. |

---

## `src/` deep dive

### Entry layer
- **`main.jsx`** — ReactDOM root. Imports `App` and `index.css`.
- **`App.jsx`** — Wraps the app in `HelmetProvider` + `CommandPaletteProvider`. Mounts the boot loader (with device-capability-aware duration), the custom `Cursor`, the skip-to-content link, and the `RouterProvider`.
- **`router.jsx`** — `createBrowserRouter` with a single layout route at `/` whose children are `<Home>`, `<Project>`, and the `*` `<NotFound>` fallback.
- **`index.css`** — Single source of truth for styling. Sections (top to bottom):
  1. `@tailwind` directives
  2. `:root` design tokens (riso palette, motion easings, layout vars)
  3. Resets + body background (halftone fallback + riso radial glows)
  4. Skip link + boot loader styles
  5. Navbar, panel layout, kicker/title/copy primitives
  6. Per-section styles (hero, about, skills, projects, contact)
  7. Case layout + 404 page
  8. Footer
  9. Media queries (mobile collapses, high-contrast, reduced-motion)
  10. Keyframes (loaderFloat, loaderProgress, meterGrow, livePulse, tickerMove)
  11. **Riso redesign utilities**: misregistration, riso frames, halftone bg, tilt, magnetic, draggable rail, command palette, cursor trail, ambient audio, scene shutter, konami chaos, hero asym layout, skills marquee.

### Pages (`src/pages/`)

| File | Role |
|---|---|
| `RootLayout.jsx` | The layout route's element. Mounts route-persistent overlays (cursor trail, command palette, easter-egg host, halftone bg, scene shutter) once and renders `<Outlet />`. Scrolls to top on route change unless a hash is present. |
| `Home.jsx` | Homepage. Owns the scroll-spy state (`useScrollSpy` pattern, manually wired), the smooth-scroll handler shared with the Navbar, and a hash-deep-link effect for `/#about` etc. Mounts Navbar + 5 sections + Footer. |
| `Project.jsx` | Case-study page. Reads `:slug` from `useParams`, finds the project in `src/content/projects/index.js`, and renders `<CaseLayout project={…} nextProject={…}/>`. Falls back to `<NotFound />` for unknown slugs. |
| `NotFound.jsx` | 404. Reuses Navbar + Footer. Centerpiece is a `<SignatureTitle text="Lost signal" />`. |

### Components (`src/components/`)

Grouped by role:

**Layout & SEO**
- `Navbar.jsx` — Sticky top nav with mobile menu, focus trap, scroll-spy `active` class, and a visible ⌘K trigger button.
- `Footer.jsx` — Compact footer with the `AmbientAudioToggle`, email, GitHub, and back-to-start links.
- `SEO.jsx` — `react-helmet-async` wrapper. Accepts `title`, `description`, `ogImage`, `url`, `noindex`.
- `CaseLayout.jsx` — Reusable case page: hero (with tilted, riso-framed cover), 4-column metadata strip (Client / Year / Role / Stack), 4 narrative sections (Story / Why / How / What), credits, next-project link.

**Sections (Home only)**
- `Hero.jsx` — Meta chips, 3-line stacked wordmark with riso misregistration, three-nouns row, asymmetric grid of tagline + dl cards (in a `RisoFrame`), magnetic CTAs, ticker.
- `About.jsx` — Two-column: editorial copy + chip list on the left, sticky timeline of `TiltCard`s on the right.
- `Skills.jsx` — Copy + scrolling marquee of riso-color skill chips + 4 `TiltCard` specialization cards.
- `Projects.jsx` — Draggable horizontal rail of project rows (with prev/next chevrons, momentum via `useDraggableRail`) and an inline preview pane: tilted, riso-framed cover + stack chips + magnetic action buttons.
- `Contact.jsx` — Two-column: copy + contact list on the left, contact form (with a honeypot field and a `MagneticButton` submit) on the right. Posts to `/api/contact`, sends an analytics beacon to `/api/contact-analytics`.

**Identity / motif components**
- `SignatureTitle.jsx` — The hero motif. Wraps text in per-letter spans, animates `letter-spacing` and per-letter `y/opacity` with GSAP. Optional misregistration ghost layer (`aria-hidden`) in riso-red or cyan.
- `PipeBracket.jsx` — Tiny wrapper that surrounds children with `|…|` styled brackets.
- `LiveTimeChip.jsx` — Renders the current Antipolo time, aligned to top-of-minute, ticks every 60 s (no per-second update).
- `CoverImage.jsx` — `<picture>` with AVIF + WebP `srcset` sources (powered by `vite-imagetools`).

**Interactive primitives**
- `RisoFrame.jsx` — Wraps any child in three layers: offset red rectangle (-6, -6), offset cyan rectangle (+6, +6), and the child itself.
- `HalftoneBackground.jsx` — Fixed SVG `<pattern>` of dots. A rAF loop updates `--halftone-mx/--halftone-my` CSS vars on `pointermove` so the gradient glow follows the cursor.
- `TiltCard.jsx` — Renders any tag with `transform: perspective(900px) rotateX(--tilt-x) rotateY(--tilt-y)`. Hook-driven; flat on touch / reduced-motion.
- `MagneticButton.jsx` — Renders any tag (button, a, Link); inside `radius` of the cursor, GSAP `quickTo` translates it.
- `CommandPalette.jsx` — `cmdk`-powered palette: jump to section, open case studies, copy email, download résumé, open GitHub. Listens for `⌘K` / `Ctrl+K` / `/` / `?` outside input fields.
- `Cursor.jsx` — Custom 2-layer cursor (dot + ring). Mounted at root, gated by `useDeviceCapabilities().canUseCustomCursor`.
- `CursorTrail.jsx` — 10 lagging dots behind the cursor, alternating riso-red / riso-cyan.
- `SceneTransition.jsx` — Two diagonal-translate panels (red + cyan) that sweep in/out on `useLocation()` change.
- `EasterEggHost.jsx` — Subscribes to `useKonamiCode`. On completion: adds the `.riso-chaos` class for 6 s and registers a hidden "View credits" command-palette action.
- `AmbientAudioToggle.jsx` — Probes `/audio/ambient.mp3` with `fetch HEAD`. If present, the footer toggle starts/pauses an `<audio>` element with persisted localStorage state. If absent, the toggle renders disabled.

**Misc**
- `Projects/ProjectVideoPlaceholder.jsx` — Tinted placeholder when a project has no cover.
- `ui/Carousel/Carousel.jsx` — Generic carousel utility (not used by Home, available for case pages or future work).

### Hooks (`src/hooks/`)

**Core (used by many components)**
| Hook | Returns | Purpose |
|---|---|---|
| `useDeviceCapabilities` | `{ isLowEnd, isMac, isTablet, isSlowConnection, canUseCustomCursor, canUseDotGrid, canUseLenis, shouldReduceEffects }` | Gates every motion / cursor primitive. |
| `usePrefersReducedMotion` | `boolean` | True when OS prefers reduced motion OR device flags say to downgrade. |
| `useBootLoader` | `{ progress, leaving, visibleLines }` | Drives the startup overlay. Respects reduced motion. |
| `useRevealOnScroll` | `ref` | Adds `.visible` to descendants with `[data-reveal]` as the section enters the viewport (with stagger + delay). |
| `useScrollSpy` | `activeId` | Reports the active section id by checking which one's top has crossed a reference line. |
| `useLenis` | `void` | Initializes a Lenis smooth-scroll instance (gated). |
| `useSmoothLenis` | `void` | Alt Lenis hook with an explicit `enabled` flag. |

**Interactive primitives**
| Hook | Returns | Purpose |
|---|---|---|
| `useTilt` | `ref` | Updates `--tilt-x / --tilt-y` on pointer-move within the element. |
| `useMagnetic` | `ref` | GSAP `quickTo` translates the element toward the cursor within a radius. |
| `useDraggableRail` | `{ ref, scrollBy }` | Pointer-drag horizontal scroll with GSAP momentum release; keeps native overflow + chevron support. |
| `useCommandPalette` | `{ open, actions, openPalette, closePalette, togglePalette, registerAction, removeAction }` | Context-based command palette state. Listens for global shortcuts. |

**Hero-only (`src/hooks/hero/`)**
| Hook | Purpose |
|---|---|
| `useDotGrid` | Canvas dot grid that glows under the parent's mouse position. |
| `useKonamiCode` | Detects a configurable key sequence; fires `onComplete` once per match. |
| `useScramble` | 800 ms character-scramble animation toward a final string. |
| `useTypingLoop` | Types and deletes through a list of strings on a loop. |

### Content (`src/content/projects/`)

Each project file exports an object with this schema:

```js
export default {
  slug: 'aether',
  title: 'AETHER',
  subtitle: 'Real Estate Platform',
  impact: 'Dynamic Property Discovery',
  color: '#0f766e',
  year: 2025,
  client: 'Internal / Concept',
  role: 'Full-stack development',
  stack: ['Next.js', 'React', 'Tailwind CSS'],
  liveDemoUrl: 'https://aether.keithfbuilds.dev',
  repoUrl: null,
  collaborators: [],
  ogImage: '/og/aether.png',
  cover: '/projects/aether/cover.avif',
  desc: '…short paragraph…',
  story: '…',
  why:   '…',
  how:   '…',
  what:  '…',
  highlights: ['…', '…'],
}
```

`index.js` re-exports the ordered array consumed by `Projects.jsx`, `CommandPalette.jsx`, and `Project.jsx`.

### Utils (`src/utils/`)
- `performanceMonitoring.js` — Lightweight perf-marker helpers (e.g. `mark`, `measure`).

---

## Server-side (`functions/`)

Netlify Functions, mirrored by the Vite dev bridge:

| Function | Route | Purpose |
|---|---|---|
| `contact.js` | `POST /api/contact` | Receives the contact form, validates honeypot, sends email via `nodemailer`. Returns JSON `{ ok, error? }`. |
| `contact-analytics.js` | `POST /api/contact-analytics` | Beacon endpoint — receives a `sendBeacon` payload after a successful submit for analytics. |
| `contact-summary.js` | `GET /api/contact-summary` | Admin/debug summary of recent submissions. |

In `vite.config.js`, `netlifyFunctionDevBridge()` maps the same routes to these files during `npm run dev` so the form works without `netlify dev`.

---

## Build & run

```
npm install           # installs deps
npm run dev           # Vite dev server (Cloudflare-style insights stub + API bridge)
npm run build         # production build → dist/
npm run preview       # preview the built bundle
```

Environment variables (see `.env.example`):
- `VITE_CONTACT_ENDPOINT` — override the contact POST URL (default `/api/contact`).
- `VITE_CONTACT_ANALYTICS_ENDPOINT` — analytics beacon URL.
- Server-side SMTP creds for `functions/contact.js`.

---

## Section IDs (do not rename)

The Home page scroll-spy and hash deep-links depend on these literal `<section id>` values:

```
hero · about · skills · projects · contact
```

Defined in `src/pages/Home.jsx` as `SECTION_IDS` and used by `Navbar` (active link) and the deep-link `useEffect` (e.g. `/#about`). Rename one and the nav highlight + deep-link will silently break.

---

## Where to make common changes

| Goal | File(s) |
|---|---|
| Change the palette | `src/index.css` `:root` block (line ~5); mirror in `tailwind.config.js` if also using Tailwind utilities. |
| Add a project | New file in `src/content/projects/` + add to `src/content/projects/index.js` array. |
| Adjust the Konami easter egg payload | `src/components/EasterEggHost.jsx`. |
| Add a command-palette action | Either extend `builtIns` in `src/components/CommandPalette.jsx` or call `registerAction(...)` from any component via `useCommandPalette()`. |
| Tweak boot-loader duration | `getBootTime()` in `src/App.jsx`. |
| Change scroll behavior | `src/hooks/useLenis.js` (or remove the `useLenis()` call in `src/pages/Home.jsx`). |
| Wire a new env var | Add to `.env.example`, read via `import.meta.env.VITE_*`. |

---

## Conventions

- Components are `.jsx`, hooks are `.js` unless they contain JSX (then `.jsx` — e.g. `useCommandPalette.jsx`).
- All custom styling lives in `src/index.css` using design tokens. Avoid Tailwind utility colors so the riso palette stays the single source of truth.
- Section IDs (`hero / about / skills / projects / contact`) are load-bearing — do not rename without updating `Home.jsx`'s `SECTION_IDS`.
- Motion primitives must gate with `useDeviceCapabilities` + `usePrefersReducedMotion` before activating.
- The custom cursor is gated on touch, low-end devices, and Mac (Mac users tend to prefer the OS cursor).
