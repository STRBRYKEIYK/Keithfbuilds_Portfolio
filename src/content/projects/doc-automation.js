const docAutomation = {
  slug: "doc-automation",
  title: "Doc Automation Service",
  subtitle: "Backend Automation and OCR",
  impact: "Multi-Provider OCR Engine",
  color: "#2e8c67",
  year: 2025,
  client: "Internal document intake",
  role: "Backend development, OCR pipeline, intake API",
  stack: ["Express", "TypeScript", "Python", "OCR", "API"],
  liveDemoUrl: null,
  repoUrl: null,
  collaborators: [],
  ogImage: "/og/doc-automation.png",
  // To add a cover: drop 1600x900 source at src/assets/projects/doc-automation/cover.png
  // then `import cover from '../../assets/projects/doc-automation/cover.png?cover'`
  cover: null,
  desc:
    "Document ingestion service for extracting structured data from PDFs, images, and office files across enterprise workflows.",
  story:
    "A document ingestion service that takes whatever the business throws at it (PDFs, scans, Office files, photos) and emits structured, validated records into the downstream workflow systems. The OCR layer is multi-provider, so the service picks the best engine per document class.",
  why:
    "Manual data entry was the bottleneck on every enterprise workflow that started with a document. A single-provider OCR was tried first and failed on handwritten forms; the answer was a routing layer that selects between Tesseract, EasyOCR, and Qwen-VL depending on the document profile.",
  how:
    "Express + TypeScript handles the upload API with strict validation and audit logging; the OCR step shells out to a Python worker pool that runs each candidate engine and consensus-scores the result. The pipeline is concurrent, so a batch of 100 documents processes in parallel without blocking the API.",
  what:
    "Secure intake endpoints, audit trails, support across PDF/Excel/Word/JPEG/PNG, and a routing pipeline that picks the right OCR provider per document. The highlights below describe the concrete capabilities of the engine.",
  highlights: [
    "Multi-provider OCR using Tesseract, EasyOCR, and Qwen-VL",
    "Secure upload endpoints with validation and audit trails",
    "Support for PDF, Excel, Word, JPEG, PNG and more",
    "Concurrent processing pipeline for scalable intake",
  ],
};

export default docAutomation;
