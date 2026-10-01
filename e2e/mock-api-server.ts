import { createServer } from 'node:http'

const host = '127.0.0.1'
const port = 4181

const server = createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/api/health') {
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ ok: true, service: 'appsfly-api', environment: 'test' }))
    return
  }

  response.writeHead(404, { 'content-type': 'application/json' })
  response.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(port, host)

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
