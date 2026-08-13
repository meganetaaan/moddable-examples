export default class ServoHat {
  #io
  #id

  constructor (options = {}) {
    const { sensor, id = 0 } = options
    if (typeof sensor?.io !== 'function') throw new TypeError('sensor.io required')
    if (!Number.isInteger(id) || id < 0 || id > 15) {
      throw new RangeError('id must be an integer from 0 to 15')
    }

    if ('target' in options) this.target = options.target
    this.#id = id
    this.#io = new sensor.io({
      address: 0x53,
      hz: 100_000,
      ...sensor
    })
  }

  setAngle (angle) {
    if (!Number.isFinite(angle) || angle < 0 || angle > 180) {
      throw new RangeError('angle must be from 0 to 180')
    }
    this.#io.write(Uint8Array.of(0x10 | this.#id, Math.round(angle)))
  }

  close () {
    this.#io?.close()
    this.#io = undefined
  }

  static {
    this.prototype[Symbol.dispose] = this.prototype.close
  }
}
