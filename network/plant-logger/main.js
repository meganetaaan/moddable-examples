import Timer from 'timer'

import Analog from 'pins/analog'
import Digital from 'pins/digital'

const ANALOG_READ_PIN = 26
const DIGITAL_READ_PIN = 36
/* global trace */

const INTERVAL = 1000

Timer.repeat((_) => {
  let value1 = Analog.read(ANALOG_READ_PIN)
  let value2 = Digital.read(DIGITAL_READ_PIN)
  trace(`value1: ${value1}, value2: ${value2}`)
}, INTERVAL)
