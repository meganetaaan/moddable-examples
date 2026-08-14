import assert from 'node:assert/strict'
import test from 'node:test'

import {
  assignVoices, decodeKeys, initializeTS20, KEYS, makeSineWave
} from '../unit/piano/m5piano.js'

test('M5Piano decodes the key, LED, and chromatic note mapping', () => {
  const bytes = Uint8Array.of(0x51, 0x02, 0x10, 0x48, 0, 0x08)
  const indexes = [0, 2, 4, 7, 8, 14, 19, 24]
  const expected = indexes.reduce((mask, index) => mask | (1 << index), 0)

  assert.equal(decodeKeys(bytes), expected)
  assert.deepEqual(
    KEYS.map(([, , pixel]) => pixel),
    [0, 1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18,
      20, 21, 22, 23, 24, 25, 26, 27]
  )
  assert.deepEqual(
    KEYS.map(([, , , frequency]) => frequency),
    [261, 277, 293, 311, 329, 349, 370, 392, 415, 440, 466, 494,
      524, 554, 588, 622, 660, 698, 740, 784, 831, 880, 932, 988, 1048]
  )
})

test('M5Piano creates sine samples and keeps four active voices', () => {
  const wave = new Int16Array(makeSineWave(440, 22_050))
  assert.ok(wave.buffer instanceof SharedArrayBuffer)
  assert.equal(wave.length, 50)
  assert.equal(wave[0], 0)
  assert.ok(wave[12] > 32_000)
  assert.ok(wave[37] < -32_000)

  const mask = indexes => indexes.reduce((value, key) => value | (1 << key), 0)
  let voices = assignVoices([-1, -1, -1, -1], mask([0, 4, 8, 12, 16]))
  assert.deepEqual(voices, [0, 4, 8, 12])
  voices = assignVoices(voices, mask([4, 8, 12, 16]))
  assert.deepEqual(voices, [16, 4, 8, 12])
})

test('M5Piano initializes the TS20 registers and validates sensitivity', () => {
  const writes = []
  const sensor = {
    writeUint8 (register, value) {
      writes.push([register, value])
    }
  }

  initializeTS20(sensor, 5)

  assert.equal(writes.length, 25)
  assert.deepEqual(writes[0], [0x0c, 0x1a])
  assert.deepEqual(
    writes.slice(7, 18),
    Array.from({ length: 11 }, (_, register) => [
      register,
      register === 3 ? 0xf5 : 0x55
    ])
  )
  assert.deepEqual(writes.slice(18), [
    [0x0b, 0x4b],
    [0x14, 0], [0x15, 0], [0x16, 0],
    [0x17, 0x0d], [0x0d, 0xfa], [0x0c, 0x12]
  ])
  assert.throws(() => initializeTS20(sensor, 16), RangeError)
})
