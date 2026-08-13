import assert from 'node:assert/strict'
import { once } from 'node:events'
import { spawn } from 'node:child_process'
import test from 'node:test'
import { URL } from 'node:url'

import { WebSocket } from 'ws'

const serverDirectory = new URL('../', import.meta.url)
let serverProcess
let baseURL

function waitForServer (child) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('server startup timed out')), 5_000)
    let output = ''

    child.stdout.setEncoding('utf8')
    child.stdout.on('data', chunk => {
      output += chunk
      const match = output.match(/listening on http:\/\/localhost:(\d+)/)
      if (!match) return

      clearTimeout(timeout)
      resolve(`http://localhost:${match[1]}`)
    })
    child.once('error', error => {
      clearTimeout(timeout)
      reject(error)
    })
    child.once('exit', code => {
      if (baseURL) return

      clearTimeout(timeout)
      reject(new Error(`server exited with code ${code}`))
    })
  })
}

function openWebSocket (url) {
  const socket = new WebSocket(url)
  return once(socket, 'open').then(() => socket)
}

test.before(async () => {
  serverProcess = spawn(process.execPath, ['index.js'], {
    cwd: serverDirectory,
    env: { ...process.env, HOST: '127.0.0.1', PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe']
  })
  baseURL = await waitForServer(serverProcess)
})

test.after(async () => {
  if (serverProcess.exitCode !== null) return

  const exited = once(serverProcess, 'exit')
  serverProcess.kill()
  await exited
})

test('serves the browser UI and HTTP errors', async () => {
  const page = await fetch(baseURL)
  assert.equal(page.status, 200)
  assert.match(await page.text(), /Moddable Theremin/)

  const script = await fetch(`${baseURL}/main.js`)
  assert.equal(script.status, 200)
  assert.match(script.headers.get('content-type'), /^text\/javascript/)
  assert.match(await script.text(), /class Oscillator/)

  const missing = await fetch(`${baseURL}/missing`)
  assert.equal(missing.status, 404)

  const method = await fetch(baseURL, { method: 'POST' })
  assert.equal(method.status, 405)
  assert.equal(method.headers.get('allow'), 'GET')
})

test('broadcasts valid frequencies and ignores invalid messages', async () => {
  const websocketURL = baseURL.replace('http:', 'ws:')
  const [sender, receiver] = await Promise.all([
    openWebSocket(websocketURL),
    openWebSocket(websocketURL)
  ])

  try {
    const received = []
    receiver.on('message', data => received.push(data.toString()))

    sender.send('not-a-frequency')
    await new Promise(resolve => setTimeout(resolve, 50))
    assert.deepEqual(received, [])

    sender.send('660')
    const [data, isBinary] = await once(receiver, 'message')
    assert.equal(isBinary, false)
    assert.equal(data.toString(), '660')
  } finally {
    sender.close()
    receiver.close()
  }
})
