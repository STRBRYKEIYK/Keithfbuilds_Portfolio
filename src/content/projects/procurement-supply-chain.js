const procurementSupplyChain = {
  slug: "procurement-supply-chain",
  title: "Procurement & Supply Chain",
  subtitle: "Frontend Development",
  impact: "Full Supply Chain Coverage",
  color: "#f08a24",
  year: 2025,
  client: "Enterprise procurement team",
  role: "Frontend development, scan workflows, validation pipelines",
  stack: ["React", "TypeScript", "QR/Barcode", "WebSocket", "Axios"],
  liveDemoUrl: null,
  repoUrl: null,
  collaborators: [],
  ogImage: "/og/procurement-supply-chain.png",
  // To add a cover: drop 1600x900 source at src/assets/projects/procurement-supply-chain/cover.png
  // then `import cover from '../../assets/projects/procurement-supply-chain/cover.png?cover'`
  cover: null,
  desc:
    "Procurement and inventory module for supplier management and purchase order workflows with strong process visibility.",
  story:
    "A procurement and supplier-management module that covers the full supply chain: from inventory intake and QR/barcode tagging through multi-step purchase orders and supplier reconciliation. Built as a frontend layer over an existing ERP backend.",
  why:
    "The legacy ERP had the data but not the workflow. Purchase orders required jumping between screens, duplicate SKUs slipped through, and CSV imports failed silently. The new module collapses the workflow into wizards and enforces validation at the entry point, not after submit.",
  how:
    "Each long-running action (PO creation, CSV import, scan loops) is modeled as a wizard with explicit step states, so partial completion is recoverable. QR and barcode scans go through a duplicate-detection pass before they reach the canonical store, and CSV imports validate row by row with per-line error reporting.",
  what:
    "Multi-step PO wizard, scan generation and reading for inventory, CSV import with per-row validation, and real-time stock visibility through the existing socket layer. The highlights below list the concrete features delivered.",
  highlights: [
    "QR/barcode generation and scanning for inventory",
    "Multi-step purchase order creation wizard",
    "Duplicate detection for inventory integrity",
    "CSV/Excel import with validation and error reporting",
  ],
};

export default procurementSupplyChain;
