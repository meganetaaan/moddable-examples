/*
 * Copyright (c) 2019-2026 Shinya Ishikawa
 *
 * Initialization and data-ready handling follow the M5Stack M5Unit-COLOR
 * driver (MIT): https://github.com/m5stack/M5Unit-COLOR
 */

import Timer from 'timer'

const Register = Object.freeze({
  ENABLE: 0x00,
  ATIME: 0x01,
  CONTROL: 0x0f,
  ID: 0x12,
  STATUS: 0x13,
  CDATAL: 0x14
})

const COMMAND = 0x80
const AUTO_INCREMENT = 0x20
const POWER_ON = 0x01
const RGBC_ENABLE = 0x02
const DATA_VALID = 0x01

export default class TCS34725 {
  #io
  #command = new Uint8Array(1)
  #byte = new Uint8Array(1)
  #values = new Uint8Array(8)

  constructor (options = {}) {
    const { sensor } = options
    if (typeof sensor?.io !== 'function') throw new TypeError('sensor.io required')

    if ('target' in options) this.target = options.target
    const io = this.#io = new sensor.io({
      address: 0x29,
      hz: 400_000,
      ...sensor
    })

    try {
      const id = this.#readRegister(Register.ID)
      if ((id !== 0x44) && (id !== 0x10)) {
        throw new Error('unexpected TCS34725 sensor')
      }

      this.#writeRegister(Register.ATIME, 0xeb) // 50 ms
      this.#writeRegister(Register.CONTROL, 0x01) // 4x gain
      this.#writeRegister(Register.ENABLE, POWER_ON)
      Timer.delay(3)
      this.#writeRegister(Register.ENABLE, POWER_ON | RGBC_ENABLE)
    } catch (error) {
      io.close()
      this.#io = undefined
      throw error
    }
  }

  sample () {
    if (!(this.#readRegister(Register.STATUS) & DATA_VALID)) return

    this.#command[0] = COMMAND | AUTO_INCREMENT | Register.CDATAL
    this.#io.write(this.#command)
    this.#io.read(this.#values)

    const values = this.#values
    return {
      color: {
        clear: values[0] | (values[1] << 8),
        red: values[2] | (values[3] << 8),
        green: values[4] | (values[5] << 8),
        blue: values[6] | (values[7] << 8)
      }
    }
  }

  close () {
    const io = this.#io
    if (!io) return

    try {
      const enable = this.#readRegister(Register.ENABLE)
      this.#writeRegister(Register.ENABLE, enable & ~(POWER_ON | RGBC_ENABLE))
    } finally {
      io.close()
      this.#io = undefined
    }
  }

  #readRegister (register) {
    this.#command[0] = COMMAND | register
    this.#io.write(this.#command)
    this.#io.read(this.#byte)
    return this.#byte[0]
  }

  #writeRegister (register, value) {
    this.#io.write(Uint8Array.of(COMMAND | register, value))
  }

  static {
    this.prototype[Symbol.dispose] = this.prototype.close
  }
}
