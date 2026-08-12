import assert from 'node:assert/strict'
import test from 'node:test'

import frequencyFromDistance from '../theremin/client/frequency.js'

test('theremin distance mapping clamps its octave and decreases with distance', () => {
  assert.equal(frequencyFromDistance(0), 880)
  assert.equal(frequencyFromDistance(50), 880)
  assert.equal(frequencyFromDistance(500), 440)
  assert.equal(frequencyFromDistance(1_000), 440)
  assert.ok(frequencyFromDistance(200) > frequencyFromDistance(300))
})
