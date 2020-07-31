/* global trace */

import { Application, Style, Skin, Label, Column } from 'piu/MC'
import { rgb } from 'piu/All'
import temperatureToColor from 'temperatureToColor'
import SHT3X from 'sht3x'
import Timer from 'timer'

if (global.power) {
  global.power.setBrightness(8)
}

const sht3x = new SHT3X()
const INTERVAL = 2000
const center = { top: 0, bottom: 0, left: 0, right: 0 }

const DefaultLabel = Label.template(string => ({
  skin: new Skin({ fill: rgb(22, 22, 22) }),
  style: new Style({ font: 'OpenSans-Semibold-16', color: 'white' }),
  string,
  ...center
}))

const temperatureLabel = new DefaultLabel('temp')
const humidityLabel = new DefaultLabel('hum')

const application = new Application(null, {
  contents: [
    new Column(null, {
      contents: [
        temperatureLabel,
        humidityLabel
      ],
      ...center
    })
  ]
})
trace(application)

Timer.repeat((_) => {
  const env = sht3x.readEnvironment()
  temperatureLabel.string = `${env.temperature.toFixed(1)}C`
  temperatureLabel.skin = new Skin({ fill: temperatureToColor(env.temperature) })

  humidityLabel.string = `${env.humidity.toFixed(1)}%`
}, INTERVAL)
