import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { URL } from 'node:url'

import { WebSocket, WebSocketServer } from 'ws'

const host = process.env.HOST ?? '0.0.0.0'
const port = Number(process.env.PORT ?? 8080)
const publicDirectory = new URL('./public/', import.meta.url)
const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/main.js', ['main.js', 'text/javascript; charset=utf-8']],
  ['/muted.svg', ['muted.svg', 'image/svg+xml']],
  ['/sound.svg', ['sound.svg', 'image/svg+xml']]
])

function respondWithText (response, status, text, headers = {}) {
  response.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    ...headers
  })
  response.end(`${text}\n`)
}

const server = createServer(async (request, response) => {
  if (request.method !== 'GET') {
    respondWithText(response, 405, 'Method not allowed', { allow: 'GET' })
    return
  }

  const path = new URL(request.url, 'http://localhost').pathname
  const asset = assets.get(path)
  if (!asset) {
    respondWithText(response, 404, 'Not found')
    return
  }

  try {
    const data = await readFile(new URL(asset[0], publicDirectory))
    response.writeHead(200, {
      'content-length': data.byteLength,
      'content-type': asset[1]
    })
    response.end(data)
  } catch (error) {
    console.error(error)
    respondWithText(response, 500, 'Internal server error')
  }
})

const webSockets = new WebSocketServer({
  server,
  path: '/',
  maxPayload: 64
})

webSockets.on('connection', socket => {
  socket.on('error', error => console.error(error))
  socket.on('message', (data, isBinary) => {
    if (isBinary) return

    const frequency = Number(data.toString())
    if (!Number.isFinite(frequency) || frequency < 20 || frequency > 20_000) {
      return
    }

    const message = String(frequency)
    for (const client of webSockets.clients) {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    }
  })
})

webSockets.on('error', error => console.error(error))

server.listen(port, host, () => {
  const address = server.address()
  console.log(`listening on http://localhost:${address.port}`)
})
