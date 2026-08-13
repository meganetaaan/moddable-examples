import Timer from 'timer'

const ANALOG_READ_PIN = 26
const DIGITAL_READ_PIN = 36
const INTERVAL = 1000

const analog = new device.io.Analog({ pin: ANALOG_READ_PIN })
const Digital = device.io.Digital
const digital = new Digital({
  pin: DIGITAL_READ_PIN,
  mode: Digital.Input
})

Timer.repeat(() => {
  trace(`analog: ${analog.read()}, digital: ${digital.read()}\n`)
}, INTERVAL)
