<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>README — keithfbuilds.dev</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,600;12..96,800&display=swap');

  :root {
    --bg: #0a0c0e;
    --surface: #0f1214;
    --border: #1c2026;
    --green: #10b981;
    --green-dim: #0d9466;
    --green-glow: rgba(16,185,129,0.12);
    --text: #c8d0d8;
    --text-dim: #5a6472;
    --text-bright: #e8edf2;
    --mono: 'DM Mono', monospace;
    --display: 'Bricolage Grotesque', sans-serif;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--mono);
    font-size: 13.5px;
    line-height: 1.75;
    min-height: 100vh;
  }

  /* Scanline overlay */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.03) 2px,
      rgba(0,0,0,0.03) 4px
    );
    pointer-events: none;
    z-index: 100;
  }

  .wrapper {
    max-width: 820px;
    margin: 0 auto;
    padding: 60px 32px 100px;
  }

  /* ── HEADER ── */
  .header {
    border-bottom: 1px solid var(--border);
    padding-bottom: 40px;
    margin-bottom: 56px;
    position: relative;
  }

  .header::before {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 80px;
    height: 1px;
    background: var(--green);
    box-shadow: 0 0 12px var(--green);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--green);
    border: 1px solid rgba(16,185,129,0.25);
    padding: 4px 10px;
    border-radius: 2px;
    margin-bottom: 20px;
  }

  .badge::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 8px var(--green);
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .header h1 {
    font-family: var(--display);
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 800;
    color: var(--text-bright);
    letter-spacing: -0.02em;
    line-height: 1.1;
    margin-bottom: 10px;
  }

  .header h1 span { color: var(--green); }

  .header .subtitle {
    color: var(--text-dim);
    font-size: 13px;
    letter-spacing: 0.04em;
  }

  .header .subtitle a {
    color: var(--green-dim);
    text-decoration: none;
    border-bottom: 1px solid rgba(16,185,129,0.3);
  }

  /* ── SECTION ── */
  section { margin-bottom: 52px; }

  .section-label {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-dim);
    margin-bottom: 20px;
  }

  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .section-label .num {
    color: var(--green);
    font-weight: 500;
  }

  h2 {
    font-family: var(--display);
    font-size: 22px;
    font-weight: 600;
    color: var(--text-bright);
    margin-bottom: 18px;
    letter-spacing: -0.01em;
  }

  /* ── QUICK START ── */
  .steps {
    display: grid;
    gap: 2px;
  }

  .step {
    display: grid;
    grid-template-columns: 28px 1fr;
    gap: 16px;
    align-items: start;
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 16px 20px;
    transition: border-color 0.2s;
  }

  .step:first-child { border-radius: 4px 4px 0 0; }
  .step:last-child { border-radius: 0 0 4px 4px; }

  .step:hover {
    border-color: rgba(16,185,129,0.2);
    background: rgba(16,185,129,0.03);
  }

  .step-num {
    font-size: 11px;
    color: var(--green);
    font-weight: 500;
    padding-top: 2px;
    letter-spacing: 0.05em;
  }

  .step-content p {
    color: var(--text-bright);
    font-family: var(--display);
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  /* ── CODE ── */
  .cmd {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(0,0,0,0.4);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 5px 12px;
    font-family: var(--mono);
    font-size: 12.5px;
    color: var(--green);
  }

  .cmd::before {
    content: '$';
    color: var(--text-dim);
  }

  .code-block {
    background: #080a0c;
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
  }

  .code-block-header {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 10px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dot { width: 10px; height: 10px; border-radius: 50%; }
  .dot-r { background: #ff5f57; }
  .dot-y { background: #febc2e; }
  .dot-g { background: #28c840; }

  .code-block-title {
    margin-left: 6px;
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: 0.05em;
  }

  .code-block pre {
    padding: 20px;
    overflow-x: auto;
    font-size: 12px;
    line-height: 1.8;
    color: var(--text);
  }

  .code-block pre .tree-dir { color: #60a5fa; }
  .code-block pre .tree-file { color: var(--text); }
  .code-block pre .tree-comment { color: var(--text-dim); }
  .code-block pre .tree-root { color: var(--green); font-weight: 500; }

  /* ── DEPLOY CARDS ── */
  .deploy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
  }

  .deploy-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    transition: border-color 0.2s, transform 0.2s;
  }

  .deploy-card:hover {
    border-color: rgba(16,185,129,0.3);
    transform: translateY(-2px);
  }

  .deploy-card.recommended::after {
    content: 'RECOMMENDED';
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 9px;
    letter-spacing: 0.1em;
    color: var(--green);
    border: 1px solid rgba(16,185,129,0.3);
    padding: 2px 6px;
    border-radius: 2px;
  }

  .deploy-card h3 {
    font-family: var(--display);
    font-size: 15px;
    font-weight: 600;
    color: var(--text-bright);
    margin-bottom: 6px;
  }

  .deploy-card p {
    font-size: 12px;
    color: var(--text-dim);
    margin-bottom: 14px;
  }

  .deploy-steps {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .deploy-steps li {
    font-size: 12px;
    color: var(--text);
    display: flex;
    gap: 8px;
  }

  .deploy-steps li::before {
    content: '→';
    color: var(--green);
    flex-shrink: 0;
  }

  /* ── FEATURES ── */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 8px;
  }

  .feature {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 12px 14px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 12.5px;
    transition: border-color 0.2s;
  }

  .feature:hover {
    border-color: rgba(16,185,129,0.25);
  }

  .feature-icon {
    font-size: 14px;
    line-height: 1.5;
    flex-shrink: 0;
  }

  /* ── TECH TABLE ── */
  .tech-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12.5px;
  }

  .tech-table th {
    text-align: left;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-dim);
    padding: 8px 16px;
    border-bottom: 1px solid var(--border);
    font-weight: 500;
  }

  .tech-table td {
    padding: 10px 16px;
    border-bottom: 1px solid rgba(28,32,38,0.6);
    color: var(--text);
    vertical-align: middle;
  }

  .tech-table tr:last-child td { border-bottom: none; }

  .tech-table tr:hover td {
    background: rgba(16,185,129,0.03);
  }

  .tech-name {
    color: var(--text-bright);
    font-weight: 500;
  }

  .tech-tag {
    display: inline-block;
    background: var(--green-glow);
    color: var(--green);
    border: 1px solid rgba(16,185,129,0.2);
    padding: 2px 8px;
    border-radius: 2px;
    font-size: 11px;
    letter-spacing: 0.04em;
  }

  /* ── CONTACT SECTION ── */
  .contact-block {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 24px;
  }

  .contact-block p {
    color: var(--text-dim);
    margin-bottom: 16px;
    font-size: 13px;
  }

  .provider-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .provider {
    background: rgba(0,0,0,0.3);
    border: 1px solid var(--border);
    padding: 6px 12px;
    border-radius: 3px;
    font-size: 12px;
    color: var(--text-bright);
  }

  /* ── FOOTER ── */
  .footer {
    margin-top: 72px;
    padding-top: 28px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  .footer .made-by {
    font-size: 12px;
    color: var(--text-dim);
  }

  .footer .made-by span {
    color: var(--green);
  }

  .footer .stack-hint {
    font-size: 11px;
    color: var(--text-dim);
    letter-spacing: 0.06em;
  }
</style>
</head>
<body>
<div class="wrapper">

  <!-- HEADER -->
  <header class="header">
    <div class="badge">Portfolio · README</div>
    <h1>keithf<span>builds</span>.dev</h1>
    <p class="subtitle">Keith Wilhelm U. Felipe — Full-Stack Web Developer &nbsp;·&nbsp;
      <a href="https://keithfbuilds.dev">keithfbuilds.dev</a>
    </p>
  </header>

  <!-- QUICK START -->
  <section>
    <div class="section-label"><span class="num">01</span> Quick Start</div>
    <div class="steps">
      <div class="step">
        <span class="step-num">01</span>
        <div class="step-content">
          <p>Prerequisites</p>
          <span class="cmd">node -v &nbsp;# requires 18+</span>
        </div>
      </div>
      <div class="step">
        <span class="step-num">02</span>
        <div class="step-content">
          <p>Install dependencies</p>
          <span class="cmd">npm install</span>
        </div>
      </div>
      <div class="step">
        <span class="step-num">03</span>
        <div class="step-content">
          <p>Start dev server &nbsp;<span style="color:var(--text-dim);font-size:11px">→ localhost:5173</span></p>
          <span class="cmd">npm run dev</span>
        </div>
      </div>
      <div class="step">
        <span class="step-num">04</span>
        <div class="step-content">
          <p>Build for production &nbsp;<span style="color:var(--text-dim);font-size:11px">→ /dist</span></p>
          <span class="cmd">npm run build</span>
        </div>
      </div>
      <div class="step">
        <span class="step-num">05</span>
        <div class="step-content">
          <p>Preview build locally</p>
          <span class="cmd">npm run preview</span>
        </div>
      </div>
    </div>
  </section>

  <!-- PROJECT STRUCTURE -->
  <section>
    <div class="section-label"><span class="num">02</span> Project Structure</div>
    <div class="code-block">
      <div class="code-block-header">
        <div class="dot dot-r"></div>
        <div class="dot dot-y"></div>
        <div class="dot dot-g"></div>
        <span class="code-block-title">portfolio/</span>
      </div>
      <pre><span class="tree-root">portfolio/</span>
├── <span class="tree-dir">public/</span>
│   └── <span class="tree-file">favicon.svg</span>
├── <span class="tree-dir">src/</span>
│   ├── <span class="tree-dir">components/</span>
│   │   ├── <span class="tree-file">Navbar.tsx</span>       <span class="tree-comment"># Fixed nav with scroll detection</span>
│   │   ├── <span class="tree-file">Hero.tsx</span>         <span class="tree-comment"># Typing effect + particle canvas</span>
│   │   ├── <span class="tree-file">About.tsx</span>        <span class="tree-comment"># Bio, stats, code block</span>
│   │   ├── <span class="tree-file">Skills.tsx</span>       <span class="tree-comment"># Animated skill bars + tag cloud</span>
│   │   ├── <span class="tree-file">Projects.tsx</span>     <span class="tree-comment"># Expandable project cards</span>
│   │   ├── <span class="tree-file">Contact.tsx</span>      <span class="tree-comment"># Contact form (mailto fallback)</span>
│   │   └── <span class="tree-file">Footer.tsx</span>
│   ├── <span class="tree-file">App.tsx</span>              <span class="tree-comment"># Root + cursor + scroll progress</span>
│   ├── <span class="tree-file">index.css</span>            <span class="tree-comment"># Global styles + Tailwind</span>
│   └── <span class="tree-file">main.tsx</span>             <span class="tree-comment"># Entry point</span>
├── <span class="tree-file">index.html</span>
├── <span class="tree-file">vite.config.ts</span>
├── <span class="tree-file">tailwind.config.js</span>
├── <span class="tree-file">tsconfig.json</span>
└── <span class="tree-file">package.json</span></pre>
    </div>
  </section>

  <!-- DEPLOY -->
  <section>
    <div class="section-label"><span class="num">03</span> Deploy to keithfbuilds.dev</div>
    <div class="deploy-grid">
      <div class="deploy-card recommended">
        <h3>Cloudflare Pages</h3>
        <p>Free · Edge CDN · Auto SSL</p>
        <ul class="deploy-steps">
          <li>Push repo to GitHub</li>
          <li>Connect to Cloudflare Pages</li>
          <li>Build: <code style="color:var(--green)">npm run build</code>, output: <code style="color:var(--green)">dist</code></li>
          <li>Add custom domain in Pages dashboard</li>
          <li>Set Porkbun CNAME <code style="color:var(--green)">@</code> → <code style="color:var(--green)">*.pages.dev</code></li>
        </ul>
      </div>
      <div class="deploy-card">
        <h3>Vercel</h3>
        <p>Free · Auto-detected Vite config</p>
        <ul class="deploy-steps">
          <li>Push repo to GitHub</li>
          <li>Import project on vercel.com</li>
          <li>Add <code style="color:var(--green)">keithfbuilds.dev</code> as custom domain</li>
          <li>Add Vercel CNAME to Porkbun DNS</li>
        </ul>
      </div>
      <div class="deploy-card">
        <h3>Porkbun Hosting</h3>
        <p>Direct · No CI/CD required</p>
        <ul class="deploy-steps">
          <li>Run <code style="color:var(--green)">npm run build</code> locally</li>
          <li>Upload <code style="color:var(--green)">dist/</code> via Static Hosting</li>
          <li>Enable SSL in Porkbun dashboard</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- CUSTOMIZATION -->
  <section>
    <div class="section-label"><span class="num">04</span> Customization</div>
    <div class="steps">
      <div class="step">
        <span class="step-num" style="font-size:16px">✍</span>
        <div class="step-content">
          <p>Personal info</p>
          <span style="color:var(--text-dim);font-size:12px">Edit <code style="color:var(--green)">Hero.tsx</code>, <code style="color:var(--green)">About.tsx</code>, <code style="color:var(--green)">Contact.tsx</code>, <code style="color:var(--green)">Footer.tsx</code></span>
        </div>
      </div>
      <div class="step">
        <span class="step-num" style="font-size:16px">🖼</span>
        <div class="step-content">
          <p>Profile photo</p>
          <span style="color:var(--text-dim);font-size:12px">Place <code style="color:var(--green)">public/avatar.jpg</code> and reference it in Hero.tsx</span>
        </div>
      </div>
      <div class="step">
        <span class="step-num" style="font-size:16px">📄</span>
        <div class="step-content">
          <p>Resume PDF</p>
          <span style="color:var(--text-dim);font-size:12px">Drop <code style="color:var(--green)">public/Keith_Wilhelm_Felipe_Resume.pdf</code> — navbar button works automatically</span>
        </div>
      </div>
      <div class="step">
        <span class="step-num" style="font-size:16px">🎨</span>
        <div class="step-content">
          <p>Accent color</p>
          <span style="color:var(--text-dim);font-size:12px">Update <code style="color:var(--green)">--emerald: #10b981</code> in <code style="color:var(--green)">src/index.css</code></span>
        </div>
      </div>
    </div>
  </section>

  <!-- FEATURES -->
  <section>
    <div class="section-label"><span class="num">05</span> Features</div>
    <div class="features-grid">
      <div class="feature"><span class="feature-icon">⚡</span>Vite + React 18 + TypeScript</div>
      <div class="feature"><span class="feature-icon">🎨</span>Tailwind CSS design system</div>
      <div class="feature"><span class="feature-icon">🖱</span>Custom cursor (desktop)</div>
      <div class="feature"><span class="feature-icon">📊</span>Animated skill bars</div>
      <div class="feature"><span class="feature-icon">⌨</span>Typing animation (multi-role)</div>
      <div class="feature"><span class="feature-icon">🌐</span>Canvas particle background</div>
      <div class="feature"><span class="feature-icon">📱</span>Mobile-first responsive</div>
      <div class="feature"><span class="feature-icon">🌙</span>Dark theme + green accents</div>
      <div class="feature"><span class="feature-icon">🔢</span>Scroll progress bar</div>
      <div class="feature"><span class="feature-icon">📦</span>Expandable project cards</div>
      <div class="feature"><span class="feature-icon">🚀</span>PWA-ready structure</div>
      <div class="feature"><span class="feature-icon">🔒</span>Security headers ready</div>
    </div>
  </section>

  <!-- CONTACT FORM -->
  <section>
    <div class="section-label"><span class="num">06</span> Contact Form</div>
    <div class="contact-block">
      <p>Default uses <code style="color:var(--green)">mailto:</code> — no backend needed. Swap <code style="color:var(--green)">handleSubmit</code> in <code style="color:var(--green)">Contact.tsx</code> for a real provider:</p>
      <div class="provider-list">
        <span class="provider">Formspree</span>
        <span class="provider">EmailJS</span>
        <span class="provider">Resend</span>
      </div>
      <div class="code-block">
        <div class="code-block-header">
          <div class="dot dot-r"></div><div class="dot dot-y"></div><div class="dot dot-g"></div>
          <span class="code-block-title">Formspree example</span>
        </div>
        <pre style="padding:16px 20px;font-size:12px;line-height:1.8;color:var(--text)"><span style="color:var(--text-dim)">// Contact.tsx — replace handleSubmit</span>
<span style="color:#60a5fa">const</span> response = <span style="color:#60a5fa">await</span> fetch(<span style="color:#fbbf24">'https://formspree.io/f/YOUR_ID'</span>, {
  method: <span style="color:#fbbf24">'POST'</span>,
  body: JSON.stringify(form),
  headers: { <span style="color:#fbbf24">'Content-Type'</span>: <span style="color:#fbbf24">'application/json'</span> },
})</pre>
      </div>
    </div>
  </section>

  <!-- TECH STACK -->
  <section>
    <div class="section-label"><span class="num">07</span> Tech Stack</div>
    <div class="code-block">
      <table class="tech-table">
        <thead>
          <tr>
            <th>Tool</th>
            <th>Purpose</th>
            <th>Tag</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="tech-name">Vite 5</td><td>Build tool</td><td><span class="tech-tag">core</span></td></tr>
          <tr><td class="tech-name">React 18</td><td>UI framework</td><td><span class="tech-tag">core</span></td></tr>
          <tr><td class="tech-name">TypeScript</td><td>Type safety</td><td><span class="tech-tag">core</span></td></tr>
          <tr><td class="tech-name">Tailwind CSS</td><td>Styling</td><td><span class="tech-tag">core</span></td></tr>
          <tr><td class="tech-name">Framer Motion</td><td>Animations</td><td><span class="tech-tag" style="color:#a78bfa;border-color:rgba(167,139,250,0.3);background:rgba(167,139,250,0.08)">optional</span></td></tr>
          <tr><td class="tech-name">react-icons</td><td>Icon library</td><td><span class="tech-tag">core</span></td></tr>
          <tr><td class="tech-name">react-intersection-observer</td><td>Scroll animations</td><td><span class="tech-tag">core</span></td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <span class="made-by">Made with <span>♥</span> by Keith Wilhelm U. Felipe</span>
    <span class="stack-hint">VITE · REACT · TYPESCRIPT · TAILWIND</span>
  </footer>

</div>
</body>
</html>
