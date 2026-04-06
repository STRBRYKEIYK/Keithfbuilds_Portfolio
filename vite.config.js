import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import JavaScriptObfuscator from 'javascript-obfuscator'

function productionObfuscationPlugin(enabled) {
  return {
    name: 'production-js-obfuscation',
    apply: 'build',
    enforce: 'post',
    renderChunk(code, chunk) {
      if (!enabled) return null
      if (!chunk.fileName.endsWith('.js')) return null
      if (!chunk.fileName.startsWith('assets/index-')) return null

      const result = JavaScriptObfuscator.obfuscate(code, {
        compact: true,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        stringArray: true,
        stringArrayEncoding: ['rc4'],
        stringArrayThreshold: 0.35,
        rotateStringArray: true,
        splitStrings: false,
        selfDefending: false,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
      })

      return {
        code: result.getObfuscatedCode(),
        map: null,
      }
    },
  }
}

export default defineConfig(({ mode }) => {
  const shouldObfuscate =
    process.env.ENABLE_OBFUSCATION === 'true' ||
    (mode === 'production' && process.env.ENABLE_OBFUSCATION !== 'false')

  return {
    plugins: [
      react(),
      productionObfuscationPlugin(shouldObfuscate),
    ],
  }
})