import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

function netlifyFunctionDevBridge() {
  const routeToFunction = {
    '/api/contact': 'contact.js',
    '/api/contact-analytics': 'contact-analytics.js',
    '/api/contact-summary': 'contact-summary.js',
  }

  const readBody = (req) =>
    new Promise((resolve, reject) => {
      const chunks = []
      req.on('data', (chunk) => chunks.push(chunk))
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      req.on('error', reject)
    })

  const loadHandler = async (fileName) => {
    const fullPath = path.resolve(process.cwd(), 'functions', fileName)
    const fileUrl = pathToFileURL(fullPath).href
    const mod = await import(`${fileUrl}?v=${Date.now()}`)
    return mod?.handler
  }

  return {
    name: 'netlify-function-dev-bridge',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const requestUrl = req.url || ''
        const pathname = requestUrl.split('?')[0]
        const fnFile = routeToFunction[pathname]

        if (!fnFile) {
          next()
          return
        }

        try {
          const handler = await loadHandler(fnFile)
          if (typeof handler !== 'function') {
            res.statusCode = 500
            res.end('Function handler not found')
            return
          }

          const body = await readBody(req)
          const event = {
            httpMethod: req.method,
            path: pathname,
            headers: req.headers,
            body,
            queryStringParameters: Object.fromEntries(new URL(requestUrl, 'http://localhost').searchParams.entries()),
          }

          const result = await handler(event)
          const statusCode = Number(result?.statusCode || 200)
          const headers = result?.headers || {}
          const responseBody = result?.body ?? ''

          res.statusCode = statusCode
          Object.entries(headers).forEach(([key, value]) => {
            if (typeof value !== 'undefined') res.setHeader(key, String(value))
          })
          res.end(responseBody)
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Local function bridge failed.', detail: error?.message || 'Unknown error' }))
        }
      })
    },
  }
}

function productionObfuscationPlugin() {
  return {
    name: 'production-obfuscation-disabled',
    apply: 'build',
    enforce: 'post',
    renderChunk() {
      // Obfuscation disabled for better build performance
      return null
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [
      react(),
      netlifyFunctionDevBridge(),
      productionObfuscationPlugin(),
    ],
  }
})