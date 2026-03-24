# Keith Wilhelm U. Felipe — Portfolio
**keithfbuilds.dev** · Full-Stack Web Developer

Built with Vite + React + TypeScript + Tailwind CSS

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
│   │   ├── Navbar.tsx       # Fixed nav with scroll detection
│   │   ├── Hero.tsx         # Animated hero with typing effect + particles
│   │   ├── About.tsx        # About me + stats + code block
│   │   ├── Skills.tsx       # Skill bars + tech tag cloud
│   │   ├── Projects.tsx     # Project cards with expand/collapse
│   │   ├── Contact.tsx      # Contact form (mailto fallback)
│   │   └── Footer.tsx       # Footer
│   ├── App.tsx              # Root + cursor + scroll progress
│   ├── index.css            # Global styles + Tailwind
│   └── main.tsx             # Entry point
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
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
6. Deploy!
7. You'll get a `*.pages.dev` URL

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

## 🎨 Customization

### Update personal info
Edit these files:
- `src/components/Hero.tsx` — name, tagline, social links
- `src/components/About.tsx` — bio, quick facts, stats
- `src/components/Contact.tsx` — email, location, social links
- `src/components/Footer.tsx` — footer text

### Add your photo
Place your photo in `public/` as `avatar.jpg`, then in `Hero.tsx` replace the canvas section or add an `<img>` tag.

### Add resume PDF
Place your PDF in `public/` as `Keith_Wilhelm_Felipe_Resume.pdf`
The Resume download button in the navbar will work automatically.

### Change color accent
In `src/index.css`, update:
```css
--emerald: #10b981;  /* Change to any color */
```

---

## ✨ Features

- ⚡ Vite + React 18 + TypeScript
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

## 📬 Contact Form

The contact form uses `mailto:` as a fallback (no backend needed).
For a real form submission, integrate:
- [Formspree](https://formspree.io) — free, easy
- [EmailJS](https://emailjs.com) — client-side email
- Replace the `handleSubmit` in `Contact.tsx`

**Formspree example:**
```tsx
const response = await fetch('https://formspree.io/f/YOUR_ID', {
  method: 'POST',
  body: JSON.stringify(form),
  headers: { 'Content-Type': 'application/json' },
})
```

---

## 🛠️ Tech Stack

| Tool | Purpose |
|------|---------|
| Vite 5 | Build tool |
| React 18 | UI framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | (available, optional) |
| react-icons | Icon library |
| react-intersection-observer | Scroll animations |

---

Made with 💚 by Keith Wilhelm U. Felipe
