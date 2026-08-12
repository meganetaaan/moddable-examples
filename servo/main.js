import { Application, Style, Skin, Label } from 'piu/MC'
import ServoHat from 'servo-hat'

const FONT = 'OpenSans-Regular-52'

const application = new Application(null, {
  contents: [
    new Label(null, {
      style: new Style({ font: FONT, color: 'white' }),
      skin: new Skin({ fill: 'black' }),
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      string: '0'
    })
  ]
})

const servo = new ServoHat({
  sensor: {
    ...device.I2C.default,
    address: 0x53
  }
})

let angle = 0

function countup () {
  angle = (angle + 30) % 210
  application.first.string = String(angle)
  servo.setAngle(angle)
}

globalThis.button.a.onChanged = function () {
  if (this.read()) {
    countup()
  }
}
