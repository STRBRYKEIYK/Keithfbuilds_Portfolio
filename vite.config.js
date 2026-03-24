import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import obfuscatorPkg from 'vite-plugin-obfuscator'

const obfuscator = obfuscatorPkg.default ?? obfuscatorPkg

export default defineConfig({
  plugins: [
    react(),
    obfuscator({
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