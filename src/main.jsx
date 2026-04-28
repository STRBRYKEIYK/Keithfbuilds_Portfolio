import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initPerformanceMonitoring, logPerformanceMetrics } from './utils/performanceMonitoring'

// Initialize performance monitoring
if (import.meta.env.DEV) {
  initPerformanceMonitoring()
  logPerformanceMetrics()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)