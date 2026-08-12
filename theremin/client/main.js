/* global trace */

import { Client } from 'websocket'
import Timer from 'timer'
import ToF from 'vl53l0x'
import config from 'mc/config'

const FPS = 15
const MIN_DISTANCE = 50
const MAX_DISTANCE = 500
const KEY_A = 440
const a = -1 / 450
const b = 10 / 9

const socket = new Client({
  host: config.host,
  port: 8080
})
const sensor = new ToF({
  sensor: {
    ...device.I2C.default,
    io: device.io.SMBus
  }
})
let timer = null

function clamp (value, min, max) {
  return Math.floor(Math.min(max, Math.max(value, min)))
}

function getTone (mm) {
  const d = clamp(mm, MIN_DISTANCE, MAX_DISTANCE)
  return KEY_A * Math.pow(2, d * a + b)
}

function loop () {
  const distance = sensor.sample().proximity.distance
  if (distance === null) return

  const message = String(getTone(distance * 10))
  socket.write(message)
}

socket.callback = function (message, value) {
  switch (message) {
    case Client.connect:
      trace('socket connect\n')
      timer = Timer.repeat(loop, 1000 / FPS)
      break

    case Client.handshake:
      trace('websocket handshake success\n')
      break

    case Client.receive:
      trace(`websocket message received: ${value}\n`)
      break

    case Client.disconnect:
      trace('websocket close\n')
      if (timer != null) {
        Timer.clear(timer)
        timer = null
      }
      break
  }
}
