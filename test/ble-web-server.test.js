import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const serverPath = fileURLToPath(new URL('../ble/web-server.js', import.meta.url))
const centralDirectory = fileURLToPath(
  new URL('../ble/mai5/mai5-central/', import.meta.url)
)

function startServer () {
  const child = spawn(process.execPath, [serverPath], {
    cwd: centralDirectory,
    env: { ...process.env, HOST: '127.0.0.1', PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe']
  })

  return new Promise((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const timeout = setTimeout(() => reject(new Error('server startup timed out')), 5_000)

    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stderr.on('data', chunk => { stderr += chunk })
    child.stdout.on('data', chunk => {
      stdout += chunk
      const match = stdout.match(/listening on http:\/\/localhost:(\d+)/)
      if (!match) return

      clearTimeout(timeout)
      resolve({ child, url: `http://localhost:${match[1]}` })
    })
    child.once('error', error => {
      clearTimeout(timeout)
      reject(error)
    })
    child.once('exit', code => {
      clearTimeout(timeout)
      reject(new Error(`server exited with code ${code}: ${stderr}`))
    })
  })
}

test('BLE development server serves only its src tree', async () => {
  const { child, url } = await startServer()

  try {
    const page = await fetch(url)
    assert.equal(page.status, 200)
    assert.match(page.headers.get('content-type'), /^text\/html/)
    assert.match(await page.text(), /Mai5/)

    const script = await fetch(`${url}/js/index.js`)
    assert.equal(script.status, 200)
    assert.match(script.headers.get('content-type'), /^text\/javascript/)

    const missing = await fetch(`${url}/package.json`)
    assert.equal(missing.status, 404)

    const method = await fetch(url, { method: 'POST' })
    assert.equal(method.status, 405)
    assert.equal(method.headers.get('allow'), 'GET, HEAD')
  } finally {
    if (child.exitCode === null) {
      const exited = once(child, 'exit')
      child.kill()
      await exited
    }
  }
})
