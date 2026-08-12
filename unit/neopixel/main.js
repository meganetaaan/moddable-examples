import config from 'mc/config'
import NeoPixel from 'neopixel'
import Timer from 'timer'

const { length, pin, order, brightness } = config.led
const np = new NeoPixel({ length, pin, order })
np.brightness = brightness

Timer.delay(1)
for (const color of [[255, 255, 255], [255, 0, 0], [0, 255, 0], [0, 0, 255]]) {
  np.fill(np.makeRGB(...color))
  np.update()
  Timer.delay(500)
}

function nextColor (color) {
  color <<= 1
  return color === 0x1000000 ? 1 : color
}

let value = 0x01
Timer.repeat(() => {
  let v = value
  for (let i = 0; i < np.length; i++) {
    np.setPixel(i, v)
    v = nextColor(v)
  }

  np.update()
  value = nextColor(value)
}, 33)
