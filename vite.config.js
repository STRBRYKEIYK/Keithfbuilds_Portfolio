
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import obfuscator from 'vite-plugin-obfuscator'
export default defineConfig({
  plugins: [
    react(),
    obfuscator({
      // You can customize options below. These are strong but safe defaults:
      compact: true,
      controlFlowFlattening: true,
      deadCodeInjection: true,
      stringArray: true,
      stringArrayEncoding: ['rc4'],
      stringArrayThreshold: 0.75,
      rotateStringArray: true,
      selfDefending: true,
      disableConsoleOutput: true,
    })
  ], 
})