import NeoPixel from 'neopixel'
import Timer from 'timer'

// On M5Stack + NeoPixel Unit
// const np = new NeoPixel({ length: 29, pin: 21, order: 'RGB' })

// On M5StickC + NeoPixel Unit
// const np = new NeoPixel({ length: 29, pin: 32, order: 'RGB' })

// On M5GO or M5Stack Fire + embedded NeoPixel
const np = new NeoPixel({ length: 10, pin: 15, order: 'RGB' })

Timer.delay(1)
np.fill(np.makeRGB(255, 255, 255))
np.update()
Timer.delay(500)
np.fill(np.makeRGB(255, 0, 0))
np.update()
Timer.delay(500)
np.fill(np.makeRGB(0, 255, 0))
np.update()
Timer.delay(500)
np.fill(np.makeRGB(0, 0, 255))
np.update()
Timer.delay(500)

let value = 0x01
Timer.repeat(() => {
  let v = value
  for (let i = 0; i < np.length; i++) {
    v <<= 1
    if (v === 1 << 24) v = 1
    np.setPixel(i, v)
  }

  np.update()

  value <<= 1
  if (value === 1 << 24) value = 1
}, 33)
