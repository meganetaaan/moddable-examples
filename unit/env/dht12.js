/*
 * Copyright (c) 2019-2026 Shinya Ishikawa
 */

export default class DHT12 {
  #io
  #values = new Uint8Array(5)

  constructor (options = {}) {
    const { sensor } = options
    if (typeof sensor?.io !== 'function') throw new TypeError('sensor.io required')

    if ('target' in options) this.target = options.target
    this.#io = new sensor.io({
      address: 0x5c,
      hz: 400_000,
      ...sensor
    })
  }

  sample () {
    const values = this.#values
    this.#io.write(Uint8Array.of(0))
    this.#io.read(values)

    const checksum = (values[0] + values[1] + values[2] + values[3]) & 0xff
    if (checksum !== values[4]) {
      return { hygrometer: {}, thermometer: {} }
    }

    let temperature = values[2] + (values[3] & 0x7f) / 10
    if (values[3] & 0x80) temperature = -temperature

    return {
      hygrometer: { humidity: values[0] + values[1] / 10 },
      thermometer: { temperature }
    }
  }

  close () {
    this.#io?.close()
    this.#io = undefined
  }

  static {
    this.prototype[Symbol.dispose] = this.prototype.close
  }
}
