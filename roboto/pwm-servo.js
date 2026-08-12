export default class PWMServo {
  #io
  #max
  #min
  #period
  #range

  constructor (options = {}) {
    const {
      io,
      min = 1_000,
      max = 2_000,
      hz = 50,
      target,
      ...pwmOptions
    } = options

    if (typeof io !== 'function') throw new TypeError('io required')
    if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || min >= max) {
      throw new RangeError('invalid pulse range')
    }
    if (!Number.isFinite(hz) || hz <= 0 || max >= 1_000_000 / hz) {
      throw new RangeError('invalid frequency')
    }

    if ('target' in options) this.target = target

    this.#min = min
    this.#max = max
    this.#period = 1_000_000 / hz
    this.#io = new io({ ...pwmOptions, hz })
    this.#range = (2 ** this.#io.resolution) - 1
  }

  write (angle) {
    if (!Number.isFinite(angle) || angle < 0 || angle > 180) {
      throw new RangeError('angle must be from 0 to 180')
    }

    const pulse = this.#min + ((this.#max - this.#min) * angle / 180)
    this.#io.write(Math.round(pulse * this.#range / this.#period))
  }

  close () {
    this.#io?.close()
    this.#io = undefined
  }

  static {
    this.prototype[Symbol.dispose] = this.prototype.close
  }
}
