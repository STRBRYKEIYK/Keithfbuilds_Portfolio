const financialWorkflow = {
  slug: "financial-workflow",
  title: "Financial Workflow Platform",
  subtitle: "Full-Stack Financial Systems",
  impact: "Complete ERP Module",
  color: "#1f6f53",
  year: 2025,
  client: "Enterprise finance operations",
  role: "Full-stack development, state-machine modeling, dashboards",
  stack: ["React", "TypeScript", "State Machine", "Data Analytics"],
  liveDemoUrl: "https://strbrykeiyk.github.io/FPD_demo/",
  repoUrl: null,
  collaborators: [],
  ogImage: "/og/financial-workflow.png",
  // To add a cover: drop 1600x900 source at src/assets/projects/financial-workflow/cover.png
  // then `import cover from '../../assets/projects/financial-workflow/cover.png?cover'`
  cover: null,
  desc:
    "Financial workflow platform for vouchers, payroll, billing, loans, and expenses with end-to-end audit coverage.",
  story:
    "A unified financial workflow surface that handles vouchers, payroll, billing, loans, and expense reimbursement under one approval model. Each document type carries an audit trail from draft to released, with role-based gates at every transition.",
  why:
    "Finance teams were juggling five disconnected tools per document class. Reconciling them at month-end took days, and the audit trail was scattered. The platform consolidates the lifecycle under a single state machine so every voucher and payroll run has the same approval semantics.",
  how:
    "Document state is modeled as an explicit state machine (draft → submitted → reviewed → approved → released), driving both UI affordances and server-side guards. Dashboards run on aggregated event data, so KPIs reflect the same source of truth as the line items.",
  what:
    "Three voucher types share a single lifecycle, payroll supports bulk period processing, and the dashboard surfaces KPIs in chart form for the finance lead. The highlights below cover the specific capabilities shipped.",
  highlights: [
    "Multi-level approval states from draft to released",
    "Three voucher types with complete lifecycle handling",
    "Dynamic KPI dashboards with chart-based analytics",
    "Payroll support with bulk period processing",
  ],
};

export default financialWorkflow;
