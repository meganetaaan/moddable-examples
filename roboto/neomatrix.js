import NeoPixel from 'neopixel'

const TIMING_WS2812B = {
  mark: { level0: 1, duration0: 900, level1: 0, duration1: 350 },
  space: { level0: 1, duration0: 350, level1: 0, duration1: 900 },
  reset: { level0: 0, duration0: 100, level1: 0, duration1: 100 }
}
Object.freeze(TIMING_WS2812B)
Object.freeze(TIMING_WS2812B.mark)
Object.freeze(TIMING_WS2812B.space)
Object.freeze(TIMING_WS2812B.reset)

export class NeoMatrix {
  constructor({ lights, height = 5, width = 5, pin, timing = TIMING_WS2812B, order, brightness = 32, direction = 0 }) {
    this.height = height
    this.width = width
    if (lights != null) {
      if (height * width > lights.length) {
        throw new Error("height * width should not be larger than lights.length")
      }
      this.lights = lights
      this.length = lights.length
    } else {
      this.timing = timing
      this.length = height * width
      this.lights = new NeoPixel({
        length: this.length,
        pin,
        timing: this.timing,
        order
      })
    }
    this.lights.brightness = brightness
    this.direction = direction
  }
  setPixel(x, y, color) {
    const a = x * this.width
    const b = this.direction === 0
      ? (this.height - y - 1)
      : x & 1 ? this.height - y - 1 : y
    const i = a + b
    this.lights.setPixel(i, color)
  }
  fill(color, index, count) {
    if (index == null) {
      this.lights.fill(color)
    } else if (count == null) {
      this.lights.fill(color, index)
    } else {
      this.lights.fill(color, index, count)
    }
  }
  update() {
    this.lights.update()
  }
  set brightness(b) {
    this.lights.brightness = b
  }
  makeRGB(r, g, b, w) {
    return this.lights.makeRGB(r, g, b, w)
  }
  makeHSB(h, s, b, w) {
    return this.lights.makeHSB(h, s, b, w)
  }
  close() {
    this.lights.close()
  }
}

Object.freeze(NeoMatrix.prototype)
