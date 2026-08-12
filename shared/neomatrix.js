import { matrixPixelIndex } from './neomatrix-utils.js'

export class NeoMatrix {
  #height
  #layout
  #lights
  #width

  constructor (options) {
    if (!options || typeof options !== 'object') throw new TypeError('options required')

    const { lights, width, height, layout = 'serpentine' } = options
    if (!lights || typeof lights.setPixel !== 'function') throw new TypeError('lights required')
    if (!Number.isInteger(width) || width <= 0) throw new RangeError('invalid width')
    if (!Number.isInteger(height) || height <= 0) throw new RangeError('invalid height')
    if ((width * height) > lights.length) throw new RangeError('matrix exceeds light count')
    if (layout !== 'serpentine' && layout !== 'columns-reversed') {
      throw new RangeError(`unsupported matrix layout: ${layout}`)
    }

    if ('target' in options) this.target = options.target
    this.#lights = lights
    this.#width = width
    this.#height = height
    this.#layout = layout
  }

  setPixel (x, y, color) {
    this.#lights.setPixel(
      matrixPixelIndex(x, y, this.#width, this.#height, this.#layout),
      color
    )
  }

  fill (color, index, count) {
    const lights = this.#lights
    if (index === undefined) lights.fill(color)
    else if (count === undefined) lights.fill(color, index)
    else lights.fill(color, index, count)
  }

  update () {
    this.#lights.update()
  }

  makeRGB (red, green, blue) {
    return this.#lights.makeRGB(red, green, blue)
  }

  makeHSB (hue, saturation, brightness) {
    return this.#lights.makeHSB(hue, saturation, brightness)
  }

  close () {
    this.#lights?.close()
    this.#lights = undefined
  }

  get width () {
    return this.#width
  }

  get height () {
    return this.#height
  }

  get length () {
    return this.#width * this.#height
  }

  get brightness () {
    return this.#lights.brightness
  }

  set brightness (value) {
    this.#lights.brightness = value
  }

  static {
    this.prototype[Symbol.dispose] = this.prototype.close
  }
}

export default NeoMatrix
