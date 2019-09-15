/*
 * Copyright (c) 2019 Shinya Ishikawa
 *
 */
import I2C from 'pins/i2c'
const ADDRESS = 0x29
const INTEGRATION_TIME = {
  TIME_2_4MS: 0xff,
  TIME_24MS: 0xf6,
  TIME_50MS: 0xeb,
  TIME_101MS: 0xd5,
  TIME_154MS: 0xc0,
  TIME_700MS: 0x00
}
const GAIN = {
  GAIN_1X: 0x00,
  GAIN_4X: 0x01,
  GAIN_16X: 0x02,
  GAIN_60X: 0x03
}
const WHOAMI = 0x12
const COMMAND_BIT = 0x80
const ATIME = 0x01
const CONTROL = 0x0f
const CDATAL = 0x14
const RDATAL = 0x16
const GDATAL = 0x18
const BDATAL = 0x1a
const ENABLE = 0x00
const ENABLE_PON = 0x01
const ENABLE_AEN = 0x02

export default class TCS34725 {
  #i2c
  #integrationTime = INTEGRATION_TIME.TIME_154MS
  #gain = GAIN.GAIN_4X
  constructor (
    dictionary = {
      address: ADDRESS,
      integrationTime: INTEGRATION_TIME.TIME_154MS,
      gain: GAIN.GAIN_4X
    }
  ) {
    this.#i2c = new I2C(dictionary)
    this.#integrationTime = dictionary.integrationTime
    this.#gain = dictionary.gain
    this.init()
  }

  #read8 (reg) {
    this.#i2c.write(COMMAND_BIT | reg)
    return this.#i2c.read(1)[0]
  }

  #read16 (reg) {
    this.#i2c.write(COMMAND_BIT | reg)
    const buf = this.#i2c.read(2)
    const t = buf[0]
    const x = buf[1]
    return (x << 8) | t
  }

  #write8 (reg, value) {
    this.#i2c.write(COMMAND_BIT | reg, value & 0xff)
  }

  init () {
    // make sure connected
    const whoami = this.#read8(WHOAMI)
    if (whoami !== 0x44 && whoami !== 0x10) {
      throw new Error('Sensor not connected')
    }

    this.setIntegrationTime(this.#integrationTime)
    this.setGain(this.#gain)
  }

  enable () {
    this.#write8(ENABLE, ENABLE_PON)
    this.#write8(ENABLE, ENABLE_PON | ENABLE_AEN)
  }

  disable () {
    const reg = this.#read8(ENABLE)
    this.#write8(ENABLE, reg & ~(ENABLE_PON | ENABLE_AEN))
  }

  setIntegrationTime (integrationTime) {
    this.#write8(ATIME, integrationTime)
    this.#integrationTime = integrationTime
  }

  setGain (gain) {
    this.#write8(CONTROL, gain)
    this.#gain = gain
  }

  getRawData () {
    const c = this.#read16(CDATAL)
    const r = this.#read16(RDATAL)
    const g = this.#read16(GDATAL)
    const b = this.#read16(BDATAL)
    return { c, r, g, b }
  }

  getRGB () {
    const rawData = this.getRawData()
    if (rawData.c === 0) {
      return {
        r: 0,
        g: 0,
        b: 0
      }
    }

    return {
      r: (rawData.r / rawData.c) * 256.0 * 0.9,
      g: (rawData.g / rawData.c) * 256.0,
      b: (rawData.b / rawData.c) * 256.0 * 1.1
    }
  }
}
