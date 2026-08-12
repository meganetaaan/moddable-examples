/*
 * VL53L0X initialization sequence adapted from M5Stack M5Unit-TOF (MIT).
 * Copyright (c) 2024 M5Stack Technology CO LTD
 * https://github.com/m5stack/M5Unit-TOF
 */

import Timer from 'timer'

const Register = Object.freeze({
  RANGE_START: 0x00,
  SEQUENCE_CONFIG: 0x01,
  INTERRUPT_CONFIG: 0x0a,
  INTERRUPT_CLEAR: 0x0b,
  INTERRUPT_STATUS: 0x13,
  RANGE_STATUS: 0x14,
  MSRC_CONFIG_CONTROL: 0x60,
  GPIO_ACTIVE_HIGH: 0x84,
  EXTERNAL_SUPPLY: 0x89,
  MODEL_ID: 0xc0,
  SOFT_RESET: 0xbf
})

const DEFAULT_VALUES = Uint8Array.of(
  0xff, 0x01, 0x00, 0x00, 0xff, 0x00, 0x09, 0x00,
  0x10, 0x00, 0x11, 0x00, 0x24, 0x01, 0x25, 0xff,
  0x75, 0x00, 0xff, 0x01, 0x4e, 0x2c, 0x48, 0x00,
  0x30, 0x20, 0xff, 0x00, 0x30, 0x09, 0x54, 0x00,
  0x31, 0x04, 0x32, 0x03, 0x40, 0x83, 0x46, 0x25,
  0x60, 0x00, 0x27, 0x00, 0x50, 0x06, 0x51, 0x00,
  0x52, 0x96, 0x56, 0x08, 0x57, 0x30, 0x61, 0x00,
  0x62, 0x00, 0x64, 0x00, 0x65, 0x00, 0x66, 0xa0,
  0xff, 0x01, 0x22, 0x32, 0x47, 0x14, 0x49, 0xff,
  0x4a, 0x00, 0xff, 0x00, 0x7a, 0x0a, 0x7b, 0x00,
  0x78, 0x21, 0xff, 0x01, 0x23, 0x34, 0x42, 0x00,
  0x44, 0xff, 0x45, 0x26, 0x46, 0x05, 0x40, 0x40,
  0x0e, 0x06, 0x20, 0x1a, 0x43, 0x40, 0xff, 0x00,
  0x34, 0x03, 0x35, 0x44, 0xff, 0x01, 0x31, 0x04,
  0x4b, 0x09, 0x4c, 0x05, 0x4d, 0x04, 0xff, 0x00,
  0x44, 0x00, 0x45, 0x20, 0x47, 0x08, 0x48, 0x28,
  0x67, 0x00, 0x70, 0x04, 0x71, 0x01, 0x72, 0xfe,
  0x76, 0x00, 0x77, 0x00, 0xff, 0x01, 0x0d, 0x01,
  0xff, 0x00, 0x80, 0x01, 0x01, 0xf8, 0xff, 0x01,
  0x8e, 0x01, 0x00, 0x01, 0xff, 0x00, 0x80, 0x00
)

const SEQUENCE_STEPS = 0xe8
const VALID_MODEL_ID = 0xee
const VALID_RANGE_STATUS = 11
const MAX_RANGE_CM = 200
const TIMEOUT_MS = 1_000

export default class VL53L0X {
  #io
  #stop = 0xff
  #values = new Uint8Array(12)

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
      this.#initialize()
    } catch (error) {
      io.close()
      this.#io = undefined
      throw error
    }
  }

  sample () {
    const io = this.#io

    io.writeUint8(0x80, 0x01)
    io.writeUint8(0xff, 0x01)
    io.writeUint8(0x00, 0x00)
    io.writeUint8(0x91, this.#stop)
    io.writeUint8(0x00, 0x01)
    io.writeUint8(0xff, 0x00)
    io.writeUint8(0x80, 0x00)
    io.writeUint8(Register.RANGE_START, 0x01)

    let started = false
    for (let attempt = 0; attempt < TIMEOUT_MS; attempt += 1) {
      if (!(io.readUint8(Register.RANGE_START) & 0x01)) {
        started = true
        break
      }
      Timer.delay(1)
    }
    if (!started) return this.#invalidSample()

    if (!this.#waitForInterrupt()) return this.#invalidSample()

    try {
      io.readBuffer(Register.RANGE_STATUS, this.#values)
    } finally {
      io.writeUint8(Register.INTERRUPT_CLEAR, 0x01)
    }

    const status = (this.#values[0] & 0x78) >> 3
    if (status !== VALID_RANGE_STATUS) return this.#invalidSample()

    const distance = ((this.#values[10] << 8) | this.#values[11]) / 10
    return {
      proximity: {
        distance,
        near: distance <= MAX_RANGE_CM,
        max: MAX_RANGE_CM
      }
    }
  }

  close () {
    this.#io?.close()
    this.#io = undefined
  }

  #initialize () {
    const io = this.#io
    if (io.readUint8(Register.MODEL_ID) !== VALID_MODEL_ID) {
      throw new Error('unexpected VL53L0X sensor')
    }

    io.writeUint8(Register.SOFT_RESET, 0x00)
    Timer.delay(1)
    io.writeUint8(Register.SOFT_RESET, 0x01)
    Timer.delay(1)

    const supply = io.readUint8(Register.EXTERNAL_SUPPLY)
    io.writeUint8(Register.EXTERNAL_SUPPLY, supply | 0x01)

    io.writeUint8(0x88, 0x00)
    io.writeUint8(0x80, 0x01)
    io.writeUint8(0xff, 0x01)
    io.writeUint8(0x00, 0x00)
    this.#stop = io.readUint8(0x91)
    io.writeUint8(0x00, 0x01)
    io.writeUint8(0xff, 0x00)
    io.writeUint8(0x80, 0x00)

    const control = io.readUint8(Register.MSRC_CONFIG_CONTROL)
    io.writeUint8(Register.MSRC_CONFIG_CONTROL, control | 0x12)
    this.#writeValues(DEFAULT_VALUES)

    io.writeUint8(Register.INTERRUPT_CONFIG, 0x04)
    const activeHigh = io.readUint8(Register.GPIO_ACTIVE_HIGH)
    io.writeUint8(Register.GPIO_ACTIVE_HIGH, activeHigh & ~0x10)
    io.writeUint8(Register.INTERRUPT_CLEAR, 0x01)
    io.writeUint8(Register.SEQUENCE_CONFIG, SEQUENCE_STEPS)

    this.#calibrate(true)
    this.#calibrate(false)
    io.writeUint8(Register.SEQUENCE_CONFIG, SEQUENCE_STEPS)
  }

  #writeValues (values) {
    for (let index = 0; index < values.length; index += 2) {
      this.#io.writeUint8(values[index], values[index + 1])
    }
  }

  #calibrate (vhv) {
    const io = this.#io
    io.writeUint8(Register.SEQUENCE_CONFIG, vhv ? 0x01 : 0x02)
    io.writeUint8(Register.RANGE_START, (vhv ? 0x40 : 0x00) | 0x01)
    if (!this.#waitForInterrupt()) throw new Error('VL53L0X calibration timed out')
    io.writeUint8(Register.INTERRUPT_CLEAR, 0x01)
    io.writeUint8(Register.RANGE_START, 0x00)
  }

  #waitForInterrupt () {
    for (let attempt = 0; attempt < TIMEOUT_MS; attempt += 1) {
      if (this.#io.readUint8(Register.INTERRUPT_STATUS) & 0x07) return true
      Timer.delay(1)
    }
    return false
  }

  #invalidSample () {
    return {
      proximity: {
        distance: null,
        near: false,
        max: MAX_RANGE_CM
      }
    }
  }

  static {
    this.prototype[Symbol.dispose] = this.prototype.close
  }
}
