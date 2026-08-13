/* global trace */

import { Application, Style, Skin, Label } from 'piu/MC'
import { rgb } from 'piu/All'
import { normalizeColor, toHexColor } from 'color'
import TCS34725 from 'tcs34725'
import config from 'mc/config'

const FONT = 'OpenSans-Semibold-16'

if (global.power) {
  global.power.setBrightness(10)
}

const application = new Application(null, {
  contents: [
    new Label(null, {
      anchor: 'rgbLabel',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      skin: new Skin({ fill: 'black' }),
      style: new Style({ font: FONT, color: 'white' }),
      string: 'press A'
    })
  ]
})

const sensor = new TCS34725({ sensor: device.I2C.default })
const Digital = device.io.Digital

application.button = new Digital({
  pin: config.button_pin,
  mode: Digital.InputPullUp,
  edge: Digital.Falling,
  onReadable () {
    const sample = sensor.sample()
    if (!sample) return

    const color = normalizeColor(sample.color)
    const value = toHexColor(color)
    application.first.skin = new Skin({
      fill: rgb(color.red, color.green, color.blue)
    })
    application.first.string = value
    trace(`${value}\n`)
  }
})
