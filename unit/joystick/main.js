/*
 * Copyright (c) 2019 Shinya Ishikawa
 */

import I2C from 'pins/i2c'
import Timer from 'timer'

/* global trace */

const INTERVAL = 30
const i2c = new I2C({
  sda: 21,
  scl: 22,
  address: 0x52
})

const buf = new ArrayBuffer(3)
Timer.repeat((_) => {
  i2c.read(3, buf)
  const int8arr = new Uint8Array(buf)
  trace(`${int8arr[0]}, ${int8arr[1]}, ${int8arr[2]}\n`)
}, INTERVAL)
