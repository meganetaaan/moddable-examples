/* global trace */

import { Application, Style, Skin, Label, Behavior, Column } from 'piu/MC'
import { hsl, rgb } from 'piu/All'
import Timer from 'timer'
import TCS34725 from './tcs34725'

const FONT = 'OpenSans-Semibold-16'

if (global.power) {
  global.power.setBrightness(10)
}

class ColorProvider {
  constructor (sensor, interval = 2000) {
    this._sensor = sensor
    this._interval = interval
    this._handlerId = null
  }
  start () {
    this.onStart(this._sensor)
    if (this._handlerId != null) {
      return
    }
    this._handlerId = Timer.repeat(() => {
      const color = this._sensor.getRGB()
      this.onRGB(color)
    }, this._interval)
  }
  stop () {
    this.onStop(this._sensor)
    if (this._handlerId == null) {
      return
    }
    Timer.clear(this._handlerId)
    this._handlerId = null
  }
  onRGB (color) {
    // noop, to be overridden.
  }
  onStart (sensor) {
    // noop, can be overridden.
  }
  onStop (sensor) {
    // noop, can be overridden.
  }
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

const tcs = new TCS34725()
const c = new ColorProvider(tcs)
c.onStart = sensor => {
  sensor.enable()
}
c.onStop = sensor => {
  sensor.disable()
}
c.onRGB = ({ r, g, b }) => {
  const str = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`
  trace(str + '\n')
  application.first.string = str

  const fill = rgb(r, g, b)
  application.first.skin = new Skin({ fill })
}

c.start()
