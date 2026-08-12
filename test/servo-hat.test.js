import assert from 'node:assert/strict'
import test from 'node:test'

import ServoHat from '../servo/servo-hat.js'

class MockI2C {
  static instances = []

  constructor (options) {
    this.options = options
    this.writes = []
    this.closeCount = 0
    MockI2C.instances.push(this)
  }

  write (value) {
    this.writes.push(Uint8Array.from(value))
  }

  close () {
    this.closeCount += 1
  }
}

test('ServoHat writes the selected channel and angle', () => {
  const target = {}
  const servo = new ServoHat({
    sensor: { io: MockI2C, data: 21, clock: 22 },
    id: 3,
    target
  })
  const io = MockI2C.instances.at(-1)

  assert.equal(servo.target, target)
  assert.equal(io.options.address, 0x53)
  assert.equal(io.options.hz, 100_000)

  servo.setAngle(90.4)
  assert.deepEqual(io.writes, [Uint8Array.of(0x13, 90)])
})

test('ServoHat validates input and closes once', () => {
  assert.throws(
    () => new ServoHat({ sensor: { io: MockI2C }, id: 16 }),
    RangeError
  )

  const servo = new ServoHat({ sensor: { io: MockI2C } })
  const io = MockI2C.instances.at(-1)
  assert.throws(() => servo.setAngle(181), RangeError)

  servo.close()
  servo.close()
  assert.equal(io.closeCount, 1)
  assert.throws(() => servo.setAngle(0), TypeError)
})
