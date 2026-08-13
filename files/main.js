/*
 * Copyright (c) 2016-2018  Moddable Tech, Inc.
 *
 *   This file is part of the Moddable SDK.
 *
 *   This work is licensed under the
 *       Creative Commons Attribution 4.0 International License.
 *   To view a copy of this license, visit
 *       <http://creativecommons.org/licenses/by/4.0>.
 *   or send a letter to Creative Commons, PO Box 1866,
 *   Mountain View, CA 94042, USA.
 */

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const paths = ['test.txt', 'preferences.json', 'test.bin']

function writeText (path, text) {
  using file = device.files.openFile({ path, mode: 'w+' })
  file.write(encoder.encode(text), 0)
}

function readText (path) {
  using file = device.files.openFile({ path, mode: 'r' })
  const size = file.status().size
  return decoder.decode(file.read(size, 0))
}

try {
  const lines = [
    'This is a test.\n',
    'We can write multiple values.\n',
    'This is the end of the test.\n'
  ]
  writeText('test.txt', lines.join(''))
  trace(`${readText('test.txt')}\n`)

  const preferences = { name: 'Brian', city: 'Del Mar', state: 'CA' }
  writeText('preferences.json', JSON.stringify(preferences))
  const restored = JSON.parse(readText('preferences.json'))
  trace(
    `name: ${restored.name}, city: ${restored.city}, state: ${restored.state}\n\n`
  )

  {
    const numbers = Uint16Array.from({ length: 10 }, (_, index) => index)
    using file = device.files.openFile({ path: 'test.bin', mode: 'w+' })
    file.write(numbers, 0)
    const size = file.status().size
    trace(`File length: ${size}\n`)

    const offset = 5 * Uint16Array.BYTES_PER_ELEMENT
    const lastFive = new Uint16Array(file.read(size - offset, offset))
    trace(`Last five shorts: ${lastFive.join(' ')}\n\n`)
  }

  for (const name of device.files) {
    const status = device.files.status(name)
    const description = status.isDirectory()
      ? 'directory'
      : `file          ${status.size} bytes`
    trace(`${name.padEnd(32)} ${description}\n`)
  }
} finally {
  for (const path of paths) device.files.delete(path)
}
