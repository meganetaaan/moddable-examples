/*
 * Copyright (c) 2019-2020 Shinya Ishikawa
 *
 */
import I2C from 'pins/i2c'
import Timer from 'timer'

const REGISTORY = {
  READ: [0x2C, 0x06]
};
Object.freeze(REGISTORY);

const SCALE = {
  CELSIUS: 1,
  KELVIN: 2,
  FAHRENHEIT: 3
}
Object.freeze(SCALE);

export default class SHT3X extends I2C {
  constructor(dictionary) {
    super({ address: 0x44, ...dictionary })
    this._scale = dictionary.scale ?? SCALE.CELSIUS
  }

  readEnvironment (s = this._scale) {
    this.write(...REGISTORY.READ)
    Timer.delay(20);

    const bytes = this.read(6)
    const cTemp = ((((bytes[0] << 8) + bytes[1]) * 175) / 65535) - 45
    let temperature
    switch (s) {
      case SCALE.CELSIUS:
        temperature = cTemp
        break
      case SCALE.FAHRENHEIT:
        temperature = cTemp * 1.8 + 32
        break
      case SCALE.KELVIN:
        temperature = cTemp + 273.15
        break
      default:
        throw new Error('Scale not supported')
    }
    const humidity = (((bytes[3] << 8) + bytes[4]) * 100) / 65535
    return {
      temperature,
      humidity
    }
  }
}
