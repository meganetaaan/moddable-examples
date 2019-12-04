/* global trace */
import { Application, Style, Skin, Label } from 'piu/MC'
import I2C from 'pins/i2c'

const FONT = 'OpenSans-Regular-52'
class Servo extends I2C {
  constructor (dictionary = { address: 0x53, id: 0 }) {
    super(dictionary)
    this._id = dictionary.id
  }
  setAngle (angle) {
    this.write(0x10 | this._id, angle)
  }
}

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

const servos = {
  a: new Servo()
}

let angle = 0

function countup () {
  angle = (angle + 30) % 210
  application.first.string = String(angle)
  servos.a.setAngle(angle)
}

global.button.a.onChanged = function () {
  if (this.read()) {
    countup()
  }
}
