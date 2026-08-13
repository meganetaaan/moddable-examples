import assert from 'node:assert/strict'
import test from 'node:test'

import DHT12 from '../unit/env/dht12.js'

class MockI2C {
  static instances = []

  constructor (options) {
    this.options = options
    this.reading = new Uint8Array(5)
    this.writes = []
    this.closeCount = 0
    MockI2C.instances.push(this)
  }

  write (value) {
    this.writes.push(Uint8Array.from(value))
  }

  read (value) {
    value.set(this.reading)
  }

  close () {
    this.closeCount += 1
  }
}

test('DHT12 samples ECMA-419 thermometer and hygrometer values', () => {
  const target = {}
  const sensor = new DHT12({
    sensor: { io: MockI2C, data: 21, clock: 22 },
    target
  })
  const io = MockI2C.instances.at(-1)

  io.reading.set([45, 6, 12, 0x83, 194])
  assert.deepEqual(sensor.sample(), {
    hygrometer: { humidity: 45.6 },
    thermometer: { temperature: -12.3 }
  })
  assert.deepEqual(io.writes, [Uint8Array.of(0)])
  assert.equal(sensor.target, target)
  assert.equal(io.options.address, 0x5c)
  assert.equal(io.options.hz, 400_000)
})

test('DHT12 rejects bad checksums and closes once', () => {
  const sensor = new DHT12({
    sensor: { io: MockI2C }
  })
  const io = MockI2C.instances.at(-1)

  io.reading.set([45, 6, 12, 3, 0])
  assert.deepEqual(sensor.sample(), { hygrometer: {}, thermometer: {} })

  sensor.close()
  sensor.close()
  assert.equal(io.closeCount, 1)
  assert.throws(() => sensor.sample(), TypeError)
})

test('DHT12 requires a constructor-IO sensor', () => {
  assert.throws(() => new DHT12(), TypeError)
})
