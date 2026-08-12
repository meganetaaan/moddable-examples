/*
 * Copyright (c) 2018  Moddable Tech, Inc.
 *
 *   This file is part of the Moddable SDK.
 *
 *   This work is licensed under the
 *       Creative Commons Attribution 4.0 International License.
 *   To view a copy of this license, visit
 *       <https://creativecommons.org/licenses/by/4.0>.
 *   or send a letter to Creative Commons, PO Box 1866,
 *   Mountain View, CA 94042, USA.
 *
 */
import config from 'mc/config'
import NeoPixel from 'neopixel'
import NeoMatrix from 'neomatrix'
import Timer from 'timer'

const COOLING = 12
const FRAME_RATE = 30
const { width, height, pin, order, brightness } = config.flame
const lights = new NeoPixel({ length: width * height, pin, order })
const matrix = new NeoMatrix({ lights, width, height })
matrix.brightness = brightness

class Flame {
  constructor (matrix) {
    this.matrix = matrix
    this.heat = new Uint8Array(matrix.width * matrix.height)
    this.hue = 15
  }

  index (x, y) {
    return (this.matrix.width * y) + x
  }

  update () {
    const { width, height } = this.matrix

    for (let y = height - 1; y > 0; y -= 1) {
      for (let x = 0; x < width; x += 1) {
        const previous = this.heat[this.index(x, y - 1)]
        const cooldown = Math.random() * COOLING + COOLING
        this.heat[this.index(x, y)] = Math.max(0, previous - cooldown)
      }
    }

    for (let x = 0; x < width; x += 1) {
      const range = 50 + (300 * Math.abs((width / 2) - x) / width)
      this.heat[this.index(x, 0)] = (Math.random() * range) + (255 - range)
    }
  }

  color (x, y) {
    const heat = this.heat[this.index(x, y)]
    const hue = this.hue + (30 * heat / 255)
    const saturation = 1000 - (200 * (heat / 255) ** 2)
    const brightness = (heat / 255) * 1000
    return this.matrix.makeHSB(hue, saturation, brightness)
  }

  draw () {
    this.update()
    for (let x = 0; x < this.matrix.width; x += 1) {
      for (let y = 0; y < this.matrix.height; y += 1) {
        this.matrix.setPixel(x, y, this.color(x, y))
      }
    }
    this.matrix.update()
  }
}

let hue = 15
const flame = new Flame(matrix)
Timer.repeat(() => {
  hue = (hue + 1) % 360
  flame.hue = hue
  flame.draw()
}, Math.round(1000 / FRAME_RATE))
