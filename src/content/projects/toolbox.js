const toolbox = {
  slug: "toolbox",
  title: "Toolbox",
  subtitle: "Inventory & POS System",
  impact: "1,000+ SKUs Managed",
  color: "#1f9a67",
  year: 2025,
  client: "Internal operations team",
  role: "Full-stack development, real-time architecture, offline-first PWA",
  stack: ["React 18", "TypeScript", "WebSocket", "PWA", "Tailwind"],
  liveDemoUrl: "https://toolbox.keithfbuilds.dev",
  repoUrl: null,
  collaborators: [],
  ogImage: "/og/toolbox.png",
  // To add a cover: drop 1600x900 source at src/assets/projects/toolbox/cover.png
  // then `import cover from '../../assets/projects/toolbox/cover.png?cover'`
  cover: null,
  desc:
    "A modern point-of-sale and inventory management system for toolbox operations with reliable real-time synchronization.",
  story:
    "Toolbox replaces a manual stock ledger with a PWA that staff can use on any device on the counter. It is a point-of-sale plus an inventory system plus a sync layer, designed so that two cashiers ringing up at the same moment never produce a stock conflict.",
  why:
    "Floor staff needed barcode scanning, reliable offline behaviour during network drops, and a stock count that stayed consistent across concurrent sessions. Off-the-shelf POS software either lacked the offline guarantee or forced a hardware lock-in.",
  how:
    "The client is a React 18 + TypeScript PWA with full offline capability via IndexedDB; transactions queue locally and replay when the socket reconnects. Multi-session stock changes are reconciled through a WebSocket broadcast layer, and the cart state survives reloads via session persistence.",
  what:
    "Real-time validation against the canonical stock list, barcode scanning straight from a USB or camera input, advanced cart with recovery on crash. The highlights below list the specific features and engineering choices that made it usable on day one.",
  highlights: [
    "Barcode scanning plus real-time inventory validation",
    "PWA with full offline functionality via IndexedDB",
    "Socket.IO multi-session stock synchronization",
    "Advanced cart with session persistence and recovery",
  ],
};

export default toolbox;
