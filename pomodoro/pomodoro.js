import Timer from 'timer'

const WORK_TIME = 60 * 1000 * 25
const BREAK_TIME = 60 * 1000 * 5
const TICK = 1000
const MODE = Object.freeze({
  WORK: 'WORK',
  BREAK: 'BREAK'
})

function noop () {
  // Nothing to do
}

/**
 * Pomodoro Timer
 */
class Pomodoro {
  #handler
  #mode = MODE.WORK

  onStart
  onPause
  onFinish
  onReset
  onTick

  constructor({ onStart = noop, onPause = noop, onFinish = noop, onReset = noop, onTick = noop }) {
    this.onStart = onStart
    this.onPause = onPause
    this.onFinish = onFinish
    this.onReset = onReset
    this.onTick = onTick
    this.reset(MODE.WORK)
  }

  start () {
    if (this.#handler !== undefined) return

    this.#handler = Timer.repeat(this.#tick.bind(this), TICK)
    this.onStart(this.time, this.mode)
  }

  pause () {
    if (this.#handler !== undefined) {
      Timer.clear(this.#handler)
      this.#handler = undefined
    }
    this.onPause(this.time, this.mode)
  }

  reset (mode = this.#mode) {
    if (mode !== MODE.WORK && mode !== MODE.BREAK) {
      throw new RangeError('mode must be MODE.WORK or MODE.BREAK')
    }

    this.pause()
    this.#mode = mode
    this.time = mode === MODE.WORK ? WORK_TIME : BREAK_TIME
    this.onReset(this.time, this.#mode)
  }

  #tick () {
    this.time = Math.max(0, this.time - TICK)
    this.onTick(this.time, this.mode)
    if (this.time === 0) {
      this.pause()
      this.onFinish(this.time, this.mode)
    }
  }

  close () {
    this.pause()
  }

  get isPlaying () {
    return this.#handler !== undefined
  }

  get mode () {
    return this.#mode
  }

  static {
    this.prototype[Symbol.dispose] = this.prototype.close
  }
}

export default Pomodoro
export { MODE }
