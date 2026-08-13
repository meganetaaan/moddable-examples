import assert from 'node:assert/strict'
import test from 'node:test'

import PWMServo from '../roboto/pwm-servo.js'

class MockPWM {
  static instances = []

  constructor (options) {
    this.options = options
    this.resolution = 14
    this.values = []
    this.closeCount = 0
    MockPWM.instances.push(this)
  }

  write (value) {
    this.values.push(value)
  }

  close () {
    this.closeCount += 1
  }
}

test('PWMServo maps degrees to the configured pulse range', () => {
  const target = {}
  const servo = new PWMServo({
    io: MockPWM,
    pin: 25,
    min: 500,
    max: 2_400,
    target
  })
  const io = MockPWM.instances.at(-1)

  assert.equal(servo.target, target)
  assert.deepEqual(io.options, { pin: 25, hz: 50 })

  servo.write(0)
  servo.write(90)
  servo.write(180)
  assert.deepEqual(io.values, [410, 1_188, 1_966])
})

test('PWMServo validates input and closes once', () => {
  assert.throws(() => new PWMServo({ io: MockPWM, min: 2_000, max: 1_000 }), RangeError)

  const servo = new PWMServo({ io: MockPWM, pin: 25 })
  const io = MockPWM.instances.at(-1)
  assert.throws(() => servo.write(-1), RangeError)

  servo.close()
  servo.close()
  assert.equal(io.closeCount, 1)
  assert.throws(() => servo.write(0), TypeError)
})
