import AudioOut from 'embedded:io/audio/out'
import { MAUD, SampleFormat } from 'maudHeader'
import config from 'mc/config'
import Resource from 'Resource'
import NeoPixel from 'neopixel'
import Timer from 'timer'
import requestText from 'http-client'
import { hasIFTTTKey, makeIFTTTPath } from 'ifttt'

const np = new NeoPixel({})
const black = np.makeRGB(0, 0, 0)
const pink = np.makeRGB(255, 127, 127)
const HOST = 'maker.ifttt.com'
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
let sending = false
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

async function triggerIFTTT (value) {
  if (sending) return
  if (!hasIFTTTKey(config.iftttKey)) {
    trace('Set config.iftttKey before sending a webhook\n')
    return
  }

  sending = true
  try {
    const response = await requestText(device.network.https, {
      host: HOST,
      path: makeIFTTTPath({
        event: config.iftttEvent,
        key: config.iftttKey,
        value
      })
    })
    trace(`${response}\n`)
  } catch (error) {
    trace(`IFTTT request failed: ${error}\n`)
  } finally {
    sending = false
  }
}

// Atom Echo's target setup owns this pin and exposes the button globally.
globalThis.button.a.onChanged = function () {
  if (this.read()) return

  trace('play sound\n')
  triggerIFTTT('atom-echo')
  playSound()
}

on()
Timer.set(off, 500)
