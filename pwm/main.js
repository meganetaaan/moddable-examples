import PWM from 'pins/pwm'
import Timer from 'timer'

const pwm = new PWM({
  pin: 25
})

let tick = 0
Timer.repeat(() => {
  tick = tick + 1 % 120
  const v = 512 + 256 + Math.sin(2 * Math.PI * tick / 120) * 256
  trace(v + '\n')
  pwm.write(v)
}, 1000 / 60)
