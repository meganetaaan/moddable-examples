/*
 * Copyright (c) 2019 Shinya Ishikawa
 * Security logger example with PIR sensor
 */

import Timer from 'timer'

const DIGITAL_READ_PIN = 36
const INTERVAL = 1000

const Digital = device.io.Digital
const sensor = new Digital({
  pin: DIGITAL_READ_PIN,
  mode: Digital.Input
})

Timer.repeat(() => {
  trace(`value: ${sensor.read()}\n`)
}, INTERVAL)
