# Keith Wilhelm U. Felipe — Portfolio
**keithfbuilds.dev** · Full-Stack Web Developer

Built with Vite + React + Tailwind CSS

---

## ✨ Features

- ⚡ Vite + React 18
- 🎨 Tailwind CSS with custom design system
- 🖱️ Custom cursor (desktop)
- 📊 Animated skill bars with Intersection Observer
- ⌨️ Typing animation in hero (multi-role cycle)
- 🌐 Canvas particle network background
- 📱 Fully responsive (mobile-first)
- 🌙 Dark theme with green accent system
- 🔢 Scroll progress bar
- 📦 Expandable project cards
- 🚀 PWA-ready structure
- 🔒 Security headers ready

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| Vite 5 | Build tool |
| React 18 | UI framework |
| Tailwind CSS | Styling |
| Framer Motion | (available, optional) |
| react-icons | Icon library |
| react-intersection-observer | Scroll animations |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Install dependencies
```bash
npm install
```

### 2. Run development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

### 3. Build for production
```bash
npm run build
```
Output goes to `/dist` folder — this is what you deploy.

### 4. Preview production build locally
```bash
npm run preview
```

---

## 📁 Project Structure

```
portfolio/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       # Fixed nav with scroll detection
│   │   ├── Hero.jsx         # Animated hero with typing effect + particles
│   │   ├── About.jsx        # About me + stats + code block
│   │   ├── Skills.jsx       # Skill bars + tech tag cloud
│   │   ├── Projects.jsx     # Project cards with expand/collapse
│   │   ├── Contact.jsx      # Contact form (API submission)
│   │   └── Footer.jsx       # Footer
│   ├── App.jsx              # Root + cursor + scroll progress
│   ├── index.css            # Global styles + Tailwind
│   └── main.jsx             # Entry point
├── functions/
│   └── contact.js           # Serverless contact endpoint
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🎨 Customization

### Update personal info
Edit these files:
- `src/components/Hero.jsx` — name, tagline, social links
- `src/components/About.jsx` — bio, quick facts, stats
- `src/components/Contact.jsx` — email, location, social links
- `src/components/Footer.jsx` — footer text

### Add your photo
Place your photo in `public/` as `avatar.jpg`, then in `Hero.jsx` replace the canvas section or add an `<img>` tag.

### Add resume PDF
Place your PDF in `public/` as `Keith_Wilhelm_Felipe_Resume.pdf`.
The Resume download button in the navbar will work automatically.

### Change color accent
In `src/index.css`, update:
```css
--green: #16C172;  /* Change to any color */
```

---

## 📬 Contact Form

The contact form now submits to `/api/contact`, which redirects to the Netlify-style serverless function at `functions/contact.js`.

Local setup quick start:
- copy `.env.example` to `.env.local`
- set `CONTACT_TO_EMAIL`
- choose one provider:
   - Resend: set `RESEND_API_KEY`
   - Gmail (free): set `GMAIL_USER` + `GMAIL_APP_PASSWORD`

Set these environment variables in your hosting provider:
- `RESEND_API_KEY`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL` (optional; defaults to Resend onboarding sender)
- `CONTACT_ALLOWED_ORIGINS` (optional comma-separated allowlist; defaults to production domain + localhost)
- `UPSTASH_REDIS_REST_URL` (optional; enables distributed rate limiting and shared counters)
- `UPSTASH_REDIS_REST_TOKEN` (optional; required with Upstash URL)
- `CONTACT_SUMMARY_RETENTION_DAYS` (optional; defaults to 30)
- `ADMIN_SUMMARY_KEY` (required only if you use `/api/contact-summary`)
- `CONTACT_IP_HASH_SALT` (optional but recommended; pseudonymizes client IP references in logs and limiter keys)

Optional frontend override:
- `VITE_CONTACT_ENDPOINT` to point to another API URL.
- `VITE_CONTACT_ANALYTICS_ENDPOINT` to point to another analytics URL.

Anti-spam protections included:
- basic payload validation
- hidden honeypot field
- origin allowlist checks
- per-IP rate limiting
- server-side submission/event logging
- optional distributed limits/counters with Upstash Redis

Free Gmail option:
- Enable 2-Step Verification on your Google account.
- Create an App Password in Google Security settings.
- Put that value in `GMAIL_APP_PASSWORD`.
- Set `GMAIL_USER` to the same Gmail address.

Admin summary endpoint:
- `GET /api/contact-summary?date=YYYY-MM-DD`
- Auth via `Authorization: Bearer <ADMIN_SUMMARY_KEY>` or `X-Admin-Key` header

## 🔐 Obfuscation

Production builds enable JavaScript obfuscation by default.

Disable explicitly when needed:
```bash
ENABLE_OBFUSCATION=false npm run build
```

---

## 🌐 Deploying to keithfbuilds.dev via Porkbun

### Option A — Cloudflare Pages (Recommended, Free)

1. Push your project to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
3. Click **Create a project** → **Connect to Git**
4. Select your repo
5. Set build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
6. Deploy — you'll get a `*.pages.dev` URL

**Connect your Porkbun domain:**
1. In Cloudflare Pages → your project → **Custom Domains**
2. Add `keithfbuilds.dev`
3. In Porkbun DNS settings, add:
   - Type: `CNAME` | Name: `@` | Value: `<your-project>.pages.dev`
   - Type: `CNAME` | Name: `www` | Value: `<your-project>.pages.dev`
4. Done! SSL is automatic ✅

---

### Option B — Vercel (Also Free)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Build settings auto-detected (Vite)
4. Deploy → get `*.vercel.app` URL
5. Add custom domain `keithfbuilds.dev` in Vercel dashboard
6. In Porkbun DNS, add the CNAME Vercel gives you

---

### Option C — Porkbun Static Hosting (Direct)

1. Run `npm run build`
2. Log in to [porkbun.com](https://porkbun.com)
3. Go to your domain → **Static Hosting**
4. Upload the contents of the `dist/` folder
5. Enable SSL in Porkbun dashboard

---

Made with 💚 by Keith Wilhelm U. Felipe
