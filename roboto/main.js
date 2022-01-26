/* global globalThis */
import Servo from 'pins/servo'
import Timer from 'timer'
import { NeoMatrix } from 'neomatrix'

let lights = globalThis.lights
const BLACK = lights.makeRGB(0, 0, 0)
const WHITE = lights.makeRGB(255, 255, 255)
const RED = lights.makeRGB(255, 0, 0)
const BLUE = lights.makeRGB(0, 0, 255)
const INTERVAL = 3000
const ANGLE_MAX = 30
const ANGLE_MIN = 0

function randomBetween(min, max) {
  return Math.floor(min + Math.random() * (max - min))
}

class Roboto {
  constructor() {
    this.matrix = new NeoMatrix({
      lights: globalThis.lights,
      width: 5,
      height: 5
    })
    this.servo = new Servo({
      pin: 25,
      min: 500,
      max: 2400
    })
    this.active = true
    trace('init\n')
    this.handler = Timer.repeat(() => {
      this.update()
    }, INTERVAL)
  }

  // LEDマトリクス描画
  renderMatrix(theta) {
    const matrix = this.matrix
    // 背景の描画
    matrix.fill(BLACK)
    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < matrix.height; y++) {
        matrix.setPixel(x, y, WHITE)
      }
    }
    matrix.setPixel(0, 3, RED)
    matrix.setPixel(1, 3, RED)
    matrix.setPixel(0, 1, BLUE)
    matrix.setPixel(1, 1, BLUE)

    // 針の描画
    const t = 4 - Math.floor(5 * (theta - ANGLE_MIN) / (ANGLE_MAX - ANGLE_MIN))
    trace(`t: ${t}\n`)
    matrix.setPixel(3, t, WHITE)
    matrix.setPixel(4, t, WHITE)

    // LEDマトリクスの更新
    matrix.update()
  }

  // 首振り
  turnHead(theta) {
    this.servo.write(theta)
  }

  update() {
    if (!this.active) {
      return
    }
    trace('update\n')
    const theta = randomBetween(ANGLE_MIN, ANGLE_MAX)
    trace(`theta: ${theta}\n`)
    this.renderMatrix(theta)
    this.turnHead(theta)
  }
}

const roboto = new Roboto
globalThis.button.a.onChanged = function () {
  if (this.read()) {
    roboto.active = !roboto.active
  }
}
