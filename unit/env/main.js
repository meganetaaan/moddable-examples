/* global trace, hls, max, min */

import { Application, Style, Skin, Label, Behavior, Column } from 'piu/MC'
import DHT12 from './dht12'

const dht12 = new DHT12()
const FONT = 'OpenSans-Semibold-16'
const INTERVAL = 2000

function temperatureToColor (temperature) {
  const clampedTemp = max(min(temperature, 0), 40)
  const hue = (clampedTemp * 270) / 40
  return hls(hue, 1, 0.4)
}

const HumidityLabel = Label.template((_) => ({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  loop: true,
  interval: INTERVAL,
  skin: new Skin({ fill: 'gray' }),
  style: new Style({ font: FONT }),
  Behavior: class HumidityBehavior extends Behavior {
    onDisplaying (content) {
      trace('hum label start')
      content.start()
    }
    onTimeChanged (content) {
      // const humidity = dht12.readHumidity()
      content.string = `${50}%`
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
  createSkin (temperature) {
    const fill = temperatureToColor(temperature)
    return new Skin({ fill })
  },
  update (temperature) {
    this.string = `${temperature}C`
    this.skin = this.createSkin(temperature)
  },
  Behavior: class TemperatureBehavior extends Behavior {
    onDisplaying (content) {
      trace('temp label start')
      content.start()
    }
    onTimeChanged (content) {
      const temperature = dht12.readTemperature()
      content.update(temperature)
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
      contents: [new HumidityLabel(), new TemperatureLabel()]
    })
  ]
})

trace(application)
