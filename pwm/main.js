import PWM from 'pins/pwm'
import Digital from 'digital'
import Monitor from 'monitor'
import Timer from 'timer'
import { NeoMatrix } from 'neomatrix'

const matrix = new NeoMatrix({
  pin: 27,
  width: 5,
  height: 5
})

let tick = 0
let on = true

const pwm = new PWM({
  pin: 25
})

const button = new Monitor({
  pin: 39,
  mode: Digital.InputPullUp,
  edge: Monitor.RisingEdge
})
button.onChanged = function () {
  if (this.read()) {
    on = !on
  }
}

const black = matrix.makeRGB(0, 0, 0)
const white = matrix.makeRGB(255, 255, 255)
const red = matrix.makeRGB(255, 0, 0)
const blue = matrix.makeRGB(0, 0, 255)

const render = tick => {
  matrix.fill(black)
  for (let x = 0; x < 2; x++) {
    for (let y = 0; y < matrix.height; y++) {
      matrix.setPixel(x, y, white)
    }
  }
  matrix.setPixel(0, 3, red)
  matrix.setPixel(1, 3, red)
  matrix.setPixel(0, 1, blue)
  matrix.setPixel(1, 1, blue)

  const t = Math.floor(5 * tick / 120)
  matrix.setPixel(3, t, white)
  matrix.setPixel(4, t, white)

  matrix.update()
}
Timer.repeat(() => {
  if (!on) {
    return
  }

  tick = Math.floor(Math.random() * 120)
  render(tick)
  const v = 800 + Math.floor(Math.sin((2 * Math.PI * tick) / 120) * 200)
  pwm.write(v)
}, 1000 * 3)
