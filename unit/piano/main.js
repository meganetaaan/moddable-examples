import config from 'mc/config'
import NeoPixel from 'neopixel'
import AudioOut from 'pins/audioout'
import { Application, Label, Skin, Style } from 'piu/MC'
import Timer from 'timer'
import {
  assignVoices, decodeKeys, initializeTS20, KEYS, makeSineWave
} from 'm5piano'

const sensorAddresses = [0x6a, 0x7a]
const openSensor = address => new device.io.SMBus({
  address,
  clock: 5,
  data: 26,
  hz: 100_000
})
let sensors = sensorAddresses.map(openSensor)
const bytes = new Uint8Array(6)
const sensorBytes = [
  new Uint8Array(bytes.buffer, 0, 3),
  new Uint8Array(bytes.buffer, 3, 3)
]
const outputRegister = Uint8Array.of(0x20)
const sampleRate = 22_050
const audio = new AudioOut({
  bitsPerSample: 16, numChannels: 1, sampleRate, streams: 4
})
const waves = KEYS.map(key => makeSineWave(key[3], sampleRate))
let voices = Array(audio.streams).fill(-1)
audio.start()

const lights = new NeoPixel({ length: 29, pin: 2, order: 'GRB' })
lights.brightness = 10
const black = lights.makeRGB(0, 0, 0)
const red = lights.makeRGB(255, 0, 0)

const style = new Style({ font: 'OpenSans-Regular-24', color: 'yellow' })
const application = new Application(null, {
  skin: new Skin({ fill: 'black' }),
  contents: [
    new Label(null, {
      top: 10,
      left: 0,
      right: 0,
      height: 40,
      style,
      string: 'M5PIANO'
    }),
    new Label(null, {
      top: 55,
      left: 0,
      right: 0,
      height: 40,
      style,
      string: '0,0,0,0,0,0'
    })
  ]
})

function poll () {
  Timer.delay(5)
  try {
    for (let index = 0; index < sensors.length; index += 1) {
      sensors[index].write(outputRegister)
      sensors[index].read(sensorBytes[index])
    }
  } catch {
    sensors.forEach(sensor => sensor.close())
    sensors = sensorAddresses.map(openSensor)
    for (let stream = 0; stream < voices.length; stream += 1) {
      audio.enqueue(stream, AudioOut.Flush)
    }
    voices.fill(-1)
    return
  }
  application.last.string = bytes.join(',')

  lights.fill(black)
  const pressed = decodeKeys(bytes)
  for (let index = 0; index < KEYS.length; index += 1) {
    if (!(pressed & (1 << index))) continue

    lights.setPixel(KEYS[index][2], red)
  }
  lights.update()

  const nextVoices = assignVoices(voices, pressed)
  for (let stream = 0; stream < voices.length; stream += 1) {
    if (nextVoices[stream] === voices[stream]) continue

    audio.enqueue(stream, AudioOut.Flush)
    const key = nextVoices[stream]
    if (key < 0) continue
    audio.enqueue(stream, AudioOut.Volume, 64)
    audio.enqueue(stream, AudioOut.RawSamples, waves[key], Infinity)
  }
  voices = nextVoices
}

Timer.set(() => {
  Timer.delay(100)
  initializeTS20(sensors[0], config.pianoSensitivity)
  Timer.delay(100)

  for (let index = 0; index < lights.length; index += 1) {
    lights.setPixel(index, red)
    lights.update()
    Timer.delay(20)
  }
  Timer.delay(1000)
  for (let index = 0; index < lights.length; index += 1) {
    lights.setPixel(index, black)
    lights.update()
    Timer.delay(10)
  }

  poll()
  Timer.repeat(poll, 25)
})

export default application
