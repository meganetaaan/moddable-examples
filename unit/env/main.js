/* global trace */

import { Application, Style, Skin, Label, Behavior, Column } from 'piu/MC'
import { hsl, rgb } from 'piu/All'
import DHT12 from './dht12'

const dht12 = new DHT12()
const FONT = 'OpenSans-Semibold-16'
const INTERVAL = 2000
const TEMP_MAX = 35
const TEMP_MIN = 5
const TEMP_RANGE = TEMP_MAX - TEMP_MIN
const HUE_RANGE = 270

function temperatureToColor (temperature) {
  const clampedTemp = Math.max(Math.min(temperature, TEMP_MAX), TEMP_MIN)
  const hue = ((TEMP_MAX - clampedTemp) * HUE_RANGE) / TEMP_RANGE
  return hsl(hue, 1, 0.5)
}

function createSkin (temperature) {
  const fill = temperatureToColor(temperature)
  return new Skin({ fill })
}

const HumidityLabel = Label.template((_) => ({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  loop: true,
  interval: 1000,
  skin: new Skin({ fill: rgb(22, 22, 22) }),
  style: new Style({ font: FONT, color: 'white' }),
  Behavior: class HumidityBehavior extends Behavior {
    onDisplaying (content) {
      trace('hum label start')
      content.start()
    }
    onTimeChanged (content) {
      const humidity = dht12.readHumidity()
      content.string = `${humidity.toFixed(1)}%`
    }
  }
}))

const TemperatureLabel = Label.template((_) => ({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  interval: INTERVAL,
  loop: true,
  style: new Style({ font: FONT, color: 'white' }),
  Behavior: class TemperatureBehavior extends Behavior {
    update (content, temperature) {
      content.string = `${temperature.toFixed(1)}C`
      content.skin = createSkin(temperature)
    }
    onDisplaying (content) {
      trace('temp label start')
      content.start()
    }
    onTimeChanged (content) {
      const temperature = dht12.readTemperature()
      content.delegate('update', temperature)
    }
  }
}))

const application = new Application(null, {
  contents: [
    new Column(null, {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      contents: [new TemperatureLabel(), new HumidityLabel()]
    })
  ]
})

trace(application)
