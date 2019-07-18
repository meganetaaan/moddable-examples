/* global trace */

import { Application, Style, Skin, Label, Behavior, Column } from 'piu/MC'
import { hsl, rgb } from 'piu/All'
import Timer from 'timer'
import TCS34725 from './tcs34725'

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

const tcs = new TCS34725()
const c = new ColorProvider(tcs)
c.onStart = sensor => {
  sensor.enable()
}
c.onStop = sensor => {
  sensor.disable()
}
c.onRGB = ({ r, g, b }) => {
  trace(`R: ${Math.floor(r)}, G: ${Math.floor(g)}, B: ${Math.floor(b)}\n`)
}

c.start()
