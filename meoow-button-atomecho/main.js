import AudioOut from 'embedded:io/audio/out'
import { MAUD, SampleFormat } from 'maudHeader'
import Resource from 'Resource'
import NeoPixel from 'neopixel'
import { Request } from 'http'
import Timer from 'timer'

const np = new NeoPixel({})
const black = np.makeRGB(0, 0, 0)
const pink = np.makeRGB(255, 127, 127)
const HOST = 'maker.ifttt.com'
const API_KEY = 'YOUR_API_KEY_HERE'
const EVENT = 'moddable_button_pressed'
const speaker = new AudioOut.Async({})

function loadSound (name) {
  const header = new MAUD(new Resource(name))
  if (
    header.version !== 1 ||
    header.tag !== 'ma' ||
    header.sampleFormat !== SampleFormat.Uncompressed ||
    header.bitsPerSample !== speaker.bitsPerSample ||
    header.channels !== speaker.channels ||
    header.sampleRate !== speaker.sampleRate
  ) {
    throw new Error(`Unsupported audio resource: ${name}`)
  }

  return new Uint8Array(
    header.buffer,
    header.byteOffset + header.byteLength,
    header.bufferSamples * speaker.channels * (speaker.bitsPerSample / 8)
  )
}

const samples = loadSound('meoow.maud')
let playing = false
speaker.start()

const on = () => {
  np.fill(pink)
  np.update()
}

const off = () => {
  np.fill(black)
  np.update()
}

function playSound () {
  if (playing) return

  playing = true
  on()
  speaker.write(samples, error => {
    playing = false
    off()
    if (error) trace(`Audio error: ${error}\n`)
  })
}

const triggerIFTTT = (value) => {
  const request = new Request({
    host: HOST,
    path: `/trigger/${EVENT}/with/key/${API_KEY}?value1=${value}`,
    response: String
  })
  request.callback = function (message, value) {
    if (Request.responseComplete === message) {
      trace(`${value}\n`)
    }
  }
}

// Atom Echo's target setup owns this pin and exposes the button globally.
globalThis.button.a.onChanged = function () {
  if (this.read()) return

  trace('play sound\n')
  triggerIFTTT('')
  playSound()
}

on()
Timer.set(off, 500)
