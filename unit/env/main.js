import { Application, Style, Skin, Label, Column } from 'piu/MC'
import { rgb } from 'piu/All'
import temperatureToColor from 'temperatureToColor'
import EnvSensor from 'dht12'
import Timer from 'timer'
import config from 'mc/config'

if (globalThis.power) {
  globalThis.power.setBrightness(8)
}

const envSensor = new EnvSensor({
  sensor: device.I2C[config.unit_i2c]
})
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

new Application(null, {
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
Timer.repeat(() => {
  const { hygrometer, thermometer } = envSensor.sample()
  if (thermometer.temperature === undefined || hygrometer.humidity === undefined) return

  temperatureLabel.string = `${thermometer.temperature.toFixed(1)}C`
  temperatureLabel.skin = new Skin({ fill: temperatureToColor(thermometer.temperature) })

  humidityLabel.string = `${hygrometer.humidity.toFixed(1)}%`
}, INTERVAL)
