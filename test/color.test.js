import assert from 'node:assert/strict'
import test from 'node:test'

import { normalizeColor, toHexColor } from '../unit/color/color.js'

test('normalizeColor scales RGBC readings to byte channels', () => {
  assert.deepEqual(
    normalizeColor({ red: 50, green: 100, blue: 200, clear: 100 }),
    { red: 127, green: 255, blue: 255 }
  )
  assert.deepEqual(
    normalizeColor({ red: 10, green: 20, blue: 30, clear: 0 }),
    { red: 0, green: 0, blue: 0 }
  )
})

test('toHexColor preserves leading zeroes', () => {
  assert.equal(toHexColor({ red: 0, green: 15, blue: 255 }), '#000fff')
})
