// Write some IoT
import NeoPixel from 'neopixel'
import Timer from 'timer'
class NeoMatrix {
  constructor ({ height, width, pin, timing, order }) {
    this.length = height * width
    this.height = height
    this.width = width
    this.neoPixel = new NeoPixel({
      length: this.length,
      pin,
      // timing,
      order
    })
  }
  setPixel (x, y, color) {
    const a = x * this.width
    const b = x & 1 ? this.height - y - 1 : y
    const i = a + b
    this.neoPixel.setPixel(i, color)
  }
  fill (color, index, count) {
    if (index == null) {
      this.neoPixel.fill(color)
    } else if (count == null) {
      this.neoPixel.fill(color, index)
    } else {
      this.neoPixel.fill(color, index, count)
    }
  }
  update () {
    this.neoPixel.update()
  }
  set brightness (b) {
    this.neoPixel.brightness = b
  }
  makeRGB (r, g, b, w) {
    return this.neoPixel.makeRGB(r, g, b, w)
  }
  makeHSB (h, s, b, w) {
    return this.neoPixel.makeHSB(h, s, b, w)
  }
  close () {
    this.neoPixel.close()
  }
}
const np = new NeoMatrix({
  width: 16,
  height: 16,
  pin: 21,
  order: 'GRB'
})
// np.brightness = 16
np.brightness = 255
let count = 0
const r = 6
const c = 7.5
const black = np.makeRGB(0, 0, 0)
const red = np.makeRGB(255, 30, 0)
const blue = np.makeRGB(0, 30, 240)
function plot (np, rad, r, color) {
  const y = Math.round(c + r * Math.sin(rad))
  const x = Math.round(c + r * Math.cos(rad))
  np.setPixel(x, y, color)
}
Timer.repeat(() => {
  count++
  np.fill(black)
  const rad = Math.PI * (count / 30)
  plot(np, rad, r, red)
  const rad2 = Math.PI * (count / 15)
  plot(np, rad2, r / 2, blue)
  np.update()
}, 30)
