import Bitmap from 'commodetto/Bitmap'
import config from 'mc/config'
import NeoPixel from 'neopixel'
import NeoMatrix from './neomatrix.js'
import { rgb565ToRGB } from './neomatrix-utils.js'

export default class NeoMatrixDisplay {
  #active = false
  #brightness
  #format
  #matrix
  #position = 0
  #update

  constructor (options) {
    if (!options || typeof options !== 'object') throw new TypeError('options required')

    const defaults = config.neomatrix ?? {}
    const width = 'width' in options ? options.width : defaults.width
    const height = 'height' in options ? options.height : defaults.height
    const pin = 'pin' in options ? options.pin : defaults.pin
    const order = 'order' in options ? options.order : (defaults.order ?? 'GRB')
    const layout = 'layout' in options ? options.layout : (defaults.layout ?? 'serpentine')
    const format = 'format' in options ? options.format : Bitmap.RGB565LE
    const brightness = 'brightness' in options
      ? options.brightness
      : (defaults.brightness ?? 0.125)

    if (!Number.isInteger(width) || width <= 0) throw new RangeError('invalid width')
    if (!Number.isInteger(height) || height <= 0) throw new RangeError('invalid height')
    if (!Number.isInteger(pin) || pin < 0) throw new RangeError('invalid pin')
    if (format !== Bitmap.RGB565LE) throw new RangeError('unsupported pixel format')
    if (typeof brightness !== 'number' || !Number.isFinite(brightness) ||
        brightness < 0 || brightness > 1) {
      throw new RangeError('invalid brightness')
    }
    if ('rotation' in options && options.rotation !== 0) throw new RangeError('unsupported rotation')
    if ('flip' in options && options.flip !== '') throw new RangeError('unsupported flip')

    if ('target' in options) this.target = options.target

    let lights
    try {
      lights = new NeoPixel({ length: width * height, pin, order })
      lights.brightness = Math.round(brightness * 255)
      this.#matrix = new NeoMatrix({ lights, width, height, layout })
    } catch (error) {
      lights?.close()
      throw error
    }

    this.#format = format
    this.#brightness = brightness
  }

  configure (options) {
    if (!options || typeof options !== 'object') throw new TypeError('options required')
    if (!this.#matrix) throw new Error('display closed')

    if ('format' in options && options.format !== this.#format) {
      throw new RangeError('unsupported pixel format')
    }
    if ('rotation' in options && options.rotation !== 0) throw new RangeError('unsupported rotation')
    if ('flip' in options && options.flip !== '') throw new RangeError('unsupported flip')

    if ('brightness' in options) {
      const brightness = options.brightness
      if (typeof brightness !== 'number' || !Number.isFinite(brightness) ||
          brightness < 0 || brightness > 1) {
        throw new RangeError('invalid brightness')
      }
      this.#brightness = brightness
      this.#matrix.brightness = Math.round(brightness * 255)
    }
  }

  get configuration () {
    if (!this.#matrix) throw new Error('display closed')
    return { brightness: this.#brightness, format: this.#format, rotation: 0, flip: '' }
  }

  begin (options = {}) {
    if (!this.#matrix) throw new Error('display closed')
    if (!options || typeof options !== 'object') throw new TypeError('options must be an object')

    const x = 'x' in options ? options.x : 0
    const y = 'y' in options ? options.y : 0
    const width = 'width' in options ? options.width : this.width
    const height = 'height' in options ? options.height : this.height
    const continuing = 'continue' in options ? options.continue : false

    if (![x, y, width, height].every(Number.isInteger) ||
        x < 0 || y < 0 || width <= 0 || height <= 0 ||
        (x + width) > this.width || (y + height) > this.height) {
      throw new RangeError('invalid update area')
    }
    if (typeof continuing !== 'boolean') throw new TypeError('continue must be boolean')
    if (this.#active && !continuing) throw new Error('display update already active')

    this.#active = true
    this.#position = 0
    this.#update = { x, y, width, height }
  }

  send (pixels, offset = 0, byteLength = pixels?.byteLength - offset) {
    if (!this.#matrix) throw new Error('display closed')
    if (!this.#active) throw new Error('display update not active')
    if (!pixels) throw new TypeError('pixels required')
    if (!Number.isInteger(offset) || !Number.isInteger(byteLength) ||
        offset < 0 || byteLength < 0 || (byteLength & 1)) {
      throw new RangeError('invalid pixel range')
    }

    const bytes = ArrayBuffer.isView(pixels)
      ? new Uint8Array(pixels.buffer, pixels.byteOffset, pixels.byteLength)
      : new Uint8Array(pixels)
    if ((offset + byteLength) > bytes.byteLength) throw new RangeError('pixel range exceeds buffer')

    const update = this.#update
    const pixelCount = byteLength >> 1
    if ((this.#position + pixelCount) > (update.width * update.height)) {
      throw new RangeError('too many pixels')
    }

    const matrix = this.#matrix
    for (let index = offset, end = offset + byteLength; index < end; index += 2) {
      const rgb = rgb565ToRGB(bytes[index] | (bytes[index + 1] << 8))
      const position = this.#position++
      const x = update.x + (position % update.width)
      const y = update.y + Math.floor(position / update.width)
      matrix.setPixel(x, y, matrix.makeRGB(rgb >> 16, (rgb >> 8) & 0xff, rgb & 0xff))
    }
  }

  end () {
    if (!this.#matrix) throw new Error('display closed')
    if (!this.#active) throw new Error('display update not active')

    this.#matrix.update()
    this.#active = false
    this.#update = undefined
    this.#position = 0
  }

  adaptInvalid (area) {
    if (!this.#matrix) throw new Error('display closed')
    if (!area || typeof area !== 'object') throw new TypeError('area required')
  }

  close () {
    this.#matrix?.close()
    this.#matrix = undefined
    this.#active = false
    this.#update = undefined
  }

  get width () {
    if (!this.#matrix) throw new Error('display closed')
    return this.#matrix.width
  }

  get height () {
    if (!this.#matrix) throw new Error('display closed')
    return this.#matrix.height
  }

  get pixelFormat () {
    if (!this.#matrix) throw new Error('display closed')
    return this.#format
  }

  get async () {
    return false
  }

  get clut () {
    return null
  }

  set clut (_value) {
    if (!this.#matrix) throw new Error('display closed')
  }

  get c_dispatch () {
    return null
  }

  get frameBuffer () {
    return false
  }

  static {
    this.prototype[Symbol.dispose] = this.prototype.close
  }
}
