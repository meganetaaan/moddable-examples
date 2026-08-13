/*
 * Copyright (c) 2019 Shinya Ishikawa
 */

import Timer from 'timer'

const INTERVAL = 30
const i2c = new device.io.I2C({
  ...device.I2C.default,
  hz: 100_000,
  address: 0x52
})

const values = new Uint8Array(3)
Timer.repeat(() => {
  i2c.read(values)
  trace(`${values[0]}, ${values[1]}, ${values[2]}\n`)
}, INTERVAL)
