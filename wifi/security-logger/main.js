/*
 * Copyright (c) 2019 Shinya Ishikawa
 * Security logger example with PIR sensor
 */

import Timer from 'timer'

import Digital from 'pins/digital'

const DIGITAL_READ_PIN = 36
/* global trace */

const INTERVAL = 1000

Timer.repeat((_) => {
  let value1 = Digital.read(DIGITAL_READ_PIN)
  trace(`value1: ${value1}\r`)
}, INTERVAL)
