/* global trace */

import { Application, Style, Skin, Label } from 'piu/MC'
import { hsl, rgb } from 'piu/All'
import Timer from 'timer'
import TCS34725 from './tcs34725'

const FONT = 'OpenSans-Semibold-16'

function hslToRgb (h, s, l) {
  let min, max
  if (l < 0.5) {
    max = 255 * (l + l * s)
    min = 255 * (l - l * s)
  } else {
    max = 255 * (l + (1 - l) * s)
    min = 255 * (l - (1 - l) * s)
  }

  let r, g, b
  if (h < 60) {
    r = max
    g = (h / 60) * (max - min) + min
    b = min
  } else if (h < 120) {
    r = ((120 - h) / 60) * (max - min) + min
    g = max
    b = min
  } else {
    r = min
    g = max
    b = ((h - 120) / 60) * (max - min) + min
  }

  return { r, g, b }
}

function rgbToHsl (r, g, b) {
  // calculate h
  let h = 0
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (r === max) {
    h = 60 * ((g - b) / (max - min))
  } else if (g === max) {
    h = 60 * ((b - r) / (max - min)) + 120
  } else if (b === max) {
    h = 60 * ((r - g) / (max - min)) + 240
  }
  if (h < 0) {
    h += 360
  }

  // calculate s
  let s
  const cnt = (max + min) / 2
  if (cnt <= 127) {
    s = (max - min) / (max + min)
  } else {
    s = (max - min) / (510 - max - min)
  }

  // calculate l
  let l = (max + min) / 510

  return { h, s, l }
}

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
      const color = this._sensor.getRGB(true)
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
  triggerOnce () {
    const color = this._sensor.getRGB(true)
    this.onRGB(color)
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
  const { h, s, l } = rgbToHsl(r, g, b)
  const fill = hsl(h, s * 5, 0.5)
  application.first.skin = new Skin({ fill })

  const color = hslToRgb(h, s, l)

  const str = '#' + (rgb(color.r, color.g, color.b) >> 8).toString(16)
  trace(str + '\n')

  application.first.string = str
}

// c.start()
tcs.enable()
global.button.a.onChanged = function () {
  const v = this.read()
  if (v) {
    c.triggerOnce()
  }
}
