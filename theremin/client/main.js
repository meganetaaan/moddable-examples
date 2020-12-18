/* global trace */

import { Client } from 'websocket'
import Timer from 'timer'
import ToF from 'vl53l0x'

const EVENT_NAME = 'm5stack/tone'
const FPS = 15
const MIN_DISTANCE = 50
const MAX_DISTANCE = 500
const KEY_A = 440
const a = -1 / 450
const b = 10 / 9

let socket = new Client({
  host: '192.168.7.112',
  port: 8080
})
let sensor = new ToF()
let timer = null

function clamp (value, min, max) {
  return Math.floor(Math.min(max, Math.max(value, min)))
}

function getTone (mm) {
  const d = clamp(mm, MIN_DISTANCE, MAX_DISTANCE)
  return KEY_A * Math.pow(2, d * a + b)
}

function loop () {
  const mm = sensor.value
  const message = String(getTone(mm))
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
