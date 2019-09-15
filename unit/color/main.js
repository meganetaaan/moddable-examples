/* global trace */

import { Application, Style, Skin, Label } from 'piu/MC'
import { hsl, rgb } from 'piu/All'
import { hslToRgb, rgbToHsl } from 'color-converter'
import TCS34725 from 'tcs34725'

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
      string: 'hello'
    })
  ]
})

const sensor = new TCS34725()
sensor.enable()
global.button.a.onChanged = function () {
  const v = this.read()
  if (v) {
    const { r, g, b } = sensor.getRGB()
    const { h, s, l } = rgbToHsl(r, g, b)

    const fill = hsl(h, s * 5, 0.5)
    application.first.skin = new Skin({ fill })

    const color = hslToRgb(h, s, l)
    const str = '#' + (rgb(color.r, color.g, color.b) >> 8).toString(16)
    trace(str + '\n')

    application.first.string = str
  }
}
