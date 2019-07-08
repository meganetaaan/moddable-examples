/* global trace */

import DHT12 from './dht12'
import Timer from 'timer'

const dht12 = new DHT12()

Timer.repeat(() => {
  trace(`Temperature: ${dht12.readTemperature()}\nHumidity: ${dht12.readHumidity()}\n`)
}, 2000)
