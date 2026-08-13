import assert from 'node:assert/strict'
import test from 'node:test'

import NeoMatrix from '../shared/neomatrix.js'
import { matrixPixelIndex, rgb565ToRGB } from '../shared/neomatrix-utils.js'

class MockLights {
  constructor (length) {
    this.length = length
    this.pixels = []
    this.closeCount = 0
  }

  setPixel (index, color) {
    this.pixels[index] = color
  }

  fill () {}
  update () {}
  makeRGB (red, green, blue) { return (red << 16) | (green << 8) | blue }
  makeHSB () { return 0 }
  close () { this.closeCount += 1 }
}

test('matrixPixelIndex maps non-square column layouts', () => {
  assert.deepEqual(
    [
      matrixPixelIndex(0, 0, 3, 2),
      matrixPixelIndex(0, 1, 3, 2),
      matrixPixelIndex(1, 0, 3, 2),
      matrixPixelIndex(1, 1, 3, 2),
      matrixPixelIndex(2, 0, 3, 2),
      matrixPixelIndex(2, 1, 3, 2)
    ],
    [0, 1, 3, 2, 4, 5]
  )
  assert.equal(matrixPixelIndex(1, 0, 3, 2, 'columns-reversed'), 3)
  assert.throws(() => matrixPixelIndex(3, 0, 3, 2), RangeError)
})

test('rgb565ToRGB expands every channel to eight bits', () => {
  assert.equal(rgb565ToRGB(0xf800), 0xff0000)
  assert.equal(rgb565ToRGB(0x07e0), 0x00ff00)
  assert.equal(rgb565ToRGB(0x001f), 0x0000ff)
  assert.equal(rgb565ToRGB(0xffff), 0xffffff)
})

test('NeoMatrix delegates mapped pixels and closes once', () => {
  const lights = new MockLights(6)
  const matrix = new NeoMatrix({ lights, width: 3, height: 2 })

  matrix.setPixel(1, 0, 0x123456)
  assert.equal(lights.pixels[3], 0x123456)
  assert.equal(matrix.length, 6)

  matrix.close()
  matrix.close()
  assert.equal(lights.closeCount, 1)
  assert.throws(() => matrix.update(), TypeError)
})
