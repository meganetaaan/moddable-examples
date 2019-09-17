/*
 * Copyright (c) 2019 Shinya Ishikawa
 *
 */
import I2C from 'pins/i2c'

const SCALE = {
  CELSIUS: 1,
  KELVIN: 2,
  FAHRENHEIT: 3
}

export default class DHT12 extends I2C {
  constructor (dictionary = { address: 0x5c, scale: SCALE.CELSIUS }) {
    super(dictionary)
    this._scale = dictionary.scale
  }

  readEnvironment (s = this._scale) {
    this.write(0)
    const bytes = this.read(4)
    let temperature
    switch (s) {
      case SCALE.CELSIUS:
        temperature = bytes[2] + bytes[3] / 10
        break
      case SCALE.FAHRENHEIT:
        temperature = (bytes[2] + bytes[3] / 10) * 1.8 + 32
        break
      case SCALE.KELVIN:
        temperature = (bytes[2] + bytes[3] / 10) + 273.15
        break
      default:
        throw new Error('Scale not supported')
    }
    const humidity = bytes[0] + bytes[1] / 10
    return {
      temperature,
      humidity
    }
  }
}
