import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'

const host = process.env.HOST ?? '127.0.0.1'
const port = Number(process.env.PORT ?? 8080)
const root = resolve(process.cwd(), 'src')
const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml']
])

function respondWithText (response, status, message, headers = {}) {
  response.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    ...headers
  })
  response.end(`${message}\n`)
}

const server = createServer(async (request, response) => {
  const head = request.method === 'HEAD'
  if (request.method !== 'GET' && !head) {
    respondWithText(response, 405, 'Method not allowed', { allow: 'GET, HEAD' })
    return
  }

  let pathname
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
  } catch {
    respondWithText(response, 400, 'Bad request')
    return
  }

  if (pathname.endsWith('/')) pathname += 'index.html'
  const path = resolve(root, `.${pathname}`)
  if (path !== root && !path.startsWith(`${root}${sep}`)) {
    respondWithText(response, 404, 'Not found')
    return
  }

  try {
    const data = await readFile(path)
    response.writeHead(200, {
      'content-length': data.byteLength,
      'content-type': contentTypes.get(extname(path)) ?? 'application/octet-stream'
    })
    response.end(head ? undefined : data)
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'EISDIR') {
      respondWithText(response, 404, 'Not found')
      return
    }

    console.error(error)
    respondWithText(response, 500, 'Internal server error')
  }
})

server.listen(port, host, () => {
  const address = server.address()
  console.log(`listening on http://localhost:${address.port}`)
})
