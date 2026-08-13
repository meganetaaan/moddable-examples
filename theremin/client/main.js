import config from 'mc/config'
import Timer from 'timer'
import ToF from 'vl53l0x'

const FPS = 15
const MIN_DISTANCE = 50
const MAX_DISTANCE = 500
const KEY_A = 440
const SLOPE = -1 / 450
const OFFSET = 10 / 9

const sensor = new ToF({
  sensor: {
    ...device.I2C.default,
    io: device.io.SMBus
  }
})
const WebSocketClient = device.network.ws.io
let timer
let writable = 0

function frequencyFromDistance (millimeters) {
  const distance = Math.floor(
    Math.min(MAX_DISTANCE, Math.max(millimeters, MIN_DISTANCE))
  )
  return KEY_A * Math.pow(2, distance * SLOPE + OFFSET)
}

function sendFrequency () {
  const distance = sensor.sample().proximity.distance
  if (distance === null) return

  const message = ArrayBuffer.fromString(
    String(frequencyFromDistance(distance * 10))
  )
  if (message.byteLength > writable) return

  writable = socket.write(message, { binary: false })
}

function stopSending () {
  if (timer === undefined) return

  Timer.clear(timer)
  timer = undefined
  writable = 0
}

const socket = new WebSocketClient({
  ...device.network.ws,
  host: config.host,
  port: config.port,
  path: '/',
  onReadable (count) {
    this.read(count)
  },
  onWritable (count) {
    writable = count
    if (timer !== undefined) return

    trace('WebSocket connected\n')
    sendFrequency()
    timer = Timer.repeat(sendFrequency, 1000 / FPS)
  },
  onControl (opcode) {
    if (opcode === WebSocketClient.close) trace('WebSocket closing\n')
  },
  onClose () {
    stopSending()
    trace('WebSocket closed\n')
  },
  onError () {
    stopSending()
    trace('WebSocket error\n')
  }
})
