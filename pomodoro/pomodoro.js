import Timer from 'timer'

const WORK_TIME = 60 * 1000 * 25
const BREAK_TIME = 60 * 1000 * 5
const TICK = 1000
const MODE = {
  WORK: 'WORK',
  BREAK: 'BREAK',
}

function noop () {
  // Nothing to do
}

/**
 * Pomodoro Timer
 */
class Pomodoro {
  /**
   * private tick handler
   */
  #handler = null

  /**
   * timer mode
   */
  #mode = MODE.WORK

  /**
   * auto start
   */
  autoStart = false

  /**
   * event handler
   */
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
  /**
   * start timer
   */
  start() {
    if (this.#handler == null) {
      this.#handler = Timer.repeat(this.#tick.bind(this), TICK)
    }
    if (this.onStart != null) {
      this.onStart(this.time, this.mode)
    }
  }

  /**
   * pause timer
   */
  pause() {
    if (this.#handler != null) {
      Timer.clear(this.#handler)
      this.#handler = null
    }
    if (this.onPause != null) {
      this.onPause(this.time, this.mode)
    }
  }

  /**
   * reset this timer
   * @param {*} mode "WORK" OR "BREAK"
   */
  reset(mode) {
    this.pause()
    if (mode != null) {
      this.#mode = mode
    }
    switch (this.#mode) {
      case MODE.WORK:
        this.time = WORK_TIME
        break
      case MODE.BREAK:
        this.time = BREAK_TIME
        break
      default:
        throw new Error('must specify mode "WORK" or "BREAK"')
    }
    if (this.onReset != null) {
      this.onReset(this.time, this.#mode)
    }
    if (this.autoStart) {
      this.start()
    }
  }

  /**
   * tick the timer
   */
  #tick() {
    this.time -= TICK
    if (this.time < 0) {
      this.time = 0
    }
    if (this.onTick != null) {
      this.onTick(this.time, this.mode)
    }
    if (this.time === 0) {
      this.pause()
      if (this.onFinish != null) {
        this.onFinish(this.time, this.mode)
      }
    }
  }

  get isPlaying() {
    return this.#handler != null
  }

  get mode() {
    return this.#mode
  }
}

export default Pomodoro
export {
  MODE
}
